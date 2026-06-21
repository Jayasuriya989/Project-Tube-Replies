import re

QUESTION_WORDS = {
    "what",
    "why",
    "how",
    "when",
    "where",
    "who",
    "which",
    "can",
    "could",
    "does",
    "do",
    "did",
    "is",
    "are",
    "was",
    "were",
    "will",
    "would",
    "should",
    "may",
    "might",
    "enna",
    "epdi",
    "yen",
    "enga",
    "yaru"
}


def clean_text(text):
    """
    Clean comment text while preserving Unicode characters.
    """

    if not text:
        return ""

    text = text.lower()

    # Remove URLs
    text = re.sub(r"http\S+", "", text)

    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def is_question(text):

    if not text:
        return False

    text = text.strip().lower()

    # Question marks
    if "?" in text or "？" in text:
        return True

    english_words = {
        "what", "why", "how", "when",
        "where", "who", "which",
        "can", "could", "does", "do",
        "did", "is", "are", "was",
        "were", "will", "would",
        "should", "may", "might"
    }

    tamil_words = {
        "enga",
        "epdi",
        "enna",
        "ethuku",
        "yaaru",
        "yen"
    }

    words = text.split()

    if not words:
        return False

    first_word = words[0]

    return (
        first_word in english_words
        or first_word in tamil_words
    )