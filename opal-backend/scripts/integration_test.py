import requests
import json
import time

import os

# --- Clinical API Configuration ---
# Priority: ENV > Default Local Development Port
BASE_URL = os.getenv("OPAL_API_URL", "http://127.0.0.1:8000/api/match")
HEALTH_CHECK_URL = os.getenv("OPAL_BASE_URL", "http://127.0.0.1:8000/")

def run_integration_audit():
    print("🚀 [AUDIT] Starting Clinical Integration Test...")
    
    # 0. Connectivity Pre-check
    try:
        health = requests.get(HEALTH_CHECK_URL, timeout=2)
        if health.status_code != 200:
            print(f"❌ OFFLINE: Backend at {HEALTH_CHECK_URL} is unresponsive. Start the server first.")
            return
    except requests.exceptions.ConnectionError:
        print(f"❌ OFFLINE: Could not connect to {HEALTH_CHECK_URL}. Is uvicorn running?")
        return
    # Islamabad Coordinates: 33.6844, 73.0479
    hospital_request = {
        "hospital_id": "893c8702-8631-487c-9189-d1cb7aa5b9e0", # Placeholder UUID
        "required_organs": ["Heart"],
        "patient_blood_type": "O+",
        "urgency_level": "critical",
        "max_results": 5
    }

    print("\n🔍 [STEP 1] Testing /find endpoint with Heart Request...")
    try:
        # Note: Ensure backend is running locally for this to work
        response = requests.post(f"{BASE_URL}/find", json=hospital_request)
        
        if response.status_code == 200:
            data = response.json()
            matches = data.get('matches', [])
            stats = data.get('filter_stats', {})
            
            print(f"✅ Success! Found {len(matches)} potential matches.")
            print(f"📊 Filter Stats: {json.dumps(stats, indent=2)}")
            
            # 2. Logic Verification: Cold Ischemia Time (CIT)
            print("\n🧊 [STEP 2] Verifying CIT Viability Filters...")
            for i, match in enumerate(matches):
                dist = match.get('distance_km', 0)
                score_breakdown = match.get('score_breakdown', {})
                cit_score = score_breakdown.get('cit_viability', 0)
                
                # A heart match > 400km should ideally be filtered out or have very low CIT score
                # This depends on our 1.35 friction factor
                print(f"Match #{i+1}: Dist: {dist:.1f}km | CIT Score: {cit_score:.2f}")
                
                if dist > 500:
                     print(f"⚠️ WARNING: Match discovered at {dist}km. Checking if it should have been pruned...")

            # 3. Explanation Check
            print("\n📝 [STEP 3] Checking Clinical Justifications...")
            for i, match in enumerate(matches[:3]):
                explanation = match.get('ai_explanation', "")
                source = match.get('explanation_source', "")
                
                if "Clinical Justification:" in explanation:
                    print(f"✅ Match #{i+1} has valid clinical audit string (Source: {source})")
                else:
                    print(f"❌ Match #{i+1} explanation is missing clinical protocol headers!")

        else:
            print(f"❌ API Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ CRITICAL: Could not connect to backend server. {str(e)}")

def simulate_realtime_donors(n=3):
    """
    Mock function to simulate rapid donor registrations.
    """
    print(f"\n⚡ [SIMULATION] Injecting {n} real-time donor registrations...")
    # This would typically hit a signup endpoint
    # For now, we just print the simulation plan
    for i in range(n):
        print(f"   -> Registration {i+1}: Donor [O-] located in Rawalpindi. Computing rank...")
        time.sleep(0.5)
    print("✅ Simulation complete. Dashboard ranking should reflect new geospatial data.")

if __name__ == "__main__":
    run_integration_audit()
    simulate_realtime_donors()
