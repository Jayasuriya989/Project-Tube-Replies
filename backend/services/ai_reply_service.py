import os
import json
import time
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables from .env file
# Resolve path relative to project root (two levels up: services/ -> backend/ -> project root)
_dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
load_dotenv(_dotenv_path, override=True)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(f"GEMINI_API_KEY not found. Looked for .env at: {_dotenv_path}")

client = genai.Client(api_key=GEMINI_API_KEY)
MODEL = "gemini-2.5-flash"


def generate_ai_reply(comment_text):
    max_retries = 5
    base_delay = 5.0
    for attempt in range(max_retries):
        try:
            prompt = f"""You are a YouTube creator.

Write a short natural reply to this comment.

Comment:
{comment_text}

Rules:
- Maximum 1 sentence
- Friendly
- Human sounding
- Reply directly to the comment
"""
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
            )

            if response.text:
                return response.text.strip()

            return None

        except Exception as e:
            err_str = str(e).lower()
            if (
                "429" in err_str
                or "quota" in err_str
                or "exhausted" in err_str
                or "rate limit" in err_str
                or "resource_exhausted" in err_str
            ) and attempt < max_retries - 1:
                sleep_time = base_delay * (2 ** attempt)
                print(f"Gemini Rate Limit hit. Retrying in {sleep_time}s... (Attempt {attempt + 1}/{max_retries})")
                time.sleep(sleep_time)
                continue
            else:
                print("Gemini Error:", e)
                return None


def generate_ai_replies_batch(comments_text_list):
    """
    Given a list of comment texts, returns a list of suggested reply texts of the same length.
    Raises ValueError if the generation fails.
    """
    replies = [None] * len(comments_text_list)
    if not comments_text_list:
        return replies

    max_retries = 5
    base_delay = 5.0
    for attempt in range(max_retries):
        try:
            comments_data = [{"id": i, "text": text} for i, text in enumerate(comments_text_list)]

            prompt = f"""You are a YouTube creator. Write a short, natural reply to each of these comments.

Comments to reply to:
{json.dumps(comments_data, indent=2)}

Rules for each reply:
- Maximum 1 sentence
- Friendly
- Human sounding
- Reply directly to the comment's content

You MUST return your output in JSON format matching this exact schema:
[
  {{
    "id": 0,
    "reply": "draft reply text here"
  }},
  ...
]
"""
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                ),
            )

            if response.text:
                replies_list = json.loads(response.text)
                for item in replies_list:
                    if isinstance(item, dict) and "id" in item and "reply" in item:
                        idx = item["id"]
                        if 0 <= idx < len(comments_text_list):
                            replies[idx] = item["reply"].strip()
            # If success, break the retry loop
            break

        except Exception as e:
            err_str = str(e).lower()
            if (
                "429" in err_str
                or "quota" in err_str
                or "exhausted" in err_str
                or "rate limit" in err_str
                or "resource_exhausted" in err_str
            ) and attempt < max_retries - 1:
                sleep_time = base_delay * (2 ** attempt)
                print(f"Gemini Batch Rate Limit hit. Retrying in {sleep_time}s... (Attempt {attempt + 1}/{max_retries})")
                time.sleep(sleep_time)
                continue
            else:
                print("Gemini Batch Error:", e)
                raise ValueError(f"Gemini API Error: {str(e)}. Please check your API key and quota status.")

    return replies