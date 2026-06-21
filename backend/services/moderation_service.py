def is_spam(comment):

    text = comment.text.lower()

    spam_words = [
        "discord.gg",
        "telegram",
        "t.me",
        "subscribe",
        "follow me",
        "check my channel",
        "free robux",
        "free crypto",
        "earn money"
    ]

    return any(word in text for word in spam_words)


def filter_spam(comments):

    filtered = []

    for comment in comments:

        if is_spam(comment):
            continue

        filtered.append(comment)

    return filtered