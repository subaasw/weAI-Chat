import re
from typing import Optional, List, Dict

import chromadb
from chonkie import SentenceChunker

from core.config import VECTOR_DB_DIR

class Chunker:
    """Semantic chunker using SDPMChunker from Chonkie."""

    def __init__(self, chunk_size: int = 256):
        self.chunker = SentenceChunker(chunk_overlap=50, chunk_size=chunk_size)

    def chunk(self, text: str):
        return self.chunker.chunk(text)

    def batch_chunks(self, texts: List[str]):
        return self.chunker.chunk_batch(texts)

class ChromaDBManager:
    def __init__(self, collection_name: str = 'chatbot_trainings', store_path: str = VECTOR_DB_DIR):
        self.chunker = Chunker()
        self.client = chromadb.PersistentClient(path=store_path)
        self.collection = self.client.get_or_create_collection(name=collection_name)

    def text_cleanup(self, text: str) -> str:
        text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
        text = re.sub(r'\s+', ' ', text)
        text = text.lower()
        return text.strip()

    def ingest(self, documents: List[str], id: str):
        return self.upsert(documents, id)

    def query(self, query_texts: List[str], n_results: int = 3) -> Dict:
        result = self.collection.query(query_texts=query_texts, n_results=n_results)
        return result['documents']
    
    def upsert(self, documents: List[str], documentId: str):
        batch_chunks = self.chunker.batch_chunks(documents)

        texts = []
        for doc_chunks in batch_chunks:
            for chunk in doc_chunks:
                texts.append(self.text_cleanup(chunk.text))

        ids = [f"{documentId}_chunk_{i}" for i in range(len(texts))]
        metadatas = [{"document_id": documentId, "chunk_index": i} for i in range(len(texts))]

        self.collection.upsert(
            documents=texts,
            metadatas=metadatas,
            ids=ids,
        )

    def delete(self, ids: List[str]):
        for document_id in ids:
            self.collection.delete(where={"document_id": {"$eq": document_id}})
