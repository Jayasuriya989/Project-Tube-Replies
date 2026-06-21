from services.youtube_service import fetch_comments
from services.clustering_service import cluster_comments
from utils.helpers import extract_video_id

video_url = input("Video URL: ")

video_id = extract_video_id(video_url)

comments = fetch_comments(video_id)

comments = cluster_comments(comments)

print("\nCLUSTER RESULTS\n")

for comment in comments[:30]:
    safe_text = comment.text[:80].encode('ascii', errors='replace').decode('ascii')
    print(
        f"Cluster {comment.cluster_id} | {safe_text}"
    )