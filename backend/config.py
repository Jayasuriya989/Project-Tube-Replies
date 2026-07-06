import os
import logging
from dotenv import load_dotenv

# Resolve .env path relative to project root (one level above this config file)
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(dotenv_path, override=True)

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def _require_env(var_name: str) -> str:
    """Return the environment variable value or raise a clear error.
    This ensures required OAuth configuration is present at startup.
    """
    value = os.getenv(var_name)
    if not value:
        raise RuntimeError(f"Environment variable {var_name} is required but not set")
    return value

# Optional API key (YouTube)
API_KEY = os.getenv("YOUTUBE_API_KEY") or os.getenv("API_KEY")

# Required Google OAuth credentials
GOOGLE_CLIENT_ID = _require_env("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = _require_env("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/callback")

# JWT secret for signing tokens
JWT_SECRET = _require_env("JWT_SECRET")