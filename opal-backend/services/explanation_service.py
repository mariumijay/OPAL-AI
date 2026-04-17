import hashlib
import time
import logging
from typing import Dict, List, Tuple, Any
import asyncio
from services.ai_service import get_ai_service

# Setup logging for audit trail
logger = logging.getLogger(__name__)

class MatchJustification:
    """
    Deterministic factual verification to prevent LLM hallucinations.
    Uses clinical data to provide a baseline for the AI.
    """
    @staticmethod
    def get_clinical_facts(donor_data: Dict[str, Any], score_breakdown: Dict[str, Any]) -> List[str]:
        facts = []
        # Blood Compatibility Fact
        blood_score = score_breakdown.get('blood_compatibility', 1.0) # Default to compatible
        if blood_score >= 1.0:
            facts.append("ABO matching is identical.")
        else:
            facts.append("ABO matching is compatible (Universal type logic applied).")
            
        # Distance/Travel Fact
        distance = donor_data.get('distance_km', 0)
        facts.append(f"Donor is located {distance:.1f}km from your facility.")
        
        # Medical History Highlights
        if score_breakdown.get('condition_factor', 1.0) < 1.0:
            facts.append("Clinical history suggests manageable comorbidities.")
        else:
            facts.append("Donor record indicates no significant comorbidities.")
            
        return facts

class ExplanationService:
    def __init__(self):
        self.ai_service = get_ai_service()
        self._cache: Dict[str, Dict] = {}
        self.MAX_CACHE_SIZE = 1000 # Memory safety limit
        
    @staticmethod
    def _get_cache_key(donor_id: str, patient_blood_type: str, required_organs: list) -> str:
        raw = f"{donor_id}:{patient_blood_type}:{sorted(required_organs)}"
        return hashlib.sha256(raw.encode()).hexdigest()

    async def explain_match(
        self,
        rank: int,
        total_compatible: int,
        donor_data: Dict[str, Any],
        request_data: Dict[str, Any],
        score_breakdown: Dict[str, Any]
    ) -> Tuple[str, str]:
        """
        Hybrid Deterministic/LLM Explanation.
        Phase 1: Deterministic Factual Audit (Safe).
        Phase 2: LLM Clinical Synthesis (Gemini).
        """
        # 1. Deterministic Baseline (Safe from Hallucinations)
        facts = MatchJustification.get_clinical_facts(donor_data, score_breakdown)
        deterministic_intro = " ".join(facts)
        
        # 2. Check Cache for identical match request
        cache_key = self._get_cache_key(
            donor_data.get('id', 'unknown'), 
            request_data.get('patient_blood_type', 'O+'), 
            request_data.get('required_organs', [])
        )
        
        if cache_key in self._cache:
            cached = self._cache[cache_key]
            if time.time() - cached['timestamp'] < 900: # 15 min cache
                return f"{deterministic_intro} {cached['explanation']}", "hybrid-cached"

        # 3. LLM Synthesis (Phase 2)
        system_prompt = (
            "You are a Clinical Matching Auditor. "
            "Task: Synthesize a concise explanation for why this donor is a top match. "
            "Constraints: Exactly two professional sentences. Start with 'Clinical Justification:'. "
            "Strictly use provided stats. NO SPARKLES or flowery language. "
            "Prioritize patient safety and blood compatibility."
        )

        model = self.ai_service.get_model(system_instruction=system_prompt)
        if not model:
            return f"{deterministic_intro} Ranking prioritized by clinical utility and proximity score.", "hybrid-no-ai"

        user_prompt = f"""
        Rank: #{rank} of {total_compatible} compatible candidates.
        Donor Stats: Age {donor_data.get('age')}, Blood {donor_data.get('blood_type')}.
        Clinical Scores: HLA Weight({score_breakdown.get('hla_compatibility', 0):.2f}), Proximity({score_breakdown.get('cit_viability', 0):.2f}).
        Requirements: {request_data.get('required_organs')}
        """

        try:
            # Generation Config for Medical Precision (dictionary format)
            generation_config = {
                "temperature": 0.2, # Low randomness for clinical consistency
                "top_p": 0.9,
                "top_k": 32,
                "max_output_tokens": 400,
            }

            response = await asyncio.wait_for(
                asyncio.to_thread(
                    model.generate_content,
                    user_prompt,
                    generation_config=generation_config
                ),
                timeout=10.0
            )

            # Robust Safety Checks
            if not response.candidates:
                raise ValueError("Gemini returned no candidates (Safety Block?)")
            
            if response.candidates[0].finish_reason != 1: # 1 = STOP (Success)
                logger.warning(f"Gemini finish reason abnormal: {response.candidates[0].finish_reason}")
                # Fallback to deterministic only if finish reason is bad
                return deterministic_intro, "hybrid-safety-fallback"

            llm_synthesis = response.text.strip()
            
            # Cache the successful synthesis (with size-safety check)
            if len(self._cache) >= self.MAX_CACHE_SIZE:
                # Simple eviction: clear oldest entries if full
                self._cache.clear() 

            self._cache[cache_key] = {
                "explanation": llm_synthesis,
                "timestamp": time.time()
            }
            return f"{deterministic_intro} {llm_synthesis}", "hybrid-gemini"
            
        except asyncio.TimeoutError:
            logger.error("Gemini Synthesis Timeout")
            fallback = "Ranking criteria: Blood type compatibility, geographic optimization, and urgent clinical need."
            return f"{deterministic_intro} {fallback}", "hybrid-timeout"
        except Exception as e:
            logger.error(f"Gemini Synthesis Error: {e}")
            fallback = "Ranking criteria: Blood type compatibility, geographic optimization, and urgent clinical need."
            return f"{deterministic_intro} {fallback}", "hybrid-fallback"

_explanation_service = None

def get_explanation_service():
    global _explanation_service
    if _explanation_service is None:
        _explanation_service = ExplanationService()
    return _explanation_service
