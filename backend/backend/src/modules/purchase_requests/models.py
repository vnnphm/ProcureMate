from decimal import Decimal

from sqlalchemy import JSON, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ...infrastructure.database.models import TimestampMixin
from ...infrastructure.database.session import Base
from .enums import PurchaseRequestStatus, RiskLevel


class PurchaseRequest(Base, TimestampMixin):
    __tablename__ = "purchase_requests"

    id: Mapped[int] = mapped_column(
        autoincrement=True,
        nullable=False,
        unique=True,
        primary_key=True,
        init=False
    )
    #raw input
    raw_text: Mapped[str] = mapped_column(Text)
    title: Mapped[str | None] = mapped_column(String(200), default=None)
    #AI Extracted Fields
    category: Mapped[str | None] = mapped_column(String(50), default=None)
    item: Mapped[str | None] = mapped_column(String(100), default=None)
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    requirements: Mapped[list[str]] = mapped_column(JSON, default_factory=list)
    estimated_budget: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        default=None,
    )
    needed_by: Mapped[str | None] = mapped_column(String(50), default=None)
    department: Mapped[str | None] = mapped_column(String(100), default=None)
    #workflow fields
    status: Mapped[PurchaseRequestStatus] = mapped_column(
        Enum(PurchaseRequestStatus,
       name="purchase_request_status"),
        default=PurchaseRequestStatus.DRAFT,
    )
    risk_level: Mapped[RiskLevel | None] = mapped_column(
        Enum(RiskLevel, name="purchase_request_risk_level"),
        default=None,
    )
    risk_score: Mapped[int | None] = mapped_column(Integer, default=None)
    recommendation: Mapped[str | None] = mapped_column(Text, default=None)
    policy_flags: Mapped[list[str]] = mapped_column(JSON, default_factory=list)
    info_request_message: Mapped[str | None] = mapped_column(Text, default=None)
    info_response_message: Mapped[str | None] = mapped_column(Text, default=None)
    requester_name: Mapped[str | None] = mapped_column(String(100), default=None)
    requester_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("user.id", ondelete="SET NULL"),
        index=True,
        default=None,
    )


class PurchaseRequestEvent(Base, TimestampMixin):
    __tablename__ = "purchase_request_events"

    id: Mapped[int] = mapped_column(
        autoincrement=True,
        nullable=False,
        unique=True,
        primary_key=True,
        init=False
    )
    purchase_request_id: Mapped[int] = mapped_column(
        ForeignKey("purchase_requests.id", ondelete="CASCADE"),
    )
    event: Mapped[str] = mapped_column(String(200))
    actor: Mapped[str] = mapped_column(String(100))

    def __repr__(self) -> str:
        return f"PurchaseRequestEvent({self.id} - {self.event})"
