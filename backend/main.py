from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from services.youtube_service import fetch_comments
from services.clustering_service import cluster_comments
from services.ranking_service import rank_comments
from services.reply_service import generate_replies
from utils.helpers import extract_video_id
from services.filter_services import get_worth_replying_comments
from services.moderation_service import filter_spam
from services.classification_service import classify_comments

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
def get_comments(video_url: str, limit: int = 200):
    from fastapi import HTTPException
    
    try:
        video_id = extract_video_id(video_url)

        # 1. Fetch
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
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# Mount static frontend files
frontend_dir = os.path.join(os.path.dirname(__file__), "../frontend")
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")