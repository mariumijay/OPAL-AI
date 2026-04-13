from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from services.supabase_client import get_supabase
from models.organ_donor import OrganDonor, OrganDonorCreate, OrganDonorUpdate
import uuid

router = APIRouter(prefix="/api/organ-donors", tags=["Organ Donors"])

@router.get("/", response_model=List[OrganDonor])
def list_organ_donors():
    """Lists all available organ donors."""
    supabase = get_supabase()
    response = supabase.table("organ_donors").select("*").eq("is_available", True).execute()
    return response.data

@router.get("/{id}", response_model=OrganDonor)
def get_donor(id: uuid.UUID):
    """Retrieves an organ donor by ID."""
    supabase = get_supabase()
    response = supabase.table("organ_donors").select("*").eq("id", str(id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Organ donor not found")
    return response.data[0]

@router.post("/", response_model=OrganDonor, status_code=status.HTTP_201_CREATED)
def register_donor(donor: OrganDonorCreate):
    """Registers a new organ donor. Consent must be True (validated in Pydantic)."""
    supabase = get_supabase()
    data = donor.model_dump()
    response = supabase.table("organ_donors").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to register organ donor")
    return response.data[0]

@router.put("/{id}", response_model=OrganDonor)
def update_donor(id: uuid.UUID, donor: OrganDonorUpdate):
    """Updates an organ donor's details."""
    supabase = get_supabase()
    data = donor.model_dump(exclude_unset=True)
    response = supabase.table("organ_donors").update(data).eq("id", str(id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Organ donor not found or update failed")
    return response.data[0]

@router.delete("/{id}")
def delete_donor(id: uuid.UUID):
    """Removes an organ donor."""
    supabase = get_supabase()
    response = supabase.table("organ_donors").delete().eq("id", str(id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Organ donor not found")
    return {"message": "Organ donor removed successfully"}

@router.get("/search", response_model=List[OrganDonor])
def search_organ_donors(
    organ: Optional[str] = Query(None),
    blood_type: Optional[str] = Query(None)
):
    """Searches organ donors by specific organ and blood type."""
    supabase = get_supabase()
    query = supabase.table("organ_donors").select("*").eq("is_available", True)
    
    if organ:
        query = query.contains("organs_available", [organ.lower()])
    if blood_type:
        query = query.eq("blood_type", blood_type)
        
    response = query.execute()
    return response.data
