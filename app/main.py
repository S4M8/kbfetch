from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from .rag import RAG
import os

app = FastAPI()
rag = RAG(qdrant_host=os.environ.get("QDRANT_HOST", "http://vector_db:6333"))

class QueryRequest(BaseModel):
    q: str

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    file_path = f"/tmp/{file.filename}"
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    rag.add_document(file_path)
    os.remove(file_path)
    return {"message": "Document uploaded successfully"}

@app.post("/query")
async def query(request: QueryRequest):
    results = await rag.query(request.q)
    return {"results": results}