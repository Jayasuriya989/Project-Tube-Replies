# -*- coding: utf-8 -*-
import re
import datetime
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

def get_youtube_client(access_token):
    """Creates a YouTube API client authorized via the user's OAuth access token."""
    creds = Credentials(token=access_token)
    return build("youtube", "v3", credentials=creds)

def parse_duration(duration_str):
    """Parses an ISO 8601 duration (e.g. PT18M42S) to human readable format (e.g. 18:42)."""
    pattern = re.compile(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?')
    match = pattern.match(duration_str)
    if not match:
        return "0:00"
        
    hours, minutes, seconds = match.groups()
    hours = int(hours) if hours else 0
    minutes = int(minutes) if minutes else 0
    seconds = int(seconds) if seconds else 0
    
    if hours > 0:
        return f"{hours}:{minutes:02d}:{seconds:02d}"
    else:
        return f"{minutes}:{seconds:02d}"

def parse_duration_seconds(duration_str):
    """Returns the duration of a video in seconds."""
    pattern = re.compile(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?')
    match = pattern.match(duration_str)
    if not match:
        return 0
    hours, minutes, seconds = match.groups()
    hours = int(hours) if hours else 0
    minutes = int(minutes) if minutes else 0
    seconds = int(seconds) if seconds else 0
    return hours * 3600 + minutes * 60 + seconds

def format_count(count_str):
    """Formats large integers into compact strings (e.g., 284000 to 284K)."""
    try:
        count = int(count_str)
    except (ValueError, TypeError):
        return "0"
    if count >= 1_000_000:
        val = count / 1_000_000
        return f"{val:.1f}M".replace(".0", "")
    if count >= 1_000:
        val = count / 1_000
        return f"{val:.1f}K".replace(".0", "")
    return str(count)

def format_date(date_str):
    """Converts a standard ISO timestamp to a friendly relative date (e.g. '2 days ago')."""
    try:
        # standard ISO format from YouTube: 2026-06-23T04:22:15Z
        # Removing Z and using timezone-aware parsing or offset truncation
        clean_date = date_str.replace("Z", "+00:00")
        dt = datetime.datetime.fromisoformat(clean_date)
        now = datetime.datetime.now(datetime.timezone.utc)
        diff = now - dt
        
        if diff.days == 0:
            if diff.seconds < 3600:
                return "Just now"
            return f"{diff.seconds // 3600} hours ago"
        if diff.days == 1:
            return "Yesterday"
        if diff.days < 7:
            return f"{diff.days} days ago"
        if diff.days < 30:
            weeks = diff.days // 7
            return f"{weeks} week{'s' if weeks > 1 else ''} ago"
        months = diff.days // 30
        return f"{months} month{'s' if months > 1 else ''} ago"
    except Exception:
        # Fallback to date split
        return date_str.split("T")[0]

def get_user_channel_videos(access_token, max_results=20):
    """Fetches user channel details and lists their videos and Shorts."""
    youtube = get_youtube_client(access_token)
    
    # 1. Fetch channel's contentDetails (to get the uploads playlist)
    channel_response = youtube.channels().list(
        part="contentDetails,snippet",
        mine=True
    ).execute()
    
    if not channel_response.get("items"):
        raise ValueError("No YouTube channel found associated with this Google account.")
        
    channel_item = channel_response["items"][0]
    uploads_playlist_id = channel_item["contentDetails"]["relatedPlaylists"]["uploads"]
    
    # 2. Fetch recent uploads playlist items
    playlist_response = youtube.playlistItems().list(
        part="snippet,contentDetails",
        playlistId=uploads_playlist_id,
        maxResults=max_results
    ).execute()
    
    items = playlist_response.get("items", [])
    video_ids = [item["contentDetails"]["videoId"] for item in items]
    
    if not video_ids:
        return []
        
    # 3. Retrieve actual video metadata (views, likes, comments count, duration)
    videos_details_response = youtube.videos().list(
        part="snippet,statistics,contentDetails",
        id=",".join(video_ids)
    ).execute()
    
    videos = []
    for item in videos_details_response.get("items", []):
        duration = item["contentDetails"]["duration"]
        formatted_duration = parse_duration(duration)
        
        # Determine if it's a Short (under 60 seconds)
        total_seconds = parse_duration_seconds(duration)
        is_short = total_seconds <= 60
        
        videos.append({
            "id": item["id"],
            "yt": item["id"],  # For backward compatibility with the frontend video ID
            "title": item["snippet"]["title"],
            "thumbnail": item["snippet"]["thumbnails"].get("medium", {}).get("url") or item["snippet"]["thumbnails"].get("default", {}).get("url"),
            "views": format_count(item["statistics"].get("viewCount", 0)),
            "likes": format_count(item["statistics"].get("likeCount", 0)),
            "commentCount": int(item["statistics"].get("commentCount", 0)),
            "date": format_date(item["snippet"]["publishedAt"]),
            "dur": formatted_duration,
            "type": "short" if is_short else "video"
        })
        
    return videos
