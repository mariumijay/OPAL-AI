import numpy as np
from math import radians, sin, cos, sqrt, atan2
from typing import List, Dict, Any
from models.match import MatchResponse

# NOTE: In a real-world scenario, you would load a pre-trained ML model here.
# For example: 
# import joblib
# model = joblib.load('organ_matching_rf_model.pkl')

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates the great-circle distance between two points on the earth."""
    R = 6371.0
    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)
    a = sin(d_lat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return round(R * c, 2)

def is_blood_compatible(donor_type: str, recipient_type: str) -> bool:
    """Standard blood compatibility matrix."""
    compatibility = {
        "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
        "O+": ["O+", "A+", "B+", "AB+"],
        "A-": ["A-", "A+", "AB-", "AB+"],
        "A+": ["A+", "AB+"],
        "B-": ["B-", "B+", "AB-", "AB+"],
        "B+": ["B+", "AB+"],
        "AB-": ["AB-", "AB+"],
        "AB+": ["AB+"]
    }
    return recipient_type in compatibility.get(donor_type, [])

class AIMatchingModel:
    """
    Professional AI Matching Engine structure.
    This simulates a trained Machine Learning model evaluating donor-recipient compatibility.
    """
    def __init__(self):
        # In production, this would initialize your TensorFlow/Scikit-Learn models.
        self.weights = {
            'blood_compatibility': 0.40,
            'distance_decay': 0.30,
            'age_differential': 0.15,
            'health_score': 0.15
        }

    def _extract_features(self, donor: dict, recipient_lat: float, recipient_lon: float) -> dict:
        """Transforms raw database JSON into ML-ready numerical features."""
        distance = haversine(
            recipient_lat, recipient_lon, 
            donor.get('latitude', 0.0), donor.get('longitude', 0.0)
        )
        
        # Normalize distance (Assuming max typical distance is 500km)
        dist_score = max(0, 1 - (distance / 500.0))
        
        # Calculate Health Score (1.0 is perfectly healthy)
        health_penalties = 0.0
        if donor.get('is_smoker', False): health_penalties += 0.2
        if donor.get('is_diabetic', False): health_penalties += 0.3
        health_score = max(0.1, 1.0 - health_penalties)
        
        # Age Differential (Simulated optimum is younger donors)
        donor_age = donor.get('age', 30)
        age_score = max(0, 1 - (donor_age / 100.0))
        
        return {
            'distance_km': distance,
            'features': np.array([1.0, dist_score, age_score, health_score]) # 1.0 is blood compat (since already filtered)
        }

    def predict_match_probability(self, features: np.ndarray) -> float:
        """
        Runs the ML Inference. 
        (Replace this dot product with `model.predict_proba()` in production).
        """
        weight_vector = np.array(list(self.weights.values()))
        probability = np.dot(features, weight_vector)
        return round(probability * 100, 2)  # Return percentage

# Instantiate global matching model
ai_matcher = AIMatchingModel()

def calculate_match_results(
    donors: List[Dict[str, Any]], 
    hospital_lat: float, 
    hospital_lon: float,
    max_distance: float
) -> List[MatchResponse]:
    """
    Evaluates donors using the AI Matching Pipeline and returns ranked results.
    """
    matches = []
    
    for donor in donors:
        # 1. Artificial Intelligence Feature Extraction
        extraction = ai_matcher._extract_features(donor, hospital_lat, hospital_lon)
        distance = extraction['distance_km']
        
        if distance > max_distance:
            continue
            
        # 2. Model Inference (Scoring)
        match_probability = ai_matcher.predict_match_probability(extraction['features'])
        
        # 3. Format Response
        matches.append(MatchResponse(
            id=donor['id'],
            full_name=donor['full_name'],
            blood_type=donor['blood_type'],
            distance_km=distance,
            city=donor['city'],
            phone=donor['phone'],
            # Note: In a real scenario, you'd update MatchResponse to accept a match_score field
        ))
        
        # Dynamically append score if you want to extend the pydantic model later
        matches[-1].match_score = match_probability 

    # Sort by AI Match Probability (Highest First)
    matches.sort(key=lambda x: getattr(x, 'match_score', 0), reverse=True)
    
    return matches[:10]
