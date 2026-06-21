try:
    from googleapiclient.discovery import build  # type: ignore
except Exception:
    # Fallback for environments where googleapiclient isn't installed or
    # the import cannot be resolved by linters/IDE. If the real library is
    # unavailable at runtime this will raise a clear ImportError when used.
    try:
        from apiclient.discovery import build  # type: ignore
    except Exception:
        def build(*args, **kwargs):
            raise ImportError(
                "googleapiclient.discovery.build is required. "
                "Install google-api-python-client: pip install google-api-python-client"
            )

from config import API_KEY
from models.comment_model import Comment
from utils.text_cleaning import clean_text, is_question


youtube = build(
    "youtube",
    "v3",
    developerKey=API_KEY
)


def fetch_comments(video_id, limit=200):
    comments = []
    next_page_token = None

    while len(comments) < limit:
        max_results_for_page = min(limit - len(comments), 100)

        kwargs = {
            "part": "snippet",
            "videoId": video_id,
            "maxResults": max_results_for_page,
            "textFormat": "plainText"
        }
        if next_page_token:
            kwargs["pageToken"] = next_page_token

        try:
            request = youtube.commentThreads().list(**kwargs)
            response = request.execute()
        except Exception as e:
            print("Error executing YouTube list request:", e)
            break

        items = response.get("items", [])
        if not items:
            break

        for item in items:
            comment_snippet = (
                item["snippet"]
                ["topLevelComment"]
                ["snippet"]
            )

            comment = Comment(
                comment_id=item["snippet"]["topLevelComment"]["id"],
                text=comment_snippet["textDisplay"],
                author=comment_snippet["authorDisplayName"],
                likes=comment_snippet["likeCount"],
                reply_count=item["snippet"]["totalReplyCount"],
                published_at=comment_snippet["publishedAt"]
            )
            comment.clean_text = clean_text(comment.text)
            comment.is_question = is_question(comment.clean_text)

            comments.append(comment)
            if len(comments) >= limit:
                break

        next_page_token = response.get("nextPageToken")
        if not next_page_token:
            break

    return comments