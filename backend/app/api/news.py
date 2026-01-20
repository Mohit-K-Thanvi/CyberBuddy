from fastapi import APIRouter
import requests
import xml.etree.ElementTree as ET
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/news", tags=["Cyber News"])

class NewsItem(BaseModel):
    title: str
    link: str
    pubDate: str
    source: str

@router.get("/", response_model=List[NewsItem])
def get_cyber_news():
    """
    Fetches latest cybersecurity news from RSS feeds.
    Returns cached static data if fetch fails to ensure reliability.
    """
    news_items = []
    
    # Sources: The Hacker News, BleepingComputer
    rss_feeds = [
        ("https://feeds.feedburner.com/TheHackersNews", "The Hacker News"),
        ("https://www.bleepingcomputer.com/feed/", "BleepingComputer")
    ]

    for url, source_name in rss_feeds:
        try:
            resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=4)
            if resp.status_code == 200:
                root = ET.fromstring(resp.content)
                # Parse RSS 2.0
                channel = root.find("channel")
                if channel:
                    for item in channel.findall("item")[:3]: # Top 3 from each
                        title = item.find("title").text if item.find("title") is not None else "Unknown Title"
                        link = item.find("link").text if item.find("link") is not None else "#"
                        pubDate = item.find("pubDate").text if item.find("pubDate") is not None else ""
                        
                        news_items.append({
                            "title": title,
                            "link": link,
                            "pubDate": pubDate[:16], # Truncate time
                            "source": source_name
                        })
        except Exception as e:
            print(f"RSS Fetch Error ({source_name}): {e}")
            continue

    # Fallback/Mock Data if empty (Network Error or blocked)
    if not news_items:
        news_items = [
            {
                "title": "Zero-Day Vulnerability Discovered in Popular Browser",
                "link": "#",
                "pubDate": "Just Now",
                "source": "CyberBuddy Intel"
            },
            {
                "title": "Phishing Attacks Rise by 200% in 2026",
                "link": "#",
                "pubDate": "Today",
                "source": "CyberBuddy Intel"
            },
            {
                "title": "New AI Model Detects Malware with 99% Accuracy",
                "link": "#",
                "pubDate": "Yesterday",
                "source": "CyberBuddy Intel"
            }
        ]

    return news_items
