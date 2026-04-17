import google.generativeai as genai
import logging
from typing import Any
from core.config import settings

logger = logging.getLogger(__name__)

class AIService:
    _instance = None
    _is_configured = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._is_configured:
            self.configure()

    def configure(self):
        try:
            if not settings.GEMINI_API_KEY:
                logger.warning("GEMINI_API_KEY missing - AI services will fail or use fallbacks.")
                return

            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._is_configured = True
            logger.info("AI Service (Gemini) configured successfully.")
        except Exception as e:
            logger.error(f"Failed to configure Gemini: {e}")

    def get_model(self, model_name: str = "gemini-flash-latest", system_instruction: str = None, generation_config: Any = None):
        if not self._is_configured:
            self.configure()
        
        # Convert dict to GenerationConfig if needed for true encapsulation
        if isinstance(generation_config, dict):
            try:
                generation_config = genai.GenerationConfig(**generation_config)
            except Exception as e:
                logger.error(f"Config Error: {e}")
                generation_config = None

        try:
            return genai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_instruction,
                generation_config=generation_config
            )
        except Exception as e:
            logger.error(f"FATAL: Error initializing GenerativeModel {model_name}: {e}")
            print(f"FAILED TO LOAD AI MODEL: {e}") # Print to terminal for user visibility
            return None

_ai_service = AIService()

def get_ai_service():
    return _ai_service
