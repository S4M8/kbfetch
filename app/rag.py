from sentence_transformers import SentenceTransformer
import chromadb

class RAG:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        self.model = SentenceTransformer(model_name)
        self.client = chromadb.Client()
        self.collection = self.client.create_collection("knowledge_base")

    def add_documents(self, documents):
        for i, doc in enumerate(documents):
            embedding = self.model.encode(doc)
            self.collection.add(
                embeddings=[embedding.tolist()],
                documents=[doc],
                ids=[str(i)]
            )

    def query(self, query_text, n_results=2):
        embedding = self.model.encode(query_text)
        results = self.collection.query(
            query_embeddings=[embedding.tolist()],
            n_results=n_results
        )
        return results['documents'][0]
