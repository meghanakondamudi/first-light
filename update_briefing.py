import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data.json"

FEEDS = [
    ("World", "BBC World", "https://feeds.bbci.co.uk/news/world/rss.xml"),
    ("India", "The Hindu", "https://www.thehindu.com/news/national/feeder/default.rss"),
    ("Business", "BBC Business", "https://feeds.bbci.co.uk/news/business/rss.xml"),
    ("Sports", "ESPN", "https://www.espn.com/espn/rss/news"),
    ("Tech", "TechCrunch", "https://techcrunch.com/feed/")
]

ESSAY_FEEDS = [
    ("Literature", "Literary Hub", "https://lithub.com/feed/"),
    ("Ideas", "Aeon", "https://aeon.co/feed.rss"),
]

LOCATIONS = {
    "tenali": (16.243, 80.640),
    "geneva": (46.204, 6.143),
}


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "FirstLight/1.0"})
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read()


def clean(text):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", text or "")).strip()


def get_headlines():
    stories = []
    for category, source, url in FEEDS:
        try:
            root = ET.fromstring(fetch(url))
            items = root.findall(".//item")[:3]
            for item in items:
                title = clean(item.findtext("title"))
                link = item.findtext("link") or "https://news.google.com/"
                if title:
                    stories.append({"category": category, "title": title, "source": source, "url": link.strip()})
        except Exception as error:
            print(f"Skipping {source}: {error}")
    return stories[:15]


def feed_items(root):
    items = root.findall(".//item")
    if items:
        return [(item.findtext("title"), item.findtext("link"), item.findtext("description"), item.findtext("dc:creator", namespaces={"dc": "http://purl.org/dc/elements/1.1/"})) for item in items]
    atom_namespace = "{http://www.w3.org/2005/Atom}"
    return [(entry.findtext(f"{atom_namespace}title"), (entry.find(f"{atom_namespace}link").attrib.get("href") if entry.find(f"{atom_namespace}link") is not None else ""), entry.findtext(f"{atom_namespace}summary"), entry.findtext(f"{atom_namespace}author/{atom_namespace}name")) for entry in root.findall(f".//{atom_namespace}entry")]


def get_essays():
    essays = []
    for essay_type, source, url in ESSAY_FEEDS:
        try:
            root = ET.fromstring(fetch(url))
            item = feed_items(root)[0]
            title, link, summary, author = item
            essays.append({
                "type": essay_type,
                "title": clean(title),
                "summary": clean(summary)[:240],
                "author": clean(author) or source,
                "source": source,
                "url": (link or "").strip(),
            })
        except Exception as error:
            print(f"Skipping {source}: {error}")
    return essays


def weather_kind(code):
    if code in (0, 1):
        return "clear", "Mostly sunny"
    if code in (2, 3, 45, 48):
        return "cloudy", "Overcast skies"
    if code in (71, 73, 75, 77, 85, 86):
        return "snow", "Snow showers"
    if code in (95, 96, 99):
        return "storm", "Thunderstorms"
    return "rain", "Light rain"


def get_weather():
    result = {}
    for name, (latitude, longitude) in LOCATIONS.items():
        query = urllib.parse.urlencode({
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
            "daily": "temperature_2m_max",
            "timezone": "auto",
            "forecast_days": 1,
        })
        try:
            payload = json.loads(fetch(f"https://api.open-meteo.com/v1/forecast?{query}"))
            current = payload["current"]
            kind, condition = weather_kind(current["weather_code"])
            result[name] = {
                "temperature": current["temperature_2m"],
                "apparent": current["apparent_temperature"],
                "humidity": current["relative_humidity_2m"],
                "wind": current["wind_speed_10m"],
                "high": payload["daily"]["temperature_2m_max"][0],
                "kind": kind,
                "condition": condition,
            }
        except Exception as error:
            print(f"Skipping {name} weather: {error}")
    return result


data = {
    "updatedAt": datetime.now(timezone.utc).date().isoformat(),
    "headlines": get_headlines(),
    "essays": get_essays(),
    "weather": get_weather(),
}
OUTPUT.write_text(json.dumps(data, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
print(f"Wrote {len(data['headlines'])} headlines and {len(data['essays'])} essays to {OUTPUT}")
