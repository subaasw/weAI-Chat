from urlextract import URLExtract
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode

extractor = URLExtract()

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