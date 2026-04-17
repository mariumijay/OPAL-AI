from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Literal, List, Optional, Any, Dict
import asyncio
from services.supabase_client import get_supabase
from services.ai_service import get_ai_service
from core.config import settings

router = APIRouter(prefix="/api/chat", tags=["AI Chatbot"])

# Initialize AI Service
ai_service = get_ai_service()

# --- Schemas ---

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    role: Literal["donor", "hospital", "admin"]
    user_id: str
    page_context: str  # current page path e.g. "/dashboard/hospital/matches"
    conversation_history: List[dict] = []

class ChatResponse(BaseModel):
    reply: str
    source: Literal["gemini", "fallback", "safety_intercept"]
    advisory: Optional[str] = None

# In-memory cache for DB context to avoid hitting Supabase on every message
# { "role:user_id": { "context": "...", "timestamp": 12345 } }
context_cache: Dict[str, Any] = {}
CACHE_TTL = 300 # 5 minutes

# --- Safety & Validation ---

MEDICAL_KEYWORDS = [
    "eligible", "can i donate", "safe to donate", "my condition",
    "my disease", "my medication", "will i survive", "surgery risk"
]

BLOCKED_PATTERNS = [
    "ignore previous instructions",
    "you are now",
    "pretend you are",
    "forget your rules",
    "act as",
    "jailbreak",
    "override",
]

def is_prompt_injection(message: str) -> bool:
    return any(p in message.lower() for p in BLOCKED_PATTERNS)

# --- DB Context Fetchers ---

import time

def fetch_db_context(role: str, user_id: str) -> str:
    # 1. Check Cache
    cache_key = f"{role}:{user_id}"
    if cache_key in context_cache:
        cached = context_cache[cache_key]
        if time.time() - cached['timestamp'] < CACHE_TTL:
            return cached['context']

    # 2. Fetch Fresh Data
    supabase = get_supabase()
    db_context = ""
    
    if role == "donor":
        db_context = ""  # donors get no DB context — privacy

    elif role == "hospital":
        # Fetch this hospital's last 5 match requests + results
        try:
            data = supabase.table("organ_requests")\
                .select("required_organs, patient_blood_type, status, created_at")\
                .eq("hospital_id", user_id)\
                .order("created_at", desc=True)\
                .limit(5)\
                .execute()
            
            if not data.data:
                db_context = "No recent match requests found."
            else:
                lines = []
                for r in data.data:
                    lines.append(
                        f"Request: {r.get('required_organs', '—')} | "
                        f"Patient blood: {r.get('patient_blood_type', '—')} | "
                        f"Status: {r.get('status', 'pending')} | "
                        f"Date: {r['created_at'][:10] if r.get('created_at') else '—'}"
                    )
                db_context = "Recent match requests:\n" + "\n".join(lines)
        except Exception as e:
            print(f"DB Fetch Error (Hospital): {e}")
            db_context = "Error loading match data."

    elif role == "admin":
        try:
            # Fetch aggregate stats only — never individual records
            donor_count = supabase.table("blood_donors")\
                .select("id", count="exact")\
                .eq("is_available", True).execute()
            
            hospital_count = supabase.table("hospitals")\
                .select("id", count="exact").execute()
            
            # Since organ_requests might have a lot of data, we just get the count for the last 7 days logic
            request_count = supabase.table("organ_requests")\
                .select("id", count="exact").execute()
            
            db_context = (
                f"Active donors: {donor_count.count if hasattr(donor_count, 'count') else 0} | "
                f"Registered hospitals: {hospital_count.count if hasattr(hospital_count, 'count') else 0} | "
                f"Total match requests: {request_count.count if hasattr(request_count, 'count') else 0}"
            )
        except Exception as e:
            print(f"DB Fetch Error (Admin): {e}")
            db_context = "Error loading system stats."
    
    # 3. Save to Cache
    context_cache[cache_key] = {
        "context": db_context,
        "timestamp": time.time()
    }
            
    return db_context

