import json 

from google import genai
from core.config import GEMINI_API_KEY
from urlextract import URLExtract

import asyncio
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode

extractor = URLExtract()
client = genai.Client(api_key=GEMINI_API_KEY)

browser_cfg = BrowserConfig(
    headless=True,
    text_mode=True,
)

run_config = CrawlerRunConfig(
    cache_mode=CacheMode.BYPASS,
    excluded_tags=["a", "nav", "header", "footer", "aside", "script", "style", "img", "svg", "i"],
    exclude_external_links=True,
    stream=True,
)

async def crawl_and_stream_urls(url):
    async with AsyncWebCrawler(config=browser_cfg) as crawler:
        result = await crawler.arun(
            url=url,
            config=run_config
        )
        return result.markdown[:300]

def chat_with_gemini_stream(message: str):
    urls = extractor.find_urls(message)
    scrapped_data = []
    completed_urls = []

    if len(urls) > 0:
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        for url in urls:
            async def process_single_url():
                try:
                    text = await crawl_and_stream_urls(url)
                    completed_urls.append(url)
                    scrapped_data.append(text)
                    return text
                except Exception as e:
                    print(f"Error crawling {url}: {e}")
                    return f"Error processing {url}"
            
            result = loop.run_until_complete(process_single_url())
            
            yield json.dumps({
                "urls_config": {
                    "inProgress": len(completed_urls) < len(urls),
                    "completed_urls": completed_urls,
                    "urls": urls
                },
                "text": result
            })
    
    for chunk in client.models.generate_content_stream(
        model="gemini-2.0-flash", contents = scrapped_data if urls else message,
    ):
        yield chunk.text
