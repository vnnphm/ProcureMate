from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...infrastructure.auth.session.dependencies import RequireFinanceDep
from ...infrastructure.database.session import async_session
from .models import Vendor
from .schemas import VendorCreate, VendorRead, VendorUpdate


router = APIRouter(prefix="/vendors", tags=["Vendors"])

@router.get("/", response_model=list[VendorRead])
async def list_vendors(current_user: RequireFinanceDep, db: AsyncSession = Depends(async_session)):
    result = await db.execute(select(Vendor).order_by(Vendor.name))
    return result.scalars().all()


@router.post("/", response_model=VendorRead, status_code=201)
async def create_vendor(current_user: RequireFinanceDep, body: VendorCreate, db: AsyncSession = Depends(async_session)):
    vendor = Vendor(
        name=body.name,
        category=body.category,
        status=body.status,
        contact_email=body.contact_email,
        website=body.website,
        notes=body.notes,
    )
    db.add(vendor)
    await db.commit()
    await db.refresh(vendor)
    return vendor

@router.put("/{vendor_id}", response_model=VendorRead)
async def update_vendor(current_user: RequireFinanceDep, vendor_id: int, body: VendorUpdate, db: AsyncSession = Depends(async_session)):
    result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    vendor = result.scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(vendor, field, value)
    await db.commit()
    await db.refresh(vendor)
    return vendor

@router.delete("/{vendor_id}", status_code=204)
async def delete_vendor(current_user: RequireFinanceDep, vendor_id: int, db: AsyncSession = Depends(async_session)):
    result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    vendor = result.scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    await db.delete(vendor)
    await db.commit()
