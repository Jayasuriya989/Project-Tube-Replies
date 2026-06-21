import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

API_KEY = os.environ.get("YOUTUBE_API_KEY") or os.environ.get("API_KEY")