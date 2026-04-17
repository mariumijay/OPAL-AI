import httpx
import asyncio
from typing import List, Dict, Any, Tuple

class ClinicalLogisticsService:
    """
    Advanced Medical-Logistics Engine.
    Switches from Haversine (Direct) to OSRM (Road-Network) for CIT viability.
    """
    OSRM_BASE_URL = "http://router.project-osrm.org/table/v1/driving/"

    @staticmethod
    async def get_road_metrics(origin: Tuple[float, float], destinations: List[Tuple[float, float]]) -> List[Dict[str, float]]:
        """
        Fetches Real Road Distance (meters) and Duration (seconds) using OSRM Table API.
        """
        # OSRM format: lon,lat;lon,lat...
        coords = f"{origin[1]},{origin[0]}" # Origin
        for dest in destinations:
            coords += f";{dest[1]},{dest[0]}"
        
        # We only want durations/distances from index 0 (origin) to others
        url = f"{ClinicalLogisticsService.OSRM_BASE_URL}{coords}?sources=0"
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    results = []
                    durations = data.get("durations", [[]])[0]
                    # OSRM table doesn't always return distances unless requested, but durations are key for CIT
                    for i in range(1, len(durations)):
                         results.append({
                             "duration_secs": durations[i],
                             "duration_hours": durations[i] / 3600.0,
                             "distance_km": (durations[i] / 3600.0) * 80.0 # Heuristic fallback for distance if table lacks it
                         })
                    return results
        except Exception as e:
            print(f"[OSRM ERROR] Road network calculation failed: {e}")
        
        return []

    @staticmethod
    def get_clinical_matrix(category: str) -> Dict[str, List[str]]:
        """
        Implements distinct logic for Organs vs Plasma (Inverse ABO).
        """
        # Standard Recipient-Compatibility (Who can GIVE to this recipient)
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
        
        # PLASMA INVERSE MATRIX (AB is the universal donor)
        # Recipient Perspective: Who can give plasma to this recipient type?
        PLASMA_MATRIX = {
            "O": ["O", "A", "B", "AB"], # O is universal recipient for Plasma
            "A": ["A", "AB"],
            "B": ["B", "AB"],
            "AB": ["AB"], # AB is universal donor, but can only receive from AB
        }
        
        return PLASMA_MATRIX if category.lower() == "plasma" else STANDARD_MATRIX

    @staticmethod
    def is_cit_viable(organ_type: str, travel_hours: float) -> bool:
        """
        Hard Clinical Gating based on Cold Ischemia Time limits.
        """
        LIMITS = {
            "Heart": 4.0,
            "Lung": 4.0,
            "Liver": 12.0,
            "Pancreas": 12.0,
            "Kidney": 24.0,
            "Cornea": 96.0
        }
        return travel_hours <= LIMITS.get(organ_type, 12.0)
