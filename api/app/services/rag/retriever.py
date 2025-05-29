import re
from typing import Optional, List, Dict

import chromadb

from .embedding_generator import GeminiEmbeddingFunction
from core.config import VECTOR_DB_DIR

class ChromaDBManager:
    def __init__(self, collection_name: str = 'chatbot_trainings', store_path: str = VECTOR_DB_DIR):
        self.client = chromadb.PersistentClient(path=store_path)
        self.collection = self.client.get_or_create_collection(name=collection_name, embedding_function=GeminiEmbeddingFunction())

    def text_cleanup(self, text: str) -> str:
        text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
        text = re.sub(r'\s+', ' ', text)
        text = text.lower()
        return text.strip()

    def ingest(self, documents: List[str], ids: Optional[List[str]] = None, metadatas: Optional[List[Dict]] = None):
        clean_docs = [self.text_cleanup(doc) for doc in documents]
        self.collection.add(
            documents=clean_docs,
            metadatas=metadatas,
            ids=ids,
        )

    def query(self, query_texts: List[str], n_results: int = 2) -> Dict:
        return self.collection.query(query_texts=query_texts, n_results=n_results)
    
    def upsert(self, documents: List[str], ids: Optional[List[str]] = None, metadatas: Optional[List[Dict]] = None):
        clean_docs = [self.text_cleanup(doc) for doc in documents]

        self.collection.upsert(
            documents=clean_docs,
            metadatas=metadatas,
            ids=ids,
        )

    def delete(self, ids: List[str]):
        self.collection.delete(ids=ids)
