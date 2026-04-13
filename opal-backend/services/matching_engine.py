from math import radians, sin, cos, sqrt, atan2
from typing import List, Dict, Any
from models.match import MatchResponse

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the great-circle distance between two points on the earth
    given their longitude and latitude in decimal degrees.
    """
    # Earth radius in kilometers
    R = 6371.0
    
    # Convert decimal degrees to radians
    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)
    
    a = sin(d_lat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    distance = R * c
    return round(distance, 2)

def calculate_match_results(
    donors: List[Dict[str, Any]], 
    hospital_lat: float, 
    hospital_lon: float,
    max_distance: float
) -> List[MatchResponse]:
    """
    Generic matching logic: filters by distance and sorts.
    """
    matches = []
    
    for donor in donors:
        distance = haversine(
            hospital_lat, 
            hospital_lon, 
            donor.get('latitude', 0), 
            donor.get('longitude', 0)
        )
        
        if distance <= max_distance:
            matches.append(MatchResponse(
                id=donor['id'],
                full_name=donor['full_name'],
                blood_type=donor['blood_type'],
                distance_km=distance,
                city=donor['city'],
                phone=donor['phone']
            ))
            
    # Sort by distance (closest first)
    matches.sort(key=lambda x: x.distance_km)
    
    # Return top 10 results
    return matches[:10]

def is_blood_compatible(donor_type: str, recipient_type: str) -> bool:
    """
    Simple blood compatibility logic.
    """
    # For now, following exact match or O- as universal donor
    if donor_type == recipient_type:
        return True
    if donor_type == "O-":
        return True
    return False
