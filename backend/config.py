import os
import logging
from dotenv import load_dotenv

# Resolve .env path relative to project root (one level above this config file)
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(dotenv_path, override=True)

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def _get_env(var_name: str) -> str:
    """Return the environment variable value or log a warning.
    Returns empty string if not set so the app can still start.
    """
    value = os.getenv(var_name)
    if not value:
        logger.warning(f"Environment variable {var_name} is not set. "
                       f"Related features will be unavailable.")
        return ""
    return value

# Optional API key (YouTube)
API_KEY = os.getenv("YOUTUBE_API_KEY") or os.getenv("API_KEY")

# Google OAuth credentials (warn if missing, don't crash)
GOOGLE_CLIENT_ID = _get_env("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = _get_env("GOOGLE_CLIENT_SECRET")

# Auto-detect Render URL for redirect URIs
_render_url = os.getenv("RENDER_EXTERNAL_URL", "")
_default_redirect = f"{_render_url}/auth/callback" if _render_url else "http://localhost:8000/auth/callback"
_default_frontend = _render_url if _render_url else "http://localhost:5500"

GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", _default_redirect)
FRONTEND_URL = os.getenv("FRONTEND_URL", _default_frontend)

# JWT secret for signing tokens (warn if missing, don't crash)
JWT_SECRET = _get_env("JWT_SECRET")