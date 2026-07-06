import os
from dotenv import load_dotenv
import google.generativeai as genai
import json

load_dotenv()
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

comments_text_list = ["nice video", "this is terrible"]
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
print("Sending request...")
response = model.generate_content(
    prompt,
    generation_config={"response_mime_type": "application/json"}
)

print("Raw Response:", repr(response.text))
try:
    data = json.loads(response.text)
    print("Parsed JSON:", data)
except Exception as e:
    print("Failed to parse JSON:", e)
