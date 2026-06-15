from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...infrastructure.auth.session.dependencies import CurrentUserDep, RequireManagerDep
from ...infrastructure.database.session import async_session
from ..budgets.models import DepartmentBudget
from ..budgets.schemas import BudgetCheckResult
from .approval_chain import build_approval_chain, next_approval_status
from .crud import crud_purchase_requests
from .enums import PurchaseRequestStatus
from .intake import extract_purchase_request, generate_recommendation
from .models import PurchaseRequest, PurchaseRequestEvent
from .risk import assess_purchase_request
from .schemas import (
    InfoRequestResponseCreate,
    PurchaseRequestCreate,
    PurchaseRequestCreateInternal,
    PurchaseRequestDetail,
    PurchaseRequestListItem,
    PurchaseRequestRead,
    PurchaseRequestUpdate,
    RequestMoreInfoCreate,
)

router = APIRouter(prefix="/purchase-requests", tags=["Purchase Requests"])


def add_approval_chain(request: BaseModel | dict) -> dict:
    request_data = request.model_dump() if isinstance(request, BaseModel) else dict(request)
    request_data["approval_chain"] = build_approval_chain(
        request_data.get("estimated_budget"),
        PurchaseRequestStatus(request_data["status"]),
    )
    return request_data


STATUS_ACTOR: dict[PurchaseRequestStatus, str] = {
    PurchaseRequestStatus.PENDING_MANAGER: "Manager",
    PurchaseRequestStatus.PENDING_DEPARTMENT_HEAD: "Department Head",
    PurchaseRequestStatus.PENDING_FINANCE: "Finance",
    PurchaseRequestStatus.PENDING_PROCUREMENT: "Procurement",
}

STEP_ROLES: dict[PurchaseRequestStatus, set[str]] = {
    PurchaseRequestStatus.PENDING_MANAGER: {"manager", "admin"},
    PurchaseRequestStatus.PENDING_DEPARTMENT_HEAD: {"manager", "admin"},
    PurchaseRequestStatus.PENDING_FINANCE: {"finance", "admin"},
    PurchaseRequestStatus.PENDING_PROCUREMENT: {"finance", "admin"},
}


def check_step_permission(status: PurchaseRequestStatus, current_user: dict) -> None:
    if current_user.get("is_superuser"):
        return
    allowed = STEP_ROLES.get(status, set())
    if current_user.get("role") not in allowed:
        raise HTTPException(status_code=403, detail="Your role cannot act on this approval step")


def get_request_status(request: PurchaseRequestRead | dict) -> PurchaseRequestStatus:
    status = request.status if isinstance(request, PurchaseRequestRead) else request["status"]
    return PurchaseRequestStatus(status)


def get_request_estimated_budget(request: PurchaseRequestRead | dict) -> float | None:
    budget = request.estimated_budget if isinstance(request, PurchaseRequestRead) else request["estimated_budget"]
    return float(budget) if budget is not None else None


async def get_existing_purchase_request(db: AsyncSession, request_id: int) -> PurchaseRequestRead | dict:
    request = await crud_purchase_requests.get(
        db,
        id=request_id,
        schema_to_select=PurchaseRequestRead,
    )
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return request


async def update_request_status(
    db: AsyncSession,
    request_id: int,
    status: PurchaseRequestStatus,
    info_request_message: str | None = None,
) -> dict:
    await crud_purchase_requests.update(
        db,
        object=PurchaseRequestUpdate(
            status=status,
            info_request_message=info_request_message,
        ),
        id=request_id,
    )

    request = await get_existing_purchase_request(db, request_id)
    return await build_detail_response(db, request, request_id)


async def record_event(db: AsyncSession, request_id: int, event: str, actor: str) -> None:
    db.add(PurchaseRequestEvent(
        purchase_request_id=request_id,
        event=event,
        actor=actor,
    ))
    await db.flush()

async def get_audit_log(db: AsyncSession, request_id: int) -> list[PurchaseRequestEvent]:
    result = await db.execute(
        select(PurchaseRequestEvent)
        .where(PurchaseRequestEvent.purchase_request_id == request_id)
        .order_by(PurchaseRequestEvent.created_at.desc())
    )
    return list(result.scalars().all())


