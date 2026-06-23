from sentence_transformers import SentenceTransformer

# Load once when server starts
model = SentenceTransformer("all-MiniLM-L6-v2")


def generate_embeddings(comments):
    """
    Convert comment text into vectors
    """

    texts = []

    for comment in comments:
        texts.append(comment.clean_text)

    embeddings = model.encode(
        texts,
        convert_to_numpy=True
    )

    return embeddings