from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

from .enums import PurchaseRequestStatus, RiskLevel


#input schema
class PurchaseRequestCreate(BaseModel):
    raw_text: str
    requester_name: str | None = None


class PurchaseRequestCreateInternal(BaseModel):
    raw_text: str
    requester_name: str | None = None
    requester_id: int | None = None


class RequestMoreInfoCreate(BaseModel):
    message: str



class InfoRequestResponseCreate(BaseModel):
    message: str


class ApprovalStep(BaseModel):
    role: str
    status: Literal["complete", "current", "upcoming"]


#update schema
class PurchaseRequestUpdate(BaseModel):
    title: str | None = None
    category: str | None = None
    item: str | None = None
    quantity: int | None = None
    estimated_budget: float | None = None
    requirements: list[str] | None = None
    needed_by: str | None = None
    department: str | None = None
    status: PurchaseRequestStatus | None = None
    risk_level: RiskLevel | None = None
    risk_score: int | None = None
    recommendation: str | None = None
    policy_flags: list[str] | None = None
    info_request_message: str | None = None
    info_response_message: str | None = None
#Response Schema
class PurchaseRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    raw_text: str
    title: str | None
    category: str | None
    item: str | None
    quantity: int
    estimated_budget: float | None
    requirements: list[str]
    needed_by: str | None
    department: str | None
    status: PurchaseRequestStatus
    risk_level: RiskLevel | None
    risk_score: int | None
    recommendation: str | None
    policy_flags: list[str] = []
    info_request_message: str | None
    info_response_message: str | None
    requester_name: str | None
    requester_id: int | None
    created_at: datetime
    updated_at: datetime | None



class PurchaseRequestEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    event: str
    actor: str
    created_at: datetime


class PurchaseRequestDetail(PurchaseRequestRead):
    approval_chain: list[ApprovalStep]
    audit_log: list[PurchaseRequestEventRead] = []


class PurchaseRequestListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str | None
    department: str | None
    estimated_budget: float | None
    status: PurchaseRequestStatus
    risk_level: RiskLevel | None
    requester_name: str | None
    requester_id: int | None
    created_at: datetime | None

