from services.ai_reply_service import generate_ai_replies_batch


def generate_reply(comment):

    text = comment.clean_text.lower()

    if comment.is_question:
        return "Thanks for the question! We appreciate your interest."

    if "rickroll" in text or "rick rolled" in text:
        return "Looks like another successful rickroll 😆"

    if "robux" in text or "bobux" in text:
        return "Sorry, no free Robux here 😄"

    if "qr" in text:
        return "The QR code strikes again 😂"

    if "scan" in text or "scanned" in text:
        return "Curiosity won this round 😅"

    if "beluga" in text:
        return "Beluga got another one 😂"

    if any(word in text for word in [
        "great",
        "awesome",
        "amazing",
        "love",
        "legend",
        "peak",
        "best"
    ]):
        return "Thanks for the support! ❤️"

    return ""


def generate_replies(comments):
    if not comments:
        return comments

    # Extract all comment texts
    texts = [c.text for c in comments]

    try:
        # Generate replies in a single batch API call
        ai_replies = generate_ai_replies_batch(texts)
        print("AI REPLIES GENERATED:", ai_replies)
    except Exception as e:
        print("Failed to generate AI replies, falling back to rule-based replies. Error:", e)
        ai_replies = [None] * len(comments)

    # Assign generated replies or fall back to rule-based generation
    for i, comment in enumerate(comments):
        ai_reply = ai_replies[i] if i < len(ai_replies) else None
        if ai_reply:
            comment.suggested_reply = ai_reply
        else:
            comment.suggested_reply = generate_reply(comment)

    return comments