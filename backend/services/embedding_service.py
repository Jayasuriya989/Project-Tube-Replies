from sentence_transformers import SentenceTransformer

# Lazy-loaded model (avoids OOM at startup on memory-constrained hosts)
_model = None

def _get_model():
    """Lazily load the sentence-transformer model on first use."""
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def generate_embeddings(comments):
    """
    Convert comment text into vectors
    """

    texts = []

    for comment in comments:
        texts.append(comment.clean_text)

    embeddings = _get_model().encode(
        texts,
        convert_to_numpy=True
    )

    return embeddings