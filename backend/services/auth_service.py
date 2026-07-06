# -*- coding: utf-8 -*-
import urllib.parse
import requests
import jwt
import time
from config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, JWT_SECRET

def get_google_auth_url():
    """Generates the Google OAuth2 consent screen URL."""
    if not GOOGLE_CLIENT_ID:
        raise ValueError("GOOGLE_CLIENT_ID is not configured in environment variables.")
        
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile https://www.googleapis.com/auth/youtube.force-ssl",
        "access_type": "offline",
        "prompt": "consent"
    }
    return "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)

def exchange_code_for_tokens(code):
    """Exchanges authorization code for access and refresh tokens."""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise ValueError("Google OAuth credentials are not fully configured.")
        
    url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    response = requests.post(url, data=data)
    if response.status_code != 200:
        raise Exception(f"OAuth token exchange failed: {response.text}")
    return response.json()

def get_user_info(access_token):
    """Fetches user email, name, and profile picture from Google UserInfo endpoint."""
    url = "https://www.googleapis.com/oauth2/v3/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Failed to retrieve Google user profile: {response.text}")
    return response.json()

def create_jwt_token(user_info, access_token):
    """Creates a secure JWT token encoding user profile and access token."""
    payload = {
        "email": user_info.get("email"),
        "name": user_info.get("name"),
        "picture": user_info.get("picture"),
        "access_token": access_token,
        "exp": int(time.time()) + (24 * 3600)  # Session active for 24 hours
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_jwt_token(token):
    """Decodes and validates a JWT token, returning the user session payload."""
    try:
        # If token is returned as a bytes object or string, jwt handles it
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise ValueError("Session expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid session token.")
