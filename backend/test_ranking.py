from services.youtube_service import fetch_comments
from services.ranking_service import rank_comments
from utils.helpers import extract_video_id

video_url = input("Video URL: ")

video_id = extract_video_id(video_url)

comments = fetch_comments(video_id)

comments = rank_comments(comments)

comments.sort(
    key=lambda x: x.score,
    reverse=True
)

for c in comments[:10]:
    safe_text = c.text[:80].encode('ascii', errors='replace').decode('ascii')
    print(
        c.score,
        "|",
        safe_text
    )