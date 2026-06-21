from services.youtube_service import fetch_comments
from services.reply_service import generate_replies
from utils.helpers import extract_video_id

video_url = input("Video URL: ")

video_id = extract_video_id(video_url)

comments = fetch_comments(video_id)

comments = generate_replies(comments[:5])

for c in comments[:10]:
    print()
    safe_text = c.text.encode('ascii', errors='replace').decode('ascii')
    safe_reply = c.suggested_reply.encode('ascii', errors='replace').decode('ascii') if c.suggested_reply else ""
    print("COMMENT:", safe_text)
    print("REPLY:", safe_reply)