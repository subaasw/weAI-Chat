import json
from typing import Optional, Literal, List, TypedDict

import asyncio
from google import genai
from google.genai import types

from services.rag.retriever import ChromaDBManager
from core.config import GEMINI_API_KEY
from .crawler import extractor, crawl_and_stream_urls

client = genai.Client(api_key=GEMINI_API_KEY)

GEMINI_MODEL = 'gemini-2.0-flash-001'
chromadb = ChromaDBManager()

class HistoryItem(TypedDict):
    role: Literal['user', 'assistant']
    content: str

def chat_with_gemini(message: str, history: Optional[List[HistoryItem]] = None):
    userContent = types.Content(
        role='user',
        parts=[types.Part.from_text(text=message + "\n\n `Based on this conversation, generate a 3-5 word clean text title that must clearly mention the main topic or theme.`")]
    )
    
    contents = []
    for item in history:
        contents.append(
            types.Content(
                role=item.role if item.role == 'assistant' else 'user',
                parts=[types.Part.from_text(text=item.content)]
            )
        )

    contents.append(userContent)    
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        config=types.GenerateContentConfig(
            system_instruction="You are a conversation analyzer that generates relevant conversation title in clean text.",
            max_output_tokens=15,
        ),
        contents=contents
    )
    return response.text

def chat_with_gemini_stream(message: str, history: Optional[List[HistoryItem]] = None):
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

    contents = []
    if history:
        for item in history:
            contents.append(
                types.Content(
                    role=item.role if item.role == 'assistant' else 'user',
                    parts=[types.Part.from_text(text=item.content)]
                )
            )

    context = chromadb.query(query_texts=[message])
    prompt = (
        """
        You are a helpful and informative bot that answers questions using
        text from the reference passage included below.
        Be sure to respond in a complete sentence, being comprehensive,
        including all relevant background information.
        However, you are talking to a non-technical audience, so be sure to
        break down complicated concepts and strike a friendly
        and converstional tone. If the passage is irrelevant to the answer,
        you may ignore it.
        QUESTION: '{query}'
        PASSAGE: '{relevant_passage}'

        ANSWER:
        """
    ).format(query=message, relevant_passage=context)

    contents.append(
        types.Content(
            role='user',
            parts=[types.Part.from_text(text=scrapped_data if urls else prompt)]
        )
    )
    
    for chunk in client.models.generate_content_stream(
        model=GEMINI_MODEL,
        config=types.GenerateContentConfig(
            system_instruction= "You are a helpful assistant",
            temperature=1,
            # max_output_tokens=500,
        ),
        contents = contents
    ):
        yield chunk.text
