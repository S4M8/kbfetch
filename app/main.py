from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from .rag import RAG
import os

# Define the directory to store uploaded files
DOCS_DIR = "/docs"
os.makedirs(DOCS_DIR, exist_ok=True)

app = FastAPI()

# API routes are prefixed with /api
api_router = FastAPI()
rag = RAG(qdrant_host=os.environ.get("QDRANT_HOST", "vector_db"))

class QueryRequest(BaseModel):
    q: str

@api_router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    file_path = os.path.join(DOCS_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    
    rag.add_document(file_path)
    
    return {"message": "Document uploaded successfully", "filename": file.filename}

@api_router.post("/query")
async def query(request: QueryRequest):
    results = await rag.query(request.q)
    return {"results": results}

@api_router.get("/documents")
async def list_documents():
    documents = rag.list_documents()
    return {"documents": documents}

@api_router.get("/documents/{document_name}")
async def get_document(document_name: str):
    file_path = os.path.join(DOCS_DIR, document_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Document not found")
    return FileResponse(file_path)

@api_router.delete("/documents/{document_name}")
async def delete_document(document_name: str):
    rag.delete_document(document_name)
    
    file_path = os.path.join(DOCS_DIR, document_name)
    if os.path.exists(file_path):
        os.remove(file_path)
        
    return {"message": f"Document '{document_name}' deleted successfully"}

app.mount("/api", api_router)

# Serve the static frontend files
app.mount("/", StaticFiles(directory="static", html=True), name="static")