async def build_detail_response(db: AsyncSession, request: PurchaseRequestRead | dict, request_id: int) -> dict:
    data = add_approval_chain(request)
    data["audit_log"] = await get_audit_log(db, request_id)
    return data


@router.post("/", response_model=PurchaseRequestDetail)
async def create_purchase_request(
    current_user: CurrentUserDep,
    body: PurchaseRequestCreate,
    db: AsyncSession = Depends(async_session),
):
    created = await crud_purchase_requests.create(
        db,
        object=PurchaseRequestCreateInternal(
            raw_text=body.raw_text,
            requester_name=body.requester_name or current_user.get("name") or current_user.get("username"),
            requester_id=current_user["id"],
        ),
        schema_to_select=PurchaseRequestRead,
    )

    extracted = await extract_purchase_request(body.raw_text)
    assessed = assess_purchase_request(extracted)
    recommendation = await generate_recommendation(body.raw_text, assessed)
    assessed = assessed.model_copy(update={"recommendation": recommendation})

    request_id = created["id"]

    await crud_purchase_requests.update(
        db,
        object=assessed,
        id=request_id,
    )

    await record_event(db, request_id, "Request submitted", body.requester_name or "Unknown")

    request = await crud_purchase_requests.get(
        db,
        id=request_id,
        schema_to_select=PurchaseRequestRead,
    )
    assert request is not None
    return await build_detail_response(db, request, request_id)


@router.get("/", response_model=list[PurchaseRequestListItem])
async def get_purchase_requests(
    current_user: CurrentUserDep,
    db: AsyncSession = Depends(async_session),
):
    result = await crud_purchase_requests.get_multi(db)
    return result["data"]


@router.get("/{request_id}", response_model=PurchaseRequestDetail)
async def get_purchase_request(
    current_user: CurrentUserDep,
    request_id: int,
    db: AsyncSession = Depends(async_session),
):
    request = await get_existing_purchase_request(db, request_id)
    return await build_detail_response(db, request, request_id)


@router.post("/{request_id}/approve", response_model=PurchaseRequestDetail)
async def approve_purchase_request(
    current_user: RequireManagerDep,
    request_id: int,
    db: AsyncSession = Depends(async_session),
):
    request = await get_existing_purchase_request(db, request_id)
    check_step_permission(get_request_status(request), current_user)
    actor = STATUS_ACTOR.get(get_request_status(request), "Finance")
    await record_event(db, request_id, "Approved", actor)
    return await update_request_status(
        db,
        request_id,
        next_approval_status(
            get_request_estimated_budget(request),
            get_request_status(request),
        ),
    )


@router.post("/{request_id}/reject", response_model=PurchaseRequestDetail)
async def reject_purchase_request(
    current_user: RequireManagerDep,
    request_id: int,
    db: AsyncSession = Depends(async_session),
):
    request = await get_existing_purchase_request(db, request_id)
    check_step_permission(get_request_status(request), current_user)
    actor = STATUS_ACTOR.get(get_request_status(request), "Finance")
    await record_event(db, request_id, "Rejected", actor)
    return await update_request_status(
        db,
        request_id,
        PurchaseRequestStatus.REJECTED,
    )


@router.post("/{request_id}/request-more-info", response_model=PurchaseRequestDetail)
async def request_more_info(
    current_user: RequireManagerDep,
    request_id: int,
    body: RequestMoreInfoCreate,
    db: AsyncSession = Depends(async_session),
):
    request = await get_existing_purchase_request(db, request_id)
    check_step_permission(get_request_status(request), current_user)
    actor = STATUS_ACTOR.get(get_request_status(request), "Finance")
    await record_event(db, request_id, "More info requested", actor)
    return await update_request_status(
        db,
        request_id,
        PurchaseRequestStatus.NEEDS_INFO,
        body.message,
    )


