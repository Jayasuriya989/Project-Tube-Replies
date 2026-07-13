# -*- coding: utf-8 -*-
try:
    from googleapiclient.discovery import build  # type: ignore
except Exception:
    try:
        from apiclient.discovery import build  # type: ignore
    except Exception:
        def build(*args, **kwargs):
            raise ImportError(
                "googleapiclient.discovery.build is required. "
                "Install google-api-python-client: pip install google-api-python-client"
            )

from google.oauth2.credentials import Credentials
from config import API_KEY
from models.comment_model import Comment
from utils.text_cleaning import clean_text, is_question

# Lazy-initialized public YouTube client (avoids crash if API_KEY is not set)
_youtube_public = None

def _get_youtube_public():
    """Lazily create the public YouTube API client on first use."""
    global _youtube_public
    if _youtube_public is None:
        if not API_KEY:
            raise ValueError(
                "YOUTUBE_API_KEY is not configured. "
                "Set it in your environment variables or .env file."
            )
        _youtube_public = build("youtube", "v3", developerKey=API_KEY)
    return _youtube_public

def get_youtube_client(access_token):
    """Creates a YouTube API client authorized via the user's OAuth access token."""
    creds = Credentials(token=access_token)
    return build("youtube", "v3", credentials=creds)

def fetch_comments(video_id, limit=200):
    """Fetch comments using public API developer key (read-only fallback)."""
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
            request = _get_youtube_public().commentThreads().list(**kwargs)
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

def fetch_comments_oauth(video_id, access_token, limit=50):
    """Fetches top comments of a video using user OAuth access token."""
    youtube = get_youtube_client(access_token)
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
            print("Error executing YouTube OAuth comment list request:", e)
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

def post_comment_reply_oauth(parent_comment_id, reply_text, access_token):
    """Posts a reply to a YouTube comment thread on behalf of the user using OAuth2."""
    youtube = get_youtube_client(access_token)
    
    body = {
        "snippet": {
            "parentId": parent_comment_id,
            "textOriginal": reply_text
        }
    }
    
    request = youtube.comments().insert(
        part="snippet",
        body=body
    )
    return request.execute()