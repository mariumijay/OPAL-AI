from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class HospitalBase(BaseModel):
    hospital_name: str
    email: EmailStr
    phone: str
    city: str
    latitude: float
    longitude: float
    license_number: str
    is_verified: bool = False

class HospitalCreate(HospitalBase):
    pass

class HospitalUpdate(BaseModel):
    hospital_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    license_number: Optional[str] = None
    is_verified: Optional[bool] = None

class Hospital(HospitalBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
