from fastapi import FastAPI
from .rag import RAG

app = FastAPI()
rag = RAG()

# Example documents to populate the knowledge base
# In a real application, these would come from a file or database
rag.add_documents([
    "The capital of France is Paris.",
    "The Eiffel Tower is located in Paris.",
    "The currency of France is the Euro."
])

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/query")
def query(q: str):
    results = rag.query(q)
    return {"results": results}
