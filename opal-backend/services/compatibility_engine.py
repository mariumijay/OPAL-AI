from typing import List, Dict, Tuple, Any, Optional
from pydantic import BaseModel
from math import radians, cos, sin, asin, sqrt

# Clinical Grade Disclaimer
MODEL_DISCLAIMER = (
    "CLINICAL DECISION SUPPORT: This engine uses established medical parameters "
    "for blood compatibility and Cold Ischemia Time (CIT). Final allocation "
    "decisions must be made by a certified transplant coordinator."
)

class FilterStats(BaseModel):
    total: int = 0
    failed_blood: int = 0
    failed_age: int = 0
    failed_condition: int = 0
    failed_cit: int = 0  # New: Cold Ischemia Time failure
    passed: int = 0

# Updated Age Limits per International Registry Standards
ORGAN_AGE_LIMITS = {
    "Heart": (8, 45),
    "Lung": (8, 55),
    "Kidney": (2, 70),
    "Liver": (2, 70),
    "Pancreas": (2, 60),
    "Cornea": (2, 85),
    "Bone Marrow": (18, 60),  # Legal Registry Age (18+)
    "Skin": (2, 75),
    "Plasma": (18, 70),       # Clinical Consent Age (18+)
    "Platelet": (18, 70),
}

# Maximum allowed Cold Ischemia Time (hours)
# These are strict medical cut-offs for organ viability
MAX_CIT_HOURS = {
    "Heart": 4.0,       # Critical: 4-6h
    "Lung": 6.0,        # Critical: 6h
    "Liver": 12.0,      # 12-24h
    "Pancreas": 12.0,   # 12-24h
    "Kidney": 24.0,     # Robust: 24-36h
    "Cornea": 96.0,     # Stored in media
}

class TransportViabilityService:
    @staticmethod
    def estimate_travel_time(distance_km: float, transport_type: str = "ambulance") -> float:
        """
        Estimates hours based on distance with a buffer for terrain/traffic.
        """
        avg_speed = 70.0 if transport_type == "ambulance" else 400.0  # km/h
        # 1.35 = Real-world friction factor (traffic/road quality)
        friction_factor = 1.35 if transport_type == "ambulance" else 1.1
        return (distance_km * friction_factor) / avg_speed

    @staticmethod
    def is_cit_viable(organ: str, distance_km: float) -> Tuple[bool, float]:
        """Checks if the organ can reach the hospital within the CIT window."""
        est_time = TransportViabilityService.estimate_travel_time(distance_km)
        max_allowed = MAX_CIT_HOURS.get(organ, 12.0)
        return est_time <= max_allowed, est_time

def haversine(lat1, lon1, lat2, lon2):
    """Calculates distance between two points on Earth."""
    R = 6371.0 # Earth radius in km
    dLat = radians(lat2 - lat1)
    dLon = radians(lon2 - lon1)
    a = sin(dLat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon / 2)**2
    c = 2 * asin(sqrt(a))
    return R * c

from services.match_engine import ClinicalLogisticsService as Logistics

# Standard Recipient-Compatibility Matrix for Organs/Blood
STANDARD_MATRIX = {
    "A+": ["A+", "A-", "O+", "O-"],
    "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+": ["O+", "O-"],
    "O-": ["O-"],
}

async def filter_compatible_donors(
    donors: List[Dict[str, Any]],
    required_organs: List[str],
    patient_blood_type: str,
    hospital_lat: float,
    hospital_lon: float,
    donor_category: str = "organ"
) -> Tuple[List[Dict[str, Any]], FilterStats]:
    """
    Surgical Clinical Filter with Road-Logistics and Inverse Bio-Matrix.
    """
    stats = FilterStats(total=len(donors))
    compatible_donors = []
    
    # 🧬 1. Sourcing Matrix (Organ vs Plasma)
    matrix = Logistics.get_clinical_matrix(donor_category)
    # Handle Plasma category specifically for ABO mapping (O recipient for Plasma)
    lookup_type = "O" if "O" in patient_blood_type and donor_category == "plasma" else patient_blood_type

    # 🧬 2. Collect Candidate Coordinates for Batch Road Scaling
    destinations = []
    valid_coord_donors = []
    for d in donors:
        if d.get('latitude') and d.get('longitude'):
            destinations.append((d['latitude'], d['longitude']))
            valid_coord_donors.append(d)
        else:
            stats.failed_cit += 1

    # 🧬 3. Execute Road-Network Call (OSRM)
    road_metrics = []
    if destinations:
        road_metrics = await Logistics.get_road_metrics((hospital_lat, hospital_lon), destinations)

    # 🧬 4. Final Bio-Logistics Gating
    for i, donor in enumerate(valid_coord_donors):
        # A. Age Disqualification (Legal Adult 18+)
        if donor.get('age', 0) < 18:
            stats.failed_age += 1
            continue

        # B. Bio-Matrix Disqualification
        donor_blood = donor.get('blood_type', '').split('+')[0].split('-')[0] if donor_category == "plasma" else donor.get('blood_type')
        if donor_blood not in matrix.get(lookup_type, []):
            stats.failed_blood += 1
            continue

        # C. CIT Road-Viability Disqualification
        if i < len(road_metrics):
            metrics = road_metrics[i]
            travel_hours = metrics['duration_hours']
            
            viable = True
            for organ in required_organs:
                if not Logistics.is_cit_viable(organ, travel_hours):
                    viable = False
                    break
            
            if not viable:
                stats.failed_cit += 1
                continue
            
            donor['road_distance_km'] = metrics['distance_km']
            donor['travel_time_hours'] = travel_hours
            donor['travel_time_human'] = f"{int(travel_hours)}h {int((travel_hours % 1) * 60)}m"
        else:
            stats.failed_cit += 1
            continue

        # D. Health Gate
        if donor.get('hiv_status') == "Positive":
            stats.failed_condition += 1
            continue

        compatible_donors.append(donor)
        stats.passed += 1

    return compatible_donors, stats
