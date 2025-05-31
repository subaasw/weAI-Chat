from urlextract import URLExtract
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode, LXMLWebScrapingStrategy
from crawl4ai.deep_crawling import BestFirstCrawlingStrategy

extractor = URLExtract()

browser_cfg = BrowserConfig(
    headless=True,
    text_mode=True,
)

def get_configs(stream: bool = True):
    run_config = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        excluded_tags=["a", "nav", "header", "footer", "aside", "script", "style", "img", "svg", "i"],
        exclude_external_links=True,
        stream=stream,
    )
    return run_config

async def crawl_and_stream_urls(url: str):
    async with AsyncWebCrawler(config=browser_cfg) as crawler:
        result = await crawler.arun(
            url=url,
            config=get_configs()
        )
        return result.markdown[:300]

def deep_crawl_configs() -> CrawlerRunConfig:
    return CrawlerRunConfig(
        excluded_tags=["img", "iframe"],
        deep_crawl_strategy=BestFirstCrawlingStrategy(
            max_depth=2,
            include_external=False,
            max_pages=5,
        ),
        scraping_strategy=LXMLWebScrapingStrategy(),
        verbose=True,
    )

async def extract_urls(mainUrl: str):
    async with AsyncWebCrawler() as crawler:
        results = await crawler.arun(mainUrl, config=deep_crawl_configs())

    print(f"Crawled {len(results)} pages in total")

    links = []
    for result in filter(lambda x: x != mainUrl, results):
        if len(links) == 4:
            break

        url = result.url.rstrip("/")
        if url not in [link.rstrip("/") for link in links]:
            links.append(result.url)

    return links


async def crawl_website(url: str):
    config = get_configs(stream=False)
    links = await extract_urls(str(url))

    website_metadata = []
    for link in links:
        async with AsyncWebCrawler() as crawler:
            result = await crawler.arun(link, config=config)

        if not result.success or not result.markdown:
            return
        

        title = result.metadata.get("title")
        content = result.markdown.fit_markdown

        website_metadata.append({"title": title, "content": content, "link": link})

    return website_metadata
