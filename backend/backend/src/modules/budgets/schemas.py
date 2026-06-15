from pydantic import BaseModel, ConfigDict


class DepartmentBudgetCreate(BaseModel):
    department: str
    fiscal_year: int
    total_budget: float


class DepartmentBudgetUpdate(BaseModel):
    total_budget: float


class DepartmentBudgetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    department: str
    fiscal_year: int
    total_budget: float


class BudgetCheckResult(BaseModel):
    has_budget: bool
    total_budget: float
    spent: float
    reserved: float
    remaining: float
    remaining_after: float
    utilization_pct: int

class DepartmentBudgetSummary(BaseModel):
    id: int
    department: str
    fiscal_year: int
    total_budget: float
    spent: float
    reserved: float
    remaining: float
    utilization_pct: int