from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from services.supabase_client import get_supabase
from models.blood_donor import BloodDonor, BloodDonorCreate, BloodDonorUpdate
import uuid

router = APIRouter(prefix="/api/blood-donors", tags=["Blood Donors"])

@router.get("/", response_model=List[BloodDonor])
def list_blood_donors():
    """Lists all available blood donors from Supabase."""
    supabase = get_supabase()
    response = supabase.table("blood_donors").select("*").eq("is_available", True).execute()
    return response.data

@router.get("/{id}", response_model=BloodDonor)
def get_donor(id: uuid.UUID):
    """Retrieves a single blood donor by ID."""
    supabase = get_supabase()
    response = supabase.table("blood_donors").select("*").eq("id", str(id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Blood donor not found")
    return response.data[0]

@router.post("/", response_model=BloodDonor, status_code=status.HTTP_201_CREATED)
def register_donor(donor: BloodDonorCreate):
    """Registers a new blood donor."""
    supabase = get_supabase()
    data = donor.model_dump()
    response = supabase.table("blood_donors").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to register blood donor")
    return response.data[0]

@router.put("/{id}", response_model=BloodDonor)
def update_donor(id: uuid.UUID, donor: BloodDonorUpdate):
    """Updates an existing blood donor's details."""
    supabase = get_supabase()
    data = donor.model_dump(exclude_unset=True)
    response = supabase.table("blood_donors").update(data).eq("id", str(id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Blood donor not found or update failed")
    return response.data[0]

@router.delete("/{id}")
def delete_donor(id: uuid.UUID):
    """Removes a blood donor from the system."""
    supabase = get_supabase()
    response = supabase.table("blood_donors").delete().eq("id", str(id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Blood donor not found")
    return {"message": "Blood donor removed successfully"}

@router.get("/search", response_model=List[BloodDonor])
def search_donors(
    blood_type: Optional[str] = Query(None),
    city: Optional[str] = Query(None)
):
    """Searches for blood donors filtered by blood type and city."""
    supabase = get_supabase()
    query = supabase.table("blood_donors").select("*").eq("is_available", True)
    
    if blood_type:
        query = query.eq("blood_type", blood_type)
    if city:
        query = query.ilike("city", f"%{city}%")
        
    response = query.execute()
    return response.data
