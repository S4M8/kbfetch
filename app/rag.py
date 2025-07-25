from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient, models
from .document_processor import DocumentProcessor
import httpx
import os
import json
import uuid 

class RAG:
    def __init__(self, model_name='all-MiniLM-L6-v2', qdrant_host='localhost', qdrant_port=6333):
        self.embedding_model = SentenceTransformer(model_name)
        if qdrant_host.startswith('http'):
            self.qdrant_client = QdrantClient(url=qdrant_host)
        else:
            self.qdrant_client = QdrantClient(host=qdrant_host, port=qdrant_port)
        
        self.collection_name = "knowledge_base"
        self.document_processor = DocumentProcessor()
        self.create_collection()
        self.ollama_host = os.environ.get("OLLAMA_HOST", "http://llm_service:11434")
        self.llm_model = "phi3"

    def create_collection(self):
        try:
            self.qdrant_client.get_collection(collection_name=self.collection_name)
        except Exception:
            self.qdrant_client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=self.embedding_model.get_sentence_embedding_dimension(), 
                    distance=models.Distance.COSINE
                ),
            )

    def add_document(self, file_path):
        chunks = self.document_processor.process_document(file_path)
        embeddings = self.embedding_model.encode(chunks)
        
        points = []
        for chunk, embedding in zip(chunks, embeddings):
            points.append(models.PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding.tolist(),
                payload={"text": chunk}
            ))
        
        self.qdrant_client.upsert(
            collection_name=self.collection_name,
            points=points
        )

    async def query(self, query_text, n_results=2):
        query_embedding = self.embedding_model.encode(query_text)
        search_results = self.qdrant_client.search(
            collection_name=self.collection_name,
            query_vector=query_embedding.tolist(),
            limit=n_results
        )
        
        context = "\n\n".join([hit.payload['text'] for hit in search_results])

        prompt = f"Using the following context, answer the question:\n\nContext: {context}\n\nQuestion: {query_text}\nAnswer:"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.ollama_host}/api/generate",
                    json={
                        "model": self.llm_model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "num_predict": 1000,
                            "temperature": 0.1,
                        },
                    },
                    timeout=60.0,
                )
                response.raise_for_status()
                
                result = response.json()
                return result.get("response", "No response generated")
                
            except httpx.RequestError as e:
                return f"Error communicating with Ollama service: {e}"
            except httpx.HTTPStatusError as e:
                return f"Ollama service returned an error: {e.response.text}"
            except Exception as e:
                return f"An unexpected error occurred during LLM generation: {e}"