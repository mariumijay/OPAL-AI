from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Literal, Optional
from datetime import datetime
from uuid import UUID

class BloodDonorBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    age: int = Field(..., ge=18, le=65)
    blood_type: Literal["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    hepatitis_status: Literal["Negative", "Positive"]
    medical_conditions: Optional[str] = None
    city: str
    latitude: float
    longitude: float
    is_available: bool = True

    @field_validator('age')
    @classmethod
    def validate_age(cls, v: int) -> int:
        if not 18 <= v <= 65:
            raise ValueError('Age must be between 18 and 65')
        return v

class BloodDonorCreate(BloodDonorBase):
    pass

class BloodDonorUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    age: Optional[int] = Field(None, ge=18, le=65)
    blood_type: Optional[Literal["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]] = None
    hepatitis_status: Optional[Literal["Negative", "Positive"]] = None
    medical_conditions: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_available: Optional[bool] = None

class BloodDonor(BloodDonorBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
