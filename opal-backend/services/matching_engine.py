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

import joblib
import os

class AIMatchingModel:
    """
    Professional AI Matching Engine structure using trained Machine Learning models.
    """
    def __init__(self):
        self.model = None
        self.weights = {
            'blood_compatibility': 0.40,
            'distance_decay': 0.30,
            'age_differential': 0.15,
            'health_score': 0.15
        }
        
        # Try loading actual trained model
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'match_model.joblib')
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                print(f"[AI ENGINE] Loaded trained ML model from {model_path}")
            except Exception as e:
                print(f"[AI ENGINE] Failed to load model: {e}")

    def _extract_machine_features(self, donor: dict) -> np.ndarray:
        """Transforms raw database JSON into the exact 24 features expected by the Random Forest model."""
        # 24 features aligned with train_model.py
        
        # Basic Info
        age = donor.get('age', 30)
        gender_Male = 1 if donor.get('gender', '') == 'Male' else 0
        
        # Organs (Default 0, check if provided in donor)
        blood = 1 if donor.get('donation_type') == 'blood' else 0
        bone_marrow = 1 if donor.get('donation_type') == 'organ' and 'Bone Marrow' in str(donor.get('organ_type', '')) else 0
        cornea = 1 if donor.get('donation_type') == 'organ' and 'Corne' in str(donor.get('organ_type', '')) else 0
        heart = 1 if donor.get('donation_type') == 'organ' and 'Heart' in str(donor.get('organ_type', '')) else 0
        kidney = 1 if donor.get('donation_type') == 'organ' and 'Kidney' in str(donor.get('organ_type', '')) else 0
        liver = 1 if donor.get('donation_type') == 'organ' and 'Liver' in str(donor.get('organ_type', '')) else 0
        lung = 1 if donor.get('donation_type') == 'organ' and 'Lung' in str(donor.get('organ_type', '')) else 0
        pancreas = 1 if donor.get('donation_type') == 'organ' and 'Pancreas' in str(donor.get('organ_type', '')) else 0
        plasma = 0
        platelet = 0
        skin = 0
        
        # Conditions
        cond_diabetes = 1 if donor.get('is_diabetic') else 0
        cond_hypertension = 0 # Not explicitly in basic donor model
        cond_heart_disease = 0
        
        # Blood Types
        bt = donor.get('blood_type', '')
        b_A_pos = 1 if bt == 'A+' else 0
        b_A_neg = 1 if bt == 'A-' else 0
        b_AB_pos = 1 if bt == 'AB+' else 0
        b_AB_neg = 1 if bt == 'AB-' else 0
        b_B_pos = 1 if bt == 'B+' else 0
        b_B_neg = 1 if bt == 'B-' else 0
        b_O_pos = 1 if bt == 'O+' else 0
        b_O_neg = 1 if bt == 'O-' else 0
        
        return np.array([[
            age, gender_Male, blood, bone_marrow, cornea, heart, 
            kidney, liver, lung, pancreas, plasma, platelet, skin,
            cond_diabetes, cond_hypertension, cond_heart_disease,
            b_A_pos, b_A_neg, b_AB_pos, b_AB_neg, b_B_pos, b_B_neg, b_O_pos, b_O_neg
        ]])

    def _extract_heuristic_features(self, donor: dict, recipient_lat: float, recipient_lon: float) -> dict:
        """Transforms raw database JSON into ML-ready numerical features."""
        distance = haversine(
            recipient_lat, recipient_lon, 
            donor.get('latitude', 0.0), donor.get('longitude', 0.0)
        )
        
        dist_score = max(0, 1 - (distance / 500.0))
        
        health_penalties = 0.0
        if donor.get('is_smoker', False): health_penalties += 0.2
        if donor.get('is_diabetic', False): health_penalties += 0.3
        health_score = max(0.1, 1.0 - health_penalties)
        
        donor_age = donor.get('age', 30)
        age_score = max(0, 1 - (donor_age / 100.0))
        
        return {
            'distance_km': distance,
            'features': np.array([1.0, dist_score, age_score, health_score])
        }

    def predict_match_probability(self, donor: dict, recipient_lat: float, recipient_lon: float) -> tuple[float, float]:
        """
        Runs the ML Inference. 
        Returns (Match Percentage, Distance in km)
        """
        # Get distance from heuristic extraction
        heuristic = self._extract_heuristic_features(donor, recipient_lat, recipient_lon)
        distance = heuristic['distance_km']

        if self.model: # Use Trained AI Model
            ml_features = self._extract_machine_features(donor)
            prediction = self.model.predict(ml_features)[0]
            # Incorporate distance decay into the ML prediction natively
            dist_score = max(0, 1 - (distance / 500.0))
            probability = (prediction * 0.7) + (dist_score * 0.3)
        else: # Fallback to heuristic
            weight_vector = np.array(list(self.weights.values()))
            probability = np.dot(heuristic['features'], weight_vector)
            
        return round(probability * 100, 2), distance

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
        # 1. AI Model Inference (Scoring & Feature Extraction)
        match_probability, distance = ai_matcher.predict_match_probability(
            donor, hospital_lat, hospital_lon
        )
        
        if distance > max_distance:
            continue
        
        # 2. Format Response
        matches.append(MatchResponse(
            id=donor['id'],
            full_name=donor['full_name'],
            blood_type=donor['blood_type'],
            distance_km=distance,
            city=donor['city'],
            phone=donor['phone']
        ))
        
        matches[-1].match_score = match_probability 

    # Sort by AI Match Probability (Highest First)
    matches.sort(key=lambda x: getattr(x, 'match_score', 0), reverse=True)
    
    return matches[:10]
