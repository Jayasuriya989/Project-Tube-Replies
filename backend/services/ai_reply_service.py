import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-3.5-flash")


def generate_ai_reply(comment_text):

    try:

        prompt = f"""
You are a YouTube creator.

Write a short natural reply to this comment.

Comment:
{comment_text}

Rules:
- Maximum 1 sentence
- Friendly
- Human sounding
- Reply directly to the comment
"""

        response = model.generate_content(prompt)

        if response.text:
            return response.text.strip()

        return None

    except Exception as e:
        print("Gemini Error:", e)
        return None


def generate_ai_replies_batch(comments_text_list):
    """
    Given a list of comment texts, returns a list of suggested reply texts of the same length.
    Raises ValueError if API Key is missing or if the generation fails.
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable is missing or empty. Please add it to your Hugging Face Space Secrets (under Settings) or local .env file.")

    replies = [None] * len(comments_text_list)
    if not comments_text_list:
        return replies

    try:
        comments_data = [{"id": i, "text": text} for i, text in enumerate(comments_text_list)]
        
        prompt = f"""
You are a YouTube creator. Write a short, natural reply to each of these comments.

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
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )

        if response.text:
            replies_list = json.loads(response.text)
            for item in replies_list:
                if isinstance(item, dict) and "id" in item and "reply" in item:
                    idx = item["id"]
                    if 0 <= idx < len(comments_text_list):
                        replies[idx] = item["reply"].strip()
    except Exception as e:
        print("Gemini Batch Error:", e)
        raise ValueError(f"Gemini API Error: {str(e)}. Please check your API key and quota status.")

    return replies