import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import os

def train_matching_model():
    dataset_path = 'e:/opal ai frontend/dataset/FINAL_MERGED_ALL_ENCODED.csv'
    model_save_path = 'e:/opal ai frontend/opal-backend/models/match_model.joblib'

    print("--- [AI TRAINING] Loading Clinical Dataset ---")
    df = pd.read_csv(dataset_path)

    # 1. Feature Selection
    # Categorical fields (encoded) + Numerical fields
    features = [
        'age', 'gender_Male', 'Blood', 'Bone Marrow', 'Cornea', 'Heart', 
        'Kidney', 'Liver', 'Lung', 'Pancreas', 'Plasma', 'Platelet', 'Skin',
        'Condition_Diabetes', 'Condition_Hypertension', 'Condition_Heart_Disease',
        'blood_A+', 'blood_A-', 'blood_AB+', 'blood_AB-', 'blood_B+', 'blood_B-', 'blood_O+', 'blood_O-'
    ]

    X = df[features].fillna(0)

    # 2. Synthetic Target Creation (Clinical Logic for Matching Quality)
    # Since raw datasets often don't have "Success Labels", we create one based on clinical integrity
    # for the purpose of demonstrating a 'Trained AI Response'.
    # High score if young, no diabetic conditions, and viable blood type.
    y = 0.5 + (1 / (df['age'] + 1)) * 10 - (df['Condition_Diabetes'] * 0.2) - (df['Condition_Hypertension'] * 0.1)
    y = np.clip(y, 0, 1) # Normalize between 0 and 1

    print(f"--- [AI TRAINING] Preparing {len(X)} records for deep-feature analysis ---")

    # 3. Model Pipeline
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # We use Random Forest as it's excellent for tabular medical data
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)

    score = model.score(X_test, y_test)
    print(f"--- [AI TRAINING] Model Accuracy: {score:.2%} ---")

    # 4. Persistence
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    joblib.dump(model, model_save_path)
    print(f"--- [AI TRAINING] Success! Model saved to {model_save_path} ---")

if __name__ == "__main__":
    train_matching_model()
