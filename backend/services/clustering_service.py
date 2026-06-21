from sklearn.cluster import DBSCAN
import numpy as np

from services.embedding_service import generate_embeddings


def cluster_comments(comments):
    """
    Group similar comments together using DBSCAN
    """

    if not comments:
        return comments

    embeddings = generate_embeddings(comments)

    clustering = DBSCAN(
        eps=0.4,
        min_samples=2,
        metric="cosine"
    )

    labels = clustering.fit_predict(
        np.array(embeddings)
    )

    for comment, label in zip(comments, labels):
        comment.cluster_id = int(label)

    return comments