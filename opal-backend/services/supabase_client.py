import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

class SupabaseService:
    """
    Singleton class to manage the Supabase client connection.
    Ensures only one instance of the client is used across the application.
    """
    _instance: Client = None

    @classmethod
    def get_client(cls) -> Client:
        if cls._instance is None:
            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_SERVICE_KEY")
            
            if not url or not key:
                raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment variables")
                
            cls._instance = create_client(url, key)
        return cls._instance

# Export a helper function to get the client easily
def get_supabase() -> Client:
    return SupabaseService.get_client()
