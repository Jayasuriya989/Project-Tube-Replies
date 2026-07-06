---
title: TubeReplies
emoji: 💬
colorFrom: red
colorTo: gray
sdk: docker
app_port: 7860
pinned: false
---

# TubeReplies 💬

TubeReplies is an AI-powered YouTube Comment Intelligence Tool built for creators to instantly fetch, clean, cluster, categorize, and draft context-aware replies to video comments using **Gemini 3.5 Flash** and sentence embeddings.

## Local Development

1. Run the backend server:
   ```bash
   cd backend
   python -m uvicorn main:app --port 8000
   ```

2. Serve the frontend static files:
   ```bash
   cd frontend
   python -m http.server 8080
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## Deploying to Hugging Face Spaces

1. Create a new Space on **Hugging Face** (https://huggingface.co/new-space).
2. Choose **Docker** as the SDK (select **Blank** template).
3. Clone the space repository locally or upload these files directly to the Space repository:
   - `Dockerfile`
   - `requirements.txt`
   - `README.md` (retaining the frontmatter metadata at the top)
   - `backend/` directory
   - `frontend/` directory
4. Once committed, Hugging Face will automatically build the Docker image and deploy your website!
