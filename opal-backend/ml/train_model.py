"""
OPAL-AI: ADVANCED CLINICAL RANKING PIPELINE
Algorithm: XGBRanker (LambdaMART)
Architecture: Learning-to-Rank (LTR) for Organ Allocation
"""

import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
import os
from datetime import datetime
from sklearn.model_selection import train_test_split
from math import radians, cos, sin, asin, sqrt

# Constants
MODEL_PATH = "e:/opal ai frontend/opal-backend/models/match_ranker_v1.joblib"
MODEL_DISCLAIMER = (
    "CLINICAL RANKING: This model uses a LambdaMART (XGBoost) architecture to rank "
    "donors based on clinical utility. It is trained on synthetic outcome data."
)

def compute_clinical_utility(row):
    """
    Simulates a 'Clinical Utility' score for a specific match request.
    In production, this would be based on historical Transplant Success.
    """
    # 1. HLA Matching (0-6 points, 40% weight)
    # Simulator: Random but biased by imaginary genetic markers
    hla_match = row.get('hla_match_points', np.random.randint(0, 7))
    hla_score = hla_match / 6.0
    
    # 2. Waitlist Time (30% weight)
    # Higher wait time = higher priority
    wait_score = row.get('wait_time_days', 0) / 730.0 # Normalize by 2 years
    
    # 3. Urgency (Status 1A/1B) (20% weight)
    urgency_map = {"low": 0.1, "medium": 0.5, "critical": 1.0}
    urgency_raw = row.get('urgency', "medium")
    urgency_score = urgency_map.get(urgency_raw, 0.5)
    
    # 4. Proximity penalty (10% weight)
    # Note: CIT viability is handled by the filter, this is just logistical preference
    dist = row.get('distance_km', 50)
    proximity_score = max(0, 1 - (dist / 1000.0))
    
    utility = (0.4 * hla_score) + (0.3 * wait_score) + (0.2 * urgency_score) + (0.1 * proximity_score)
    return np.clip(utility, 0, 1)

def train_ranking_model():
    print("--- [ML] Initiating Clinical-Grade Ranking Overhaul ---")
    
    # Generate Synthetic Dataset for Learning-to-Rank
    # We need multiple match requests (queries), each with multiple candidate donors
    np.random.seed(42)
    n_requests = 500
    donors_per_request = 10
    total_samples = n_requests * donors_per_request
    
    data = []
    for req_id in range(n_requests):
        urgency = np.random.choice(["low", "medium", "critical"], p=[0.6, 0.3, 0.1])
        for _ in range(donors_per_request):
            data.append({
                'request_id': req_id,
                'age': np.random.randint(18, 70),
                'hla_match_points': np.random.randint(0, 7),
                'wait_time_days': np.random.randint(1, 1000),
                'urgency': urgency,
                'distance_km': np.random.uniform(5, 500),
                'blood_type': np.random.choice(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
                'is_diabetic': np.random.choice([0, 1], p=[0.8, 0.2]),
                'is_hypertensive': np.random.choice([0, 1], p=[0.7, 0.3])
            })
            
    df = pd.DataFrame(data)
    
    # Calculate utility and relevance labels
    # LTR models need integer relevance (0-10) or float
    df['relevance'] = df.apply(compute_clinical_utility, axis=1)
    
    # Feature Engineering
    df_encoded = pd.get_dummies(df, columns=['blood_type', 'urgency'], prefix=['blood', 'urgency'])
    
    features = [
        'age', 'hla_match_points', 'wait_time_days', 'distance_km', 
        'is_diabetic', 'is_hypertensive'
    ] + [c for c in df_encoded.columns if c.startswith('blood_') or c.startswith('urgency_')]
    
    # Sorting by request_id is MANDATORY for XGBRanker
    df_encoded = df_encoded.sort_values('request_id')
    
    X = df_encoded[features]
    y = df_encoded['relevance']
    groups = df_encoded.groupby('request_id').size().values # Query structure
    
    # Train/Test Split (Split by whole requests, not individual items)
    split_point = int(n_requests * 0.8)
    train_queries = df_encoded['request_id'].unique()[:split_point]
    
    X_train = df_encoded[df_encoded['request_id'].isin(train_queries)][features]
    y_train = df_encoded[df_encoded['request_id'].isin(train_queries)]['relevance']
    group_train = df_encoded[df_encoded['request_id'].isin(train_queries)].groupby('request_id').size().values
    
    X_test = df_encoded[~df_encoded['request_id'].isin(train_queries)][features]
    y_test = df_encoded[~df_encoded['request_id'].isin(train_queries)]['relevance']
    group_test = df_encoded[~df_encoded['request_id'].isin(train_queries)].groupby('request_id').size().values
    
    # Initialize XGBRanker (LambdaMART)
    ranker = xgb.XGBRanker(
        objective='rank:ndcg',
        learning_rate=0.1,
        n_estimators=100,
        max_depth=5,
        tree_method='hist'
    )
    
    print(f"--- [ML] Training on {n_requests} simulated clinical scenarios ---")
    ranker.fit(X_train, y_train, group=group_train, eval_set=[(X_test, y_test)], eval_group=[group_test], verbose=False)
    
    # Persistence
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    model_data = {
        "model": ranker,
        "features": features,
        "type": "XGBRanker",
        "description": "Learning-to-Rank Clinical Utility Optimizer",
        "timestamp": datetime.utcnow().isoformat(),
        "disclaimer": MODEL_DISCLAIMER
    }
    joblib.dump(model_data, MODEL_PATH)
    
    print(f"--- [ML] Success! Advanced Ranker saved to {MODEL_PATH} ---")
    
    # Explainability: Top Feature Importances
    importances = sorted(zip(features, ranker.feature_importances_), key=lambda x: x[1], reverse=True)
    print("\n--- [ML] Clinical Priority Ranking Weights ---")
    for f, imp in importances[:5]:
        print(f"{f}: {imp:.4f}")

if __name__ == "__main__":
    train_ranking_model()
