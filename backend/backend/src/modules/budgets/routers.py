from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...infrastructure.auth.session.dependencies import RequireFinanceDep
from ...infrastructure.database.session import async_session
from ..purchase_requests.enums import PurchaseRequestStatus
from ..purchase_requests.models import PurchaseRequest
from .models import DepartmentBudget
from .schemas import (
    DepartmentBudgetCreate,
    DepartmentBudgetRead,
    DepartmentBudgetSummary,
    DepartmentBudgetUpdate,
)

PENDING_STATUSES = [
    PurchaseRequestStatus.PENDING_MANAGER,
    PurchaseRequestStatus.PENDING_DEPARTMENT_HEAD,
    PurchaseRequestStatus.PENDING_FINANCE,
    PurchaseRequestStatus.PENDING_PROCUREMENT,
]

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("/summary", response_model=list[DepartmentBudgetSummary])
async def get_budgets_summary(current_user: RequireFinanceDep, db: AsyncSession = Depends(async_session)):
    year = datetime.now().year
    budgets = (await db.execute(select(DepartmentBudget))).scalars().all()

    result = []
    for budget in budgets:
        spent = float((await db.execute(
            select(func.coalesce(func.sum(PurchaseRequest.estimated_budget), 0)).where(
                PurchaseRequest.department == budget.department,
                PurchaseRequest.status == PurchaseRequestStatus.APPROVED,
                func.extract("year", PurchaseRequest.created_at) == year,
            )
        )).scalar_one() or 0)

        reserved = float((await db.execute(
            select(func.coalesce(func.sum(PurchaseRequest.estimated_budget), 0)).where(
                PurchaseRequest.department == budget.department,
                PurchaseRequest.status.in_(PENDING_STATUSES),
                func.extract("year", PurchaseRequest.created_at) == year,
            )
        )).scalar_one() or 0)

        total = float(budget.total_budget)
        remaining = total - spent - reserved
        utilization_pct = round((spent + reserved) / total * 100) if total > 0 else 0

        result.append(DepartmentBudgetSummary(
            id=budget.id,
            department=budget.department,
            fiscal_year=budget.fiscal_year,
            total_budget=total,
            spent=spent,
            reserved=reserved,
            remaining=remaining,
            utilization_pct=min(utilization_pct, 100),
        ))

    return result


@router.get("/", response_model=list[DepartmentBudgetRead])
async def list_budgets(current_user: RequireFinanceDep, db: AsyncSession = Depends(async_session)):
    result = await db.execute(select(DepartmentBudget))
    return result.scalars().all()


@router.post("/", response_model=DepartmentBudgetRead)
async def create_budget(current_user: RequireFinanceDep, body: DepartmentBudgetCreate, db: AsyncSession = Depends(async_session)):
    budget = DepartmentBudget(
        department=body.department,
        fiscal_year=body.fiscal_year,
        total_budget=Decimal(str(body.total_budget)),
    )
    db.add(budget)
    await db.commit()
    await db.refresh(budget)
    return budget


@router.put("/{budget_id}", response_model=DepartmentBudgetRead)
async def update_budget(current_user: RequireFinanceDep, budget_id: int, body: DepartmentBudgetUpdate, db: AsyncSession = Depends(async_session)):
    result = await db.execute(select(DepartmentBudget).where(DepartmentBudget.id == budget_id))
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    budget.total_budget = Decimal(str(body.total_budget))
    await db.commit()
    await db.refresh(budget)
    return budget


@router.delete("/{budget_id}", status_code=204)
async def delete_budget(current_user: RequireFinanceDep, budget_id: int, db: AsyncSession = Depends(async_session)):
    result = await db.execute(select(DepartmentBudget).where(DepartmentBudget.id == budget_id))
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    await db.delete(budget)
    await db.commit()
