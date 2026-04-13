from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Literal, Optional, List
from datetime import datetime
from uuid import UUID

class OrganDonorBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    age: int = Field(..., ge=18, le=65)
    blood_type: Literal["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    organs_available: List[str] = Field(..., min_items=1)
    hiv_status: Literal["Negative", "Positive"]
    hepatitis_status: Literal["Negative", "Positive"]
    diabetes: bool
    smoker: bool
    height_cm: float = Field(..., ge=100, le=250)
    weight_kg: float = Field(..., ge=30, le=300)
    is_living_donor: bool
    next_of_kin_name: str
    next_of_kin_contact: str
    consent_given: bool = Field(..., description="Must be True to register")
    city: str
    latitude: float
    longitude: float
    is_available: bool = True

    @field_validator('organs_available')
    @classmethod
    def validate_organs(cls, v: List[str]) -> List[str]:
        allowed = {"kidney", "liver", "heart", "lungs", "corneas", "pancreas", "bone_marrow"}
        for organ in v:
            if organ.lower() not in allowed:
                raise ValueError(f"Invalid organ type: {organ}")
        return v

    @field_validator('consent_given')
    @classmethod
    def validate_consent(cls, v: bool) -> bool:
        if v is not True:
            raise ValueError('Consent must be given to register as an organ donor')
        return v

class OrganDonorCreate(OrganDonorBase):
    pass

class OrganDonorUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    age: Optional[int] = Field(None, ge=18, le=65)
    blood_type: Optional[Literal["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]] = None
    organs_available: Optional[List[str]] = None
    hiv_status: Optional[Literal["Negative", "Positive"]] = None
    hepatitis_status: Optional[Literal["Negative", "Positive"]] = None
    diabetes: Optional[bool] = None
    smoker: Optional[bool] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    is_living_donor: Optional[bool] = None
    next_of_kin_name: Optional[str] = None
    next_of_kin_contact: Optional[str] = None
    consent_given: Optional[bool] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_available: Optional[bool] = None

class OrganDonor(OrganDonorBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
