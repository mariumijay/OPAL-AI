import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routes import blood_donors, organ_donors, hospitals, matching
from routes.matching import get_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML model once at startup
    print("--- [STARTUP] Initializing Production AI Matching Model v2 ---")
    try:
        get_model()
    except Exception as e:
        print(f"FAILED TO LOAD ML MODEL: {e}")
    yield
    print("--- [SHUTDOWN] Cleaning up ---")

app = FastAPI(
    title="OPAL-AI Backend",
    description="Intelligent Organ & Blood Donor Matching Platform",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration
# Standard for Next.js development projects
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(blood_donors.router)
app.include_router(organ_donors.router)
app.include_router(hospitals.router)
app.include_router(matching.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to OPAL-AI Backend API",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
