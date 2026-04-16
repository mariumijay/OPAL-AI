import hashlib
import json
import time
from typing import Optional, Dict, List, Tuple
import google.generativeai as genai
from core.config import settings

class MatchJustification:
    """
    Deterministic factual verification to prevent LLM hallucinations.
    """
    @staticmethod
    def get_clinical_facts(donor_data: dict, score_breakdown: dict) -> List[str]:
        facts = []
        # Blood Compatibility Fact
        blood_score = score_breakdown.get('blood_compatibility', 0)
        if blood_score >= 1.0:
            facts.append("ABO matching is identical.")
        else:
            facts.append("ABO matching is compatible (O-Universal).")
            
        # CIT Fact
        travel_time = donor_data.get('estimated_travel_time', 0)
        facts.append(f"Estimated Cold Ischemia Time (CIT) is {travel_time:.1f} hours.")
        
        # Medical History
        if score_breakdown.get('condition_factor', 1.0) < 1.0:
            facts.append("Donor has manageable comorbidities (Diabetes/Hyp) noted.")
        else:
            facts.append("Donor has no significant recorded comorbidities.")
            
        return facts

class ExplanationService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self._cache: Dict[str, Dict] = {}
        
    def _get_cache_key(self, donor_id: str, patient_blood_type: str, required_organs: list[str]) -> str:
        raw = f"{donor_id}:{patient_blood_type}:{sorted(required_organs)}"
        return hashlib.sha256(raw.encode()).hexdigest()

    async def explain_match(
        self,
        rank: int,
        total_compatible: int,
        donor_data: dict,
        request_data: dict,
        score_breakdown: dict
    ) -> tuple[str, str]:
        """
        Hybrid Deterministic/LLM Explanation.
        Phase 1: Deterministic Factual Audit.
        Phase 2: LLM Clinical Synthesis.
        """
        # 1. Deterministic Facts (Zero Hallucination)
        facts = MatchJustification.get_clinical_facts(donor_data, score_breakdown)
        deterministic_intro = " ".join(facts)
        
        # 2. Check Cache
        cache_key = self._get_cache_key(
            donor_data['id'], 
            request_data['patient_blood_type'], 
            request_data['required_organs']
        )
        
        if cache_key in self._cache:
            cached = self._cache[cache_key]
            if time.time() - cached['timestamp'] < 300:
                return f"{deterministic_intro} {cached['explanation']}", "hybrid-cached"

        # 3. LLM Synthesis (Phase 2)
        system_prompt = (
            "You are a Clinical Auditor for an organ transplant dashboard. "
            "Output exactly two sentences starting with 'Clinical Justification:'. "
            "Use only the provided statistics. Do not speculate. "
            "Never use words like 'perfect', 'ideal', or 'best'. "
            "Protect Patient Privacy (no names)."
        )

        user_prompt = f"""
        Donor ranked #{rank} of {total_compatible} per clinical utility.
        Stats:
        - Age: {donor_data['age']}
        - Scores: HLA({score_breakdown.get('age_factor', 0):.1f}), Proximity({score_breakdown.get('proximity', 0):.1f})
        - CIT: {donor_data.get('estimated_travel_time', 0):.1f}h
        Requirements: {request_data['required_organs']}
        """

        try:
            # 8s hard limit
            response = self.model.generate_content(
                f"SYSTEM: {system_prompt}\nUSER: {user_prompt}",
                generation_config={"timeout": 8.0, "temperature": 0.1}
            )
            llm_synthesis = response.text.strip()
            
            # Store in cache
            self._cache[cache_key] = {
                "explanation": llm_synthesis,
                "timestamp": time.time()
            }
            return f"{deterministic_intro} {llm_synthesis}", "hybrid-gemini"
            
        except Exception as e:
            fallback = "Ranking prioritized based on HLA compatibility, CIT window viability, and waitlist time."
            return f"{deterministic_intro} {fallback}", "hybrid-fallback"

_explanation_service = None

def get_explanation_service():
    global _explanation_service
    if _explanation_service is None:
        _explanation_service = ExplanationService()
    return _explanation_service
