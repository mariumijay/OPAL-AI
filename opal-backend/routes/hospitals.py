from fastapi import APIRouter, HTTPException, status
from typing import List
from services.supabase_client import get_supabase
from models.hospital import Hospital, HospitalCreate, HospitalUpdate
import uuid

router = APIRouter(prefix="/api/hospitals", tags=["Hospitals"])

@router.get("/", response_model=List[Hospital])
def list_hospitals():
    """Lists all verified hospitals."""
    supabase = get_supabase()
    response = supabase.table("hospitals").select("*").eq("is_verified", True).execute()
    return response.data

@router.get("/{id}", response_model=Hospital)
def get_hospital(id: uuid.UUID):
    """Retrieves a hospital by ID."""
    supabase = get_supabase()
    response = supabase.table("hospitals").select("*").eq("id", str(id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return response.data[0]

@router.post("/", response_model=Hospital, status_code=status.HTTP_201_CREATED)
def register_hospital(hospital: HospitalCreate):
    """Registers a new hospital."""
    supabase = get_supabase()
    data = hospital.model_dump()
    response = supabase.table("hospitals").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to register hospital")
    return response.data[0]

@router.put("/{id}", response_model=Hospital)
def update_hospital(id: uuid.UUID, hospital: HospitalUpdate):
    """Updates a hospital's information."""
    supabase = get_supabase()
    data = hospital.model_dump(exclude_unset=True)
    response = supabase.table("hospitals").update(data).eq("id", str(id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Hospital not found or update failed")
    return response.data[0]

@router.delete("/{id}")
def delete_hospital(id: uuid.UUID):
    """Removes a hospital."""
    supabase = get_supabase()
    response = supabase.table("hospitals").delete().eq("id", str(id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return {"message": "Hospital removed successfully"}
