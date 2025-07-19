from fastapi import FastAPI, UploadFile, File, Body
from .rag import RAG
import os

app = FastAPI()
rag = RAG(qdrant_host=os.environ.get("QDRANT_HOST", "localhost"))

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    file_path = f"/tmp/{file.filename}"
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    rag.add_document(file_path)
    os.remove(file_path)
    return {"message": "Document uploaded successfully"}

@app.post("/query")
def query(q: str = Body(...)):
    results = rag.query(q)
    return {"results": results}