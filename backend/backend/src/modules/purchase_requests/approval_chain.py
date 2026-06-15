from typing import Literal

from .enums import PurchaseRequestStatus

ApprovalStepStatus = Literal["complete", "current", "upcoming"]

ROLE_STATUS: dict[str, PurchaseRequestStatus] = {
    "Manager": PurchaseRequestStatus.PENDING_MANAGER,
    "Department Head": PurchaseRequestStatus.PENDING_DEPARTMENT_HEAD,
    "Finance": PurchaseRequestStatus.PENDING_FINANCE,
}


def approval_roles(estimated_budget: float | None) -> list[str]:
    amount = estimated_budget or 0

    if amount <= 5000:
        return ["Manager"]

    if amount <= 25000:
        return ["Manager", "Department Head"]

    return ["Manager", "Department Head", "Finance"]


def build_approval_chain(
    estimated_budget: float | None,
    current_status: PurchaseRequestStatus,
) -> list[dict[str, ApprovalStepStatus | str]]:
    roles = approval_roles(estimated_budget)

    if current_status == PurchaseRequestStatus.APPROVED:
        return [{"role": role, "status": "complete"} for role in roles]

    current_role = next(
        (role for role in roles if ROLE_STATUS[role] == current_status),
        None,
    )

    if current_role is None:
        return [{"role": role, "status": "upcoming"} for role in roles]

    current_index = roles.index(current_role)
    return [
        {
            "role": role,
            "status": approval_step_status(index, current_index),
        }
        for index, role in enumerate(roles)
    ]


def approval_step_status(index: int, current_index: int) -> ApprovalStepStatus:
    if index < current_index:
        return "complete"

    if index == current_index:
        return "current"

    return "upcoming"


def next_approval_status(
    estimated_budget: float | None,
    current_status: PurchaseRequestStatus,
) -> PurchaseRequestStatus:
    roles = approval_roles(estimated_budget)
    role_statuses = [ROLE_STATUS[role] for role in roles]

    if current_status not in role_statuses:
        return current_status

    current_index = role_statuses.index(current_status)
    if current_index == len(role_statuses) - 1:
        return PurchaseRequestStatus.APPROVED

    return role_statuses[current_index + 1]
