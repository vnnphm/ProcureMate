from decimal import Decimal

from sqlalchemy import Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from ...infrastructure.database.models import TimestampMixin
from ...infrastructure.database.session import Base


class DepartmentBudget(Base, TimestampMixin):
    __tablename__ = "department_budgets"
    __table_args__ = (UniqueConstraint("department", "fiscal_year"),)

    id: Mapped[int] = mapped_column(autoincrement=True, primary_key=True, unique=True, init=False)
    department: Mapped[str] = mapped_column(String(100))
    fiscal_year: Mapped[int] = mapped_column(Integer)
    total_budget: Mapped[Decimal] = mapped_column(Numeric(12,2))



