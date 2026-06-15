from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ...infrastructure.database.models import TimestampMixin
from ...infrastructure.database.session import Base


class Vendor(TimestampMixin, Base):
    __tablename__ = "vendors"

    id: Mapped[int] = mapped_column(autoincrement=True, primary_key=True, unique=True, init=False)
    name: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(20), default="pending")
    contact_email: Mapped[str | None] = mapped_column(String(200), default="None")
    website: Mapped[str | None] = mapped_column(String(200), default="None")
    notes: Mapped[str | None] = mapped_column(Text, default="None")