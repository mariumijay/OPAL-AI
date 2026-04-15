import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder

# ==========================================
# OPAL-AI Data Preprocessing & EDA Pipeline 
# ==========================================

# Define paths
OUTPUT_DIR = "eda_reports"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_synthetic_medical_data(num_samples: int = 1500) -> pd.DataFrame:
    """
    Generates synthetic but highly realistic historical data of organ donations.
    This simulates what an actual hospital's registry would look like.
    """
    print(f"[*] Generating {num_samples} synthetic organ matching records...")
    np.random.seed(42)
    
    blood_types = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
    blood_probs = [0.35, 0.07, 0.30, 0.05, 0.15, 0.02, 0.05, 0.01] # Global blood distribution
    
    data = {
        'donor_age': np.random.normal(35, 12, num_samples).clip(18, 65).astype(int),
        'recipient_age': np.random.normal(45, 15, num_samples).clip(5, 75).astype(int),
        'donor_blood_type': np.random.choice(blood_types, num_samples, p=blood_probs),
        'recipient_blood_type': np.random.choice(blood_types, num_samples, p=blood_probs),
        'distance_km': np.random.exponential(150, num_samples).clip(5, 1000),
        'is_donor_smoker': np.random.choice([0, 1], num_samples, p=[0.8, 0.2]),
        'is_donor_diabetic': np.random.choice([0, 1], num_samples, p=[0.9, 0.1]),
        'wait_time_days': np.random.exponential(120, num_samples).clip(1, 1000),
    }
    
    df = pd.DataFrame(data)
    
    # Introduce some artificial missing data to simulate real-world messy data
    df.loc[df.sample(frac=0.05).index, 'distance_km'] = np.nan
    df.loc[df.sample(frac=0.02).index, 'donor_age'] = np.nan
    
    # Generate Target Variable: transplant_success (0 = Failed, 1 = Successful)
    # Success is more likely if age is close, distance is small, and donor is healthy
    age_diff = np.abs(df['donor_age'] - df['recipient_age'])
    health_penalty = (df['is_donor_smoker'] * 15) + (df['is_donor_diabetic'] * 25)
    
    # A mocked logical formula for probability of success
    success_probability = (
        100 
        - (age_diff * 0.5) 
        - (df['distance_km'] * 0.05) 
        - health_penalty
        + np.random.normal(0, 10, num_samples) # Add some real-world noise
    )
    
    df['transplant_success'] = np.where(success_probability > 60, 1, 0)
    return df

def perform_exploratory_data_analysis(df: pd.DataFrame):
    """
    EDA Step: Creates visualizations and summary statistics.
    """
    print("[*] Performing Exploratory Data Analysis (EDA)...")
    
    # 1. Dataset Shape and Missing Values Profile
    print("\n--- Dataset Profile ---")
    print(df.info())
    print("\n--- Missing Values Summary ---")
    print(df.isna().sum())
    
    # 2. Target Variable Distribution Plot
    plt.figure(figsize=(6, 4))
    sns.countplot(x='transplant_success', data=df, palette='viridis')
    plt.title('Distribution of Transplant Success vs Failures')
    plt.savefig(os.path.join(OUTPUT_DIR, 'success_distribution.png'))
    plt.close()
    
    # 3. Numeric Correlation Heatmap
    plt.figure(figsize=(10, 8))
    numeric_df = df.select_dtypes(include=[np.number])
    sns.heatmap(numeric_df.corr(), annot=True, cmap='coolwarm', fmt=".2f")
    plt.title('Feature Correlation Matrix')
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'correlation_matrix.png'))
    plt.close()
    
    # 4. Impact of Distance on Success
    plt.figure(figsize=(8, 5))
    sns.boxplot(x='transplant_success', y='distance_km', data=df, palette='Set2')
    plt.title('Impact of Distance (km) on Transplant Success')
    plt.savefig(os.path.join(OUTPUT_DIR, 'distance_vs_success.png'))
    plt.close()
    
    print(f"[*] EDA Visualizations saved to '{OUTPUT_DIR}/' folder.")

def preprocess_data(df: pd.DataFrame) -> tuple:
    """
    Data Preprocessing: Handles missing data, encodes text, scales features.
    """
    print("[*] Starting Data Preprocessing Pipeline...")
    
    # --- A. Handling Missing Values (Imputation) ---
    # Fill numeric columns with median values
    df['distance_km'] = df['distance_km'].fillna(df['distance_km'].median())
    df['donor_age'] = df['donor_age'].fillna(df['donor_age'].median())
    
    # --- B. Feature Engineering ---
    df['age_difference'] = np.abs(df['donor_age'] - df['recipient_age'])
    df['blood_match_exact'] = (df['donor_blood_type'] == df['recipient_blood_type']).astype(int)
    
    # --- C. Categorical Encoding ---
    # Encode blood types to numeric categories
    le = LabelEncoder()
    df['donor_blood_type_encoded'] = le.fit_transform(df['donor_blood_type'])
    df['recipient_blood_type_encoded'] = le.fit_transform(df['recipient_blood_type'])
    
    # Drop raw string columns
    df.drop(['donor_blood_type', 'recipient_blood_type'], axis=1, inplace=True)
    
    # --- D. Feature Scaling ---
    # Machine Learning needs all inputs normalized (mean=0, std=1)
    X = df.drop('transplant_success', axis=1)
    y = df['transplant_success']
    
    # Split the dataset before scaling to prevent data leakage
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Create final DataFrames and save them
    feature_cols = X.columns
    X_train_final = pd.DataFrame(X_train_scaled, columns=feature_cols)
    X_test_final = pd.DataFrame(X_test_scaled, columns=feature_cols)
    
    df_processed = pd.concat([X_train_final, y_train.reset_index(drop=True)], axis=1)
    df_processed.to_csv(os.path.join(OUTPUT_DIR, 'cleaned_preprocessed_data.csv'), index=False)
    
    print("[*] Preprocessing Complete. Dataset split into Train/Test.")
    print(f"[*] Processed pipeline data saved to '{OUTPUT_DIR}/cleaned_preprocessed_data.csv'")
    
    return X_train_final, X_test_final, y_train, y_test

if __name__ == "__main__":
    print("-" * 50)
    print("OPAL-AI: Initiating Data Science Pipeline")
    print("-" * 50)
    
    # 1. Gather Data
    raw_df = generate_synthetic_medical_data(1500)
    
    # 2. EDA
    perform_exploratory_data_analysis(raw_df)
    
    # 3. Preprocess
    X_train, X_test, y_train, y_test = preprocess_data(raw_df)
    
    print("\nNext Steps: You can now pass X_train and y_train to a Random Forest or XGBoost model.")
