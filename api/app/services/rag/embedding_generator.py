from google import genai
from google.genai import types
from chromadb import Documents, EmbeddingFunction, Embeddings

from core.config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)

class GeminiEmbeddingFunction(EmbeddingFunction):
  def __call__(self, input: Documents) -> Embeddings:
    EMBEDDING_MODEL_ID = "models/embedding-001"
    response = client.models.embed_content(
        model=EMBEDDING_MODEL_ID,
        contents=input,
        config=types.EmbedContentConfig(
          task_type="retrieval_document",
        )
    )

    return response.embeddings[0].values
