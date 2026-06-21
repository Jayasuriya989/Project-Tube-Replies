def extract_video_id(url):
    if "v=" in url:
        return url.split("v=")[1].split("&")[0]
    return url