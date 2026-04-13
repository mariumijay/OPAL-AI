from fastapi import APIRouter, HTTPException, status
from typing import List
from services.supabase_client import get_supabase
from services.matching_engine import calculate_match_results, is_blood_compatible
from models.match import MatchRequest, MatchResults
import uuid

router = APIRouter(prefix="/api/matching", tags=["Matching"])

@router.post("/blood", response_model=MatchResults)
def match_blood(request: MatchRequest):
    """Matches available blood donors to a hospital request based on blood type and distance."""
    supabase = get_supabase()
    
    # 1. Verify Hospital (Must be verified to request matching)
    h_resp = supabase.table("hospitals").select("*").eq("id", str(request.hospital_id)).execute()
    if not h_resp.data:
        raise HTTPException(status_code=404, detail="Hospital not found")
    hospital = h_resp.data[0]
    
    if not hospital.get("is_verified", False):
        raise HTTPException(status_code=403, detail="Hospital must be verified to use matching services")
    
    # 2. Get available donors of the specific blood type
    d_resp = supabase.table("blood_donors")\
        .select("*")\
        .eq("blood_type", request.required_blood_type)\
        .eq("is_available", True)\
        .execute()
    
    donors = d_resp.data
    if not donors:
        return MatchResults(matches=[], message="No donors of this blood type found")
    
    # 3. Calculate distance and filter (top 10 closest)
    matches = calculate_match_results(
        donors, 
        hospital["latitude"], 
        hospital["longitude"], 
        request.max_distance_km
    )
    
    msg = f"Found {len(matches)} matches within {request.max_distance_km}km" if matches else "No matches found within search radius"
    return MatchResults(matches=matches, message=msg)

@router.post("/organ", response_model=MatchResults)
def match_organ(request: MatchRequest):
    """
    Matches organ donors based on:
    1. Organ availability
    2. Blood type compatibility
    3. Health status (HIV/Hepatitis Negative)
    4. Distance
    """
    if not request.required_organ:
        raise HTTPException(status_code=400, detail="required_organ is required for organ matching")
        
    supabase = get_supabase()
    
    # 1. Verify Hospital
    h_resp = supabase.table("hospitals").select("*").eq("id", str(request.hospital_id)).execute()
    if not h_resp.data:
        raise HTTPException(status_code=404, detail="Hospital not found")
    hospital = h_resp.data[0]
    
    if not hospital.get("is_verified", False):
        raise HTTPException(status_code=403, detail="Hospital must be verified to use matching services")
    
    # 2. Query donors with matching organ and negative virus status
    d_resp = supabase.table("organ_donors")\
        .select("*")\
        .contains("organs_available", [request.required_organ.lower()])\
        .eq("is_available", True)\
        .eq("hiv_status", "Negative")\
        .eq("hepatitis_status", "Negative")\
        .execute()
        
    donors = d_resp.data
    if not donors:
        return MatchResults(matches=[], message=f"No {request.required_organ} donors found")
        
    # 3. Filter by blood compatibility
    compatible_donors = [
        d for d in donors 
        if is_blood_compatible(d["blood_type"], request.required_blood_type)
    ]
    
    if not compatible_donors:
        return MatchResults(matches=[], message="No compatibility donors found")
        
    # 4. Calculate distance and sort
    matches = calculate_match_results(
        compatible_donors, 
        hospital["latitude"], 
        hospital["longitude"], 
        request.max_distance_km
    )
    
    msg = f"Found {len(matches)} matching organ donors" if matches else "No matches found within search radius"
    return MatchResults(matches=matches, message=msg)
