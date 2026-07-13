from fastapi import FastAPI, Header, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import os

from services.youtube_service import fetch_comments, fetch_comments_oauth, post_comment_reply_oauth
from services.clustering_service import cluster_comments
from services.ranking_service import rank_comments
from services.reply_service import generate_replies
from utils.helpers import extract_video_id
from services.filter_services import get_worth_replying_comments
from services.moderation_service import filter_spam
from services.classification_service import classify_comments
from services.auth_service import get_google_auth_url, exchange_code_for_tokens, get_user_info, create_jwt_token, decode_jwt_token
from services.channel_service import get_user_channel_videos

app = FastAPI()

# Enable CORS for frontend API calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "message": "YouTube Comment Intelligence Tool"
    }


@app.get("/comments")
def get_comments(
    video_url: str,
    limit: int = 200,
    authorization: Optional[str] = Header(None)
):
    from fastapi import HTTPException
    
    try:
        video_id = extract_video_id(video_url)

        # Retrieve access token from JWT in Authorization header if present
        access_token = None
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            if token not in ("null", "undefined", ""):
                try:
                    payload = decode_jwt_token(token)
                    access_token = payload.get("access_token")
                except Exception as e:
                    print("Error decoding JWT token in /comments:", e)

        # 1. Fetch comments (using OAuth client if authenticated, else public key)
        all_comments = []
        if access_token:
            try:
                all_comments = fetch_comments_oauth(video_id, access_token, limit=limit)
            except Exception as e:
                print("OAuth comment fetch failed, falling back to public client:", e)
                all_comments = fetch_comments(video_id, limit=limit)
        else:
            all_comments = fetch_comments(video_id, limit=limit)
            
        total_fetched = len(all_comments)

        # 2. Filter Spam
        filtered_comments = filter_spam(all_comments)
        spam_count = total_fetched - len(filtered_comments)

        # 3. Cluster and Classify
        clustered_comments = cluster_comments(filtered_comments)
        classified_comments = classify_comments(clustered_comments)

        # 4. Rank
        ranked_comments = rank_comments(classified_comments)

        # 5. Extract worth replying and generate replies
        worth_replying = get_worth_replying_comments(ranked_comments)
        worth_replying = generate_replies(worth_replying)

        # 6. Calculate category metrics
        category_counts = {
            "question": 0,
            "positive": 0,
            "complaint": 0,
            "funny": 0,
            "other": 0
        }
        for c in ranked_comments:
            cat = c.category or "other"
            if cat in category_counts:
                category_counts[cat] += 1
            else:
                category_counts[cat] = 1

        return {
            "summary": {
                "total_fetched": total_fetched,
                "spam_filtered": spam_count,
                "category_counts": category_counts
            },
            "worth_replying": [c.to_dict() for c in worth_replying],
            "all_comments": [c.to_dict() for c in ranked_comments]
        }
    except ValueError as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# Dependency to get access token from JWT
def get_current_user_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ")[1]
    try:
        payload = decode_jwt_token(token)
        return payload.get("access_token")
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/auth/login")
def login():
    try:
        url = get_google_auth_url()
        return RedirectResponse(url)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Login Error: {str(e)}")

@app.get("/auth/callback")
def auth_callback(code: str):
    try:
        tokens = exchange_code_for_tokens(code)
        access_token = tokens.get("access_token")
        if not access_token:
            raise ValueError("No access token in response")
        
        user_info = get_user_info(access_token)
        jwt_token = create_jwt_token(user_info, access_token)
        
        # Redirect back to the frontend with the token
        frontend_url = os.environ.get("FRONTEND_URL") or os.environ.get("RENDER_EXTERNAL_URL", "http://localhost:5500")
        return RedirectResponse(f"{frontend_url}/index.html?token={jwt_token}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/videos")
def get_videos(access_token: str = Depends(get_current_user_token)):
    try:
        videos = get_user_channel_videos(access_token)
        return {"videos": videos}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class ReplyRequest(BaseModel):
    comment_id: str
    reply_text: str

@app.post("/reply")
def post_reply(req: ReplyRequest, access_token: str = Depends(get_current_user_token)):
    try:
        res = post_comment_reply_oauth(req.comment_id, req.reply_text, access_token)
        return {"status": "success", "response": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class GenerateReplyRequest(BaseModel):
    comment_text: str

@app.post("/generate_reply")
def generate_single_reply(req: GenerateReplyRequest):
    try:
        from services.ai_reply_service import generate_ai_reply
        from services.reply_service import generate_reply
        from models.comment_model import Comment
        from utils.text_cleaning import clean_text, is_question
        
        reply = generate_ai_reply(req.comment_text)
        if not reply:
            dummy_comment = Comment(
                comment_id="dummy",
                text=req.comment_text,
                author="User",
                likes=0,
                reply_count=0,
                published_at=""
            )
            dummy_comment.clean_text = clean_text(dummy_comment.text)
            dummy_comment.is_question = is_question(dummy_comment.clean_text)
            reply = generate_reply(dummy_comment)
            
        return {"reply": reply}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
# Mount static frontend files
frontend_dir = os.path.join(os.path.dirname(__file__), "../frontend")
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")