def get_system_prompt(role: str, user_id: str, page_context: str, db_context: str) -> str:
    if role == "donor":
        return f"""
        You are OPAL Assistant, a helpful guide on the OPAL-AI donor platform.
        You are talking to a registered donor.
        Current page: {page_context}

        Your job:
        - Guide donors through registration and profile completion
        - Explain what organs/blood components they can donate
        - Answer questions about the donation process
        - Explain what their dashboard shows
        - Reassure and support — donation decisions are personal

        Rules you must follow:
        - NEVER tell a donor whether they are medically eligible to donate
          (only a doctor can determine this)
        - NEVER access or mention other donors' data
        - If asked about medical eligibility: say "Please consult your physician. OPAL-AI connects donors with hospitals but does not provide medical advice."
        - Keep answers under 4 sentences unless a step-by-step guide is explicitly needed
        - If asked something outside donation/OPAL: say "I can only help with OPAL-AI related questions."

        OPAL-AI knowledge:
        - Donors register with blood type, available organs, and location
        - Donors can update availability status anytime from their dashboard
        - Matching is done by hospitals, not initiated by donors
        - All donor data is private and only visible to verified hospitals
        """

    elif role == "hospital":
        return f"""
        You are OPAL Assistant, an AI coordinator assistant for hospital staff on the OPAL-AI platform.
        Current page: {page_context}

        Live data for this hospital (fetched from database):
        {db_context}

        Your job:
        - Explain match results and AI scores in plain language
        - Help coordinators understand score breakdowns
        - Guide through submitting match requests
        - Answer questions about donor profiles shown on their dashboard
        - Explain what each organ availability field means

        Rules:
        - NEVER recommend a specific donor for selection — that is a clinical decision
        - NEVER reveal a donor's name or personal details beyond what is already shown on their dashboard
        - Always include: "This is AI-generated guidance. Final decisions must be made by qualified medical staff."
        - If asked about a specific match score: explain the 5 factors (blood compatibility, organ availability, age factor, condition factor, proximity)
        - If db_context is empty or indicates no requests: say "I don't have your current match data loaded. Please submit a match request from the dashboard."
        """

    elif role == "admin":
        return f"""
        You are OPAL Assistant, a system intelligence assistant for OPAL-AI administrators.
        Current page: {page_context}

        Live system stats (fetched from database):
        {db_context}

        Your job:
        - Answer questions about system statistics
        - Explain donor/hospital counts, request volumes, match rates
        - Help interpret data anomalies
        - Guide through admin dashboard features

        Rules:
        - You may reference aggregate statistics but NEVER expose individual donor or patient records
        - If asked to modify data: say "Data modifications must be done through the admin dashboard directly, not through chat."
        - Be concise and data-focused — admins want numbers, not prose
        """
    return "You are OPAL Assistant, a helpful medical network coordinator."

# --- Gemini Service ---

async def call_gemini(message: str, system_prompt: str, history: List[dict]) -> tuple[str, str]:
    # Safety check — intercept medical advice requests
    if any(kw in message.lower() for kw in MEDICAL_KEYWORDS):
        return (
            "I'm not able to provide personal medical advice. Please consult a qualified physician for questions about your specific health situation.",
            "safety_intercept"
        )
    
    # Prompt injection check
    if is_prompt_injection(message):
        print(f"ALARM: Prompt injection attempt detected! Message: {message}")
        return ("I can only help with OPAL-AI related questions.", "safety_intercept")

    try:
        model = ai_service.get_model(
            model_name="gemini-flash-latest",
            system_instruction=system_prompt,
            generation_config={
                "temperature": 0.2,
                "max_output_tokens": 1024,
            }
        )
        
        if not model:
            return ("AI Engine initialization failed. Please verify your GEMINI_API_KEY and network status.", "fallback")

        # History format adjustment: Gemini expects List[dict] with role and parts
        # The user history might be list[dict] = [{"role": "user"|"model", "parts": [{"text": "..."}]}]
        # Gemini expects it in the start_chat call
        chat = model.start_chat(history=history[-10:])
        
        response = await asyncio.wait_for(
            asyncio.to_thread(chat.send_message, message),
            timeout=20.0
        )
        
        return response.text, "gemini"
    
    except asyncio.TimeoutError:
        return ("I'm taking too long to respond. Please try again.", "fallback")
    except Exception as e:
        print(f"Gemini error: {e}")
        return ("I'm temporarily unavailable. Please use the dashboard directly or contact support.", "fallback")

# --- Route Implementation ---

@router.post("/ask", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    # 1. Fetch DB context based on role
    db_context = fetch_db_context(request.role, request.user_id)
    
    # 2. Build system prompt
    system_prompt = get_system_prompt(
        request.role,
        request.user_id,
        request.page_context,
        db_context
    )
    
    # 3. Call Gemini
    reply, source = await call_gemini(
        request.message,
        system_prompt,
        request.conversation_history
    )
    
    # 4. Add advisory for medical topics
    medical_topics = ["organ", "blood", "donor", "match", "compatible"]
    advisory = None
    if any(t in request.message.lower() for t in medical_topics):
        advisory = "AI guidance only. All medical decisions require qualified staff."
    
    return ChatResponse(reply=reply, source=source, advisory=advisory)