@router.post("/{request_id}/respond-info-request", response_model=PurchaseRequestDetail)
async def respond_info_request(
    current_user: CurrentUserDep,
    request_id: int,
    body: InfoRequestResponseCreate,
    db: AsyncSession = Depends(async_session),
):
    request = await get_existing_purchase_request(db, request_id)

    requester_id = request.requester_id if isinstance(request, PurchaseRequestRead) else request.get("requester_id")
    if requester_id and requester_id != current_user["id"] and not current_user.get("is_superuser"):
        raise HTTPException(status_code=403, detail="Only the requester can respond to info requests")

    if get_request_status(request) != PurchaseRequestStatus.NEEDS_INFO:
        raise HTTPException(status_code=400, detail="Request is not waiting for more info")

    await crud_purchase_requests.update(
        db,
        object=PurchaseRequestUpdate(
            status=PurchaseRequestStatus.PENDING_MANAGER,
            info_response_message=body.message,
        ),
        id=request_id,
    )

    await record_event(db, request_id, "Requester responded", "Requester")
    request = await get_existing_purchase_request(db, request_id)
    return await build_detail_response(db, request, request_id)


@router.delete("/{request_id}", status_code=204)
async def delete_purchase_request(
    current_user: RequireManagerDep,
    request_id: int,
    db: AsyncSession = Depends(async_session),
):
    await get_existing_purchase_request(db, request_id)
    await crud_purchase_requests.delete(db, id=request_id)


@router.patch("/{request_id}", response_model=PurchaseRequestDetail)
async def update_purchase_request(
    current_user: CurrentUserDep,
    request_id: int,
    body: PurchaseRequestUpdate,
    db: AsyncSession = Depends(async_session),
):
    request = await crud_purchase_requests.get(db, id=request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    await crud_purchase_requests.update(
        db,
        object=body,
        id=request_id,
    )

    request = await crud_purchase_requests.get(
        db,
        id=request_id,
        schema_to_select=PurchaseRequestRead,
    )
    assert request is not None
    return await build_detail_response(db, request, request_id)

PENDING_STATUSES = [
    PurchaseRequestStatus.PENDING_MANAGER,
    PurchaseRequestStatus.PENDING_DEPARTMENT_HEAD,
    PurchaseRequestStatus.PENDING_FINANCE,
    PurchaseRequestStatus.PENDING_PROCUREMENT,
]

@router.get("/{request_id}/budget-check", response_model=BudgetCheckResult)
async def get_budget_check(current_user: CurrentUserDep, request_id: int, db: AsyncSession = Depends(async_session)):
    request = await crud_purchase_requests.get(db, id=request_id, schema_to_select=PurchaseRequestRead)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    department = request["department"]
    this_budget = request["estimated_budget"] or 0
    year = datetime.now().year

    if not department:
        return BudgetCheckResult(has_budget=False, total_budget= 0, spent=0, reserved=0, remaining=0,
                                 remaining_after=0, utilization_pct=0)
    budget_row = (await db.execute(
        select(DepartmentBudget).where(
            DepartmentBudget.department == department,
            DepartmentBudget.fiscal_year == year,
        )
    )).scalar_one_or_none()

    if not budget_row:
        return BudgetCheckResult(has_budget=False, total_budget= 0, spent=0, reserved=0, remaining=0,
                                 remaining_after=0, utilization_pct=0)

    spent = float((await db.execute(
        select(func.coalesce(func.sum(PurchaseRequest.estimated_budget), 0)).where(
            PurchaseRequest.department == department,
            PurchaseRequest.status == PurchaseRequestStatus.APPROVED,
            func.extract("year", PurchaseRequest.created_at) == year,
            PurchaseRequest.id != request_id,
        )
    )).scalar_one() or 0)

    reserved = float((await db.execute(
        select(func.coalesce(func.sum(PurchaseRequest.estimated_budget), 0)).where(
            PurchaseRequest.department == department,
            PurchaseRequest.status.in_(PENDING_STATUSES),
            func.extract("year", PurchaseRequest.created_at) == year,
            PurchaseRequest.id != request_id,
        )
    )).scalar_one() or 0)

    total = float(budget_row.total_budget)
    remaining = total - spent - reserved
    remaining_after=remaining - float(this_budget)
    utilization_pct=round((spent + reserved) / total * 100) if total > 0 else 0

    return BudgetCheckResult(
        has_budget=True,
        total_budget=total,
        spent=spent,
        reserved=reserved,
        remaining=remaining,
        remaining_after=remaining_after,
        utilization_pct=min(utilization_pct, 100)
    )



