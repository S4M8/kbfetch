from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient, models
from .document_processor import DocumentProcessor

class RAG:
    def __init__(self, model_name='all-MiniLM-L6-v2', qdrant_host='localhost', qdrant_port=6333):
        self.model = SentenceTransformer(model_name)
        self.qdrant_client = QdrantClient(url=qdrant_host)
        self.collection_name = "knowledge_base"
        self.document_processor = DocumentProcessor()
        self.create_collection()

    def create_collection(self):
        try:
            self.qdrant_client.get_collection(collection_name=self.collection_name)
        except Exception:
            self.qdrant_client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(size=self.model.get_sentence_embedding_dimension(), distance=models.Distance.COSINE),
            )

    def add_document(self, file_path):
        chunks = self.document_processor.process_document(file_path)
        embeddings = self.model.encode(chunks)
        self.qdrant_client.upsert(
            collection_name=self.collection_name,
            points=[
                models.PointStruct(
                    id=i,
                    vector=embedding.tolist(),
                    payload={"text": chunk}
                )
                for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
            ]
        )

    def query(self, query_text, n_results=2):
        embedding = self.model.encode(query_text)
        results = self.qdrant_client.search(
            collection_name=self.collection_name,
            query_vector=embedding.tolist(),
            limit=n_results
        )
        return [hit.payload['text'] for hit in results]
