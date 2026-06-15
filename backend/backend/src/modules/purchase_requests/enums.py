from enum import StrEnum


class PurchaseRequestStatus(StrEnum):
    DRAFT = "draft"
    PENDING_MANAGER = "pending_manager"
    PENDING_DEPARTMENT_HEAD = "pending_department_head"
    PENDING_FINANCE = "pending_finance"
    PENDING_PROCUREMENT = "pending_procurement"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_INFO = "needs_info"


class RiskLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
