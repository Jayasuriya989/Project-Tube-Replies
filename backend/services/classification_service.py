def classify_comment(comment):

    text = comment.clean_text.lower()

    if comment.is_question:
        return "question"

    if any(word in text for word in [
        "love",
        "great",
        "awesome",
        "amazing",
        "best",
        "peak"
    ]):
        return "positive"

    if any(word in text for word in [
        "hate",
        "bad",
        "worst",
        "boring",
        "terrible"
    ]):
        return "complaint"

    if any(word in text for word in [
        "rickroll",
        "robux",
        "lol",
        "lmao",
        "😂"
    ]):
        return "funny"

    return "other"


def classify_comments(comments):

    for comment in comments:
        comment.category = classify_comment(comment)

    return comments