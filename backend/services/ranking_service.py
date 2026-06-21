import math


def rank_comments(comments):

    for comment in comments:

        score = 0

        # likes
        score += math.log(comment.likes + 1) * 5

        # replies
        score += min(comment.reply_count, 20) * 10

        # questions
        if comment.is_question:
            score += 50

        # longer comments
        if len(comment.clean_text.split()) > 5:
            score += 10

        comment.score = round(score, 2)

    comments.sort(
        key=lambda x: x.score,
        reverse=True
    )

    return comments