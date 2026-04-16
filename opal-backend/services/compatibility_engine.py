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

def filter_compatible_donors(
    donors: List[Dict[str, Any]],
    required_organs: List[str],
    patient_blood_type: str,
    hospital_lat: float,
    hospital_lon: float
) -> Tuple[List[Dict[str, Any]], FilterStats]:
    """
    Refactored with Cold Ischemia Time and Clinical Age gating.
    """
    stats = FilterStats(total=len(donors))
    compatible_donors = []
    
    # Blood Matrix (Recipient Perspective: Who can GIVE to this recipient)
    COMPATIBLE_BLOOD_FOR_RECIPIENT = {
        "A+": ["A+", "A-", "O+", "O-"],
        "A-": ["A-", "O-"],
        "B+": ["B+", "B-", "O+", "O-"],
        "B-": ["B-", "O-"],
        "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        "AB-": ["A-", "B-", "AB-", "O-"],
        "O+": ["O+", "O-"],
        "O-": ["O-"],
    }

    for donor in donors:
        # 1. Age Gating (Clinical Registry Compliance)
        donor_age = donor.get('age', 0)
        age_passed = True
        for organ in required_organs:
            if organ in ORGAN_AGE_LIMITS:
                min_age, max_age = ORGAN_AGE_LIMITS[organ]
                if not (min_age <= donor_age <= max_age):
                    age_passed = False
                    break
        if not age_passed:
            stats.failed_age += 1
            continue

        # 2. Blood Gating
        if donor.get('blood_type') not in COMPATIBLE_BLOOD_FOR_RECIPIENT.get(patient_blood_type, []):
            stats.failed_blood += 1
            continue

        # 3. Transport & Cold Ischemia Time (CIT) Gating
        # This is a hard medical filter - non-viable organs are excluded immediately
        cit_passed = True
        donor_lat = donor.get('latitude')
        donor_lng = donor.get('longitude')
        
        if donor_lat is not None and donor_lng is not None:
            dist = haversine(donor_lat, donor_lng, hospital_lat, hospital_lon)
            donor['distance_km'] = dist
            
            for organ in required_organs:
                viable, travel_time = TransportViabilityService.is_cit_viable(organ, dist)
                if not viable:
                    cit_passed = False
                    break
                donor['estimated_travel_time'] = travel_time
        else:
            # If coordinates are missing, we cannot verify viability safely
            cit_passed = False
        
        if not cit_passed:
            stats.failed_cit += 1
            continue

        # 4. Standard Health Blockers (Binary medical counters)
        # In production, these would be specific to each organ
        if donor.get('hiv_status') == "Positive" or donor.get('hepatitis_status') == "Positive":
            stats.failed_condition += 1
            continue

        # All clinical gates passed
        compatible_donors.append(donor)
        stats.passed += 1

    return compatible_donors, stats
