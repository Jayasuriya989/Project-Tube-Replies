def get_worth_replying_comments(comments, limit=20):

    best_per_cluster = {}

    for comment in comments:

        cluster = comment.cluster_id

        if cluster not in best_per_cluster:
            best_per_cluster[cluster] = comment

        elif comment.score > best_per_cluster[cluster].score:
            best_per_cluster[cluster] = comment

    result = list(best_per_cluster.values())

    result.sort(
        key=lambda x: x.score,
        reverse=True
    )

    return result[:limit]