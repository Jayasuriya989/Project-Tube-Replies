from models.comment_model import Comment
from services.clustering_service import cluster_comments

comments = [
    Comment("1", "I got rickrolled", "A", 0, 0, ""),
    Comment("2", "This QR code rickrolled me", "B", 0, 0, ""),
    Comment("3", "Great song", "C", 0, 0, ""),
]

for c in comments:
    c.clean_text = c.text.lower()

comments = cluster_comments(comments)

for c in comments:
    print(c.text, "=>", c.cluster_id)