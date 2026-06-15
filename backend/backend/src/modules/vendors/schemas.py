from pydantic import BaseModel


class VendorCreate(BaseModel):
    name: str
    category: str
    status: str = "pending"
    contact_email: str | None = None
    website: str | None = None
    notes: str | None = None


class VendorUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    status: str | None = None
    contact_email: str | None = None
    website: str | None = None
    notes: str | None = None


class VendorRead(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    category: str
    status: str
    contact_email: str | None
    website: str | None
    notes: str | None
