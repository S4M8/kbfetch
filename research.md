# Creating a Containerized RAG Application with Docker: A Complete Resource-Optimized Guide

Building a containerized Retrieval-Augmented Generation (RAG) application that processes OneNote, Markdown, or HTML files into embeddings requires careful consideration of resource usage and accuracy. This comprehensive guide outlines the most effective approach for creating a low-resource, high-accuracy containerized RAG system.

## Architecture Overview

The optimal containerized RAG architecture consists of **four main components**[1][2]:

**Document Processing Service**: Handles OneNote, Markdown, and HTML file parsing and chunking
**Embedding Service**: Converts text chunks into vector embeddings using lightweight models  
**Vector Database**: Stores and retrieves embeddings efficiently
**LLM Service**: Provides text generation capabilities using small language models

## Selecting Resource-Efficient Components

### Small Language Models (SLMs)

For low resource usage while maintaining accuracy, **Small Language Models (SLMs)** are the optimal choice[3][4]. These models typically have **fewer than 10 billion parameters** and offer several advantages:

- **Lower computational requirements**: SLMs need less than 8GB RAM and can run on CPUs without GPUs[5]
- **Faster inference**: Quicker response times due to fewer parameters to process[3]
- **Energy efficiency**: Consume significantly less power than large models[6]
- **Specialized performance**: When fine-tuned for specific domains, SLMs can achieve 85-95% of large model performance with 75% fewer resources[7]

**Recommended SLM options for Docker deployment**:
- **TinyLlama** (1.1B parameters): Excellent for resource-constrained environments[8][9]
- **MobileLLaMA** (1.4B parameters): Optimized for mobile and low-power devices[8]
- **Phi-3 Mini** (3.8B parameters): Microsoft's efficient model for edge computing[10]

### Lightweight Embedding Models

For embedding generation, several **lightweight embedding models** provide excellent performance with minimal resource usage[11][12]:

- **all-MiniLM-L6-v2**: 22M parameters, highly efficient for semantic similarity[12]
- **bge-small-en-v1.5**: Optimized for retrieval tasks with low memory footprint[13]
- **nomic-embed-text**: Fastest embedding model according to user benchmarks[13]
- **multilingual-e5-small**: For multilingual document support[11]

These models can be **further optimized using quantization techniques**, achieving up to **4x storage reduction with minimal performance degradation** using float8 quantization[14][15].

### Vector Database Selection

For resource-efficient vector storage, **ChromaDB** and **Qdrant** emerge as the top choices[16][17]:

**ChromaDB**[17][18]:
- **Embedded deployment**: Runs within the application container
- **Minimal setup**: 5-minute setup time with 2-4GB RAM usage
- **Developer-friendly**: Simple API and excellent for prototyping
- **Rust core rewrite**: 4× faster writes and queries in recent versions[16]

**Qdrant**[19][17]:
- **Production-ready**: Built for high-performance workloads
- **Scalability**: Handles 100M+ vectors per node
- **Advanced filtering**: Superior boolean query support
- **Resource efficiency**: 4-8GB RAM usage with optimized performance[17]

## Document Processing Pipeline

### File Format Handling

For processing different document formats, implement **format-specific parsers**:

**OneNote Files**:
- Use **Aspose.Note for .NET** or **GroupDocs.Parser** for .ONE file extraction[20][21]
- Convert OneNote → HTML → Markdown pipeline using **Pandoc**[22][23]
- **Microsoft Graph API** integration for cloud-based OneNote access[23]

**Markdown Files**:
- Direct processing with **LangChain's MarkdownHeaderTextSplitter**
- Preserve hierarchical structure during chunking[24]

**HTML Files**:
- **BeautifulSoup** or **html2text** for content extraction
- Remove boilerplate and focus on main content[24]

### Chunking Strategy

Implement **semantic chunking** for optimal retrieval performance[24][25]:

- **Fixed-size chunks**: 256-512 tokens with 10-20% overlap
- **Semantic boundaries**: Respect paragraph and section breaks
- **Header-aware splitting**: Maintain document hierarchy for better context[26]
- **Metadata preservation**: Store document source, section headers, and creation dates

## Optimized Docker Implementation

### Multi-Stage Build Architecture

Use **multi-stage Docker builds** to minimize image size and enhance security[27][28]:

```dockerfile
# Build Stage - Install dependencies and build tools
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Runtime Stage - Minimal production image
FROM python:3.11-slim AS production
WORKDIR /app

# Copy only necessary files from builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY src/ .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash rag_user
USER rag_user

EXPOSE 8000
CMD ["python", "main.py"]
```

This approach can **reduce image sizes from over 1GB to under 200MB**[29][30].

### Container Orchestration

Use **Docker Compose** for multi-service orchestration[31][32]:

```yaml
version: '3.8'
services:
  llm_service:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_models:/root/.ollama
    deploy:
      resources:
        limits:
          memory: 4G

  vector_db:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

  rag_api:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - llm_service
      - vector_db
    environment:
      - OLLAMA_HOST=http://llm_service:11434
      - QDRANT_HOST=http://vector_db:6333

volumes:
  ollama_models:
  qdrant_data:
```

## Implementation Framework

### Core Application Structure

Build the RAG application using **FastAPI** for optimal performance and automatic API documentation[33][34]:

```python
from fastapi import FastAPI, UploadFile
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import chromadb

app = FastAPI()

# Initialize components
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
vector_db = chromadb.Client()
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=512, 
    chunk_overlap=50
)

@app.post("/upload")
async def upload_document(file: UploadFile):
    # Process document and create embeddings
    pass

@app.post("/query")
async def query_documents(query: str):
    # Retrieve relevant chunks and generate response
    pass
```

### Document Processing Service

Implement **format-agnostic document processing**:

```python
class DocumentProcessor:
    def __init__(self):
        self.parsers = {
            '.md': self.process_markdown,
            '.html': self.process_html,
            '.one': self.process_onenote
        }
    
    def process_document(self, file_path: str) -> List[str]:
        """Process document and return text chunks"""
        extension = Path(file_path).suffix.lower()
        parser = self.parsers.get(extension, self.process_text)
        return parser(file_path)
```

## Performance Optimization Strategies

### Embedding Storage Optimization

Implement **embedding compression techniques** to reduce storage requirements by up to 8x[14][15]:

- **Float8 quantization**: 4× reduction with <0.3% performance loss
- **PCA dimensionality reduction**: 50% dimension retention for 2× compression
- **Combined approach**: 8× total compression maintaining better performance than int8 alone

### Caching and Memory Management

Implement **intelligent caching strategies**:

- **LRU cache** for frequently accessed embeddings[16]
- **Lazy loading** of models to reduce startup memory usage
- **Batch processing** for document ingestion to optimize throughput

## Security Best Practices

Follow **Docker security best practices** to ensure a secure deployment[35][36]:

- **Use non-root users**: Create dedicated application users[35]
- **Minimal base images**: Use `python:3.11-slim` instead of full Python images[29][37]
- **No secrets in Dockerfiles**: Use environment variables or secret management[35]
- **Read-only filesystems**: Mount application directories as read-only where possible[36]
- **Resource limits**: Set memory and CPU constraints to prevent resource exhaustion[35]

## Deployment and Monitoring

### Health Checks and Observability

Implement comprehensive **health monitoring**:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD curl -f http://localhost:8000/health || exit 1
```

### Scaling Considerations

Design for **horizontal scaling**:

- **Stateless services**: Store all state in external databases
- **Load balancing**: Use reverse proxy for distributing requests
- **Service discovery**: Implement service mesh for multi-instance deployments

## Accuracy Optimization

### Advanced RAG Techniques

Implement **advanced RAG strategies** for improved accuracy[38][39]:

- **Parent Document Retriever**: Maintain document context while using smaller chunks for retrieval[39]
- **Hybrid search**: Combine dense vector search with keyword matching
- **Re-ranking**: Use cross-encoders to re-rank retrieved results
- **Query expansion**: Enhance user queries for better retrieval

### Evaluation and Testing

Establish **comprehensive testing frameworks**:

- **Retrieval quality metrics**: Measure precision, recall, and NDCG
- **End-to-end response evaluation**: Assess generated answer quality
- **A/B testing**: Compare different model and chunking configurations

## Conclusion

Creating a containerized RAG application optimized for low resource usage and high accuracy requires careful selection of **small language models**, **efficient embedding models**, and **lightweight vector databases**. By implementing **multi-stage Docker builds**, **semantic chunking strategies**, and **advanced optimization techniques**, you can achieve a system that processes OneNote, Markdown, and HTML files effectively while maintaining minimal resource footprint.

The combination of **TinyLlama or Phi-3 Mini** for generation, **all-MiniLM-L6-v2** for embeddings, and **ChromaDB or Qdrant** for vector storage provides an optimal balance of performance and efficiency. Following the outlined Docker best practices ensures a secure, scalable, and maintainable deployment suitable for resource-constrained environments.

[1] https://docs.docker.com/guides/rag-ollama/develop/
[2] https://docs.docker.com/guides/rag-ollama/containerize/
[3] https://www.datacamp.com/blog/small-language-models
[4] https://www.salesforce.com/blog/small-language-models/
[5] https://www.virtualizationhowto.com/2025/05/5-best-llm-models-you-can-run-in-docker-on-low-power-hardware/
[6] https://www.netguru.com/blog/small-language-models
[7] https://dev.to/mikeyoung44/small-language-models-match-large-ai-performance-in-specialized-tasks-while-using-75-less-resources-4j2o
[8] https://www.datacamp.com/blog/top-small-language-models
[9] https://dev.to/darwinphi/how-to-run-a-tiny-llm-in-a-potato-computer-2d63
[10] https://pumpingco.de/blog/run-large-language-models-and-small-language-models-locally-with-ollama/
[11] https://github.com/lh0x00/lightweight-embeddings
[12] https://pypi.org/project/light-embed/
[13] https://www.reddit.com/r/LocalLLaMA/comments/1hxv42y/what_is_the_best_embedding_model_for_openwebui/
[14] https://arxiv.org/html/2505.00105v1
[15] https://arxiv.org/pdf/2505.00105v1.pdf
[16] https://airbyte.com/data-engineering-resources/chroma-db-vs-qdrant
[17] https://aloa.co/ai/comparisons/vector-database-comparison/chroma-vs-qdrant
[18] https://www.oracle.com/database/vector-database/chromadb/
[19] https://www.cohorte.co/blog/a-developers-friendly-guide-to-qdrant-vector-database
[20] https://docs.groupdocs.com/parser/net/extract-text-from-microsoft-onenote-sections/
[21] https://products.aspose.com/note/net/conversion/one-to-markdown/
[22] https://www.codeproject.com/Articles/5317371/Creating-a-OneNote-Markdown-Converter
[23] https://www.codeproject.com/Articles/5318953/OneNote-to-Markdown-Using-Python-and-the-Microsoft?PageFlow=FixedWidth
[24] https://milvus.io/ai-quick-reference/how-do-i-implement-efficient-document-chunking-for-rag-applications
[25] https://zilliz.com/learn/guide-to-chunking-strategies-for-rag
[26] https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-chunking-phase
[27] https://www.blacksmith.sh/blog/understanding-multi-stage-docker-builds
[28] https://docs.docker.com/build/building/multi-stage/
[29] https://www.kdnuggets.com/how-to-create-minimal-docker-images-for-python-applications
[30] https://dev.to/astrearider/from-bloated-to-lean-optimizing-docker-image-with-multi-stage-builds-9km
[31] https://collabnix.com/setting-up-ollama-models-with-docker-compose-a-step-by-step-guide/
[32] https://collabnix.com/running-ollama-with-docker-for-python-applications/
[33] https://www.aihello.com/resources/blog/building-a-rag-pipeline-with-fastapi-haystack-and-chromadb-for-urls-in-python/
[34] https://github.com/anarojoecheburua/RAG-with-Langchain-and-FastAPI
[35] https://anchore.com/blog/docker-security-best-practices-a-complete-guide/
[36] https://spacelift.io/blog/docker-security
[37] https://snyk.io/blog/10-docker-image-security-best-practices/
[38] https://paperswithcode.com/paper/minirag-towards-extremely-simple-retrieval
[39] https://pub.towardsai.net/introduction-to-retrieval-augmented-generation-rag-using-langchain-and-lamaindex-bd0047628e2a?gi=60ec8d258bc5
[40] https://infohub.delltechnologies.com/en-au/l/generative-ai-in-the-enterprise-with-amd-accelerators/building-the-base-container-for-rag-and-fine-tuning/
[41] https://github.com/lndulgence/miniRAG
[42] https://dev.to/docker/from-zero-to-local-llm-a-developers-guide-to-docker-model-runner-4oi2
[43] https://www.datacamp.com/tutorial/deploy-llm-applications-using-docker
[44] https://medium.datadriveninvestor.com/making-docker-for-llama3-rag-system-a3943f972711?gi=be9571e895bb
[45] https://github.com/TtheBC01/redis-ollama-RAG
[46] https://github.com/labrijisaad/LLM-RAG
[47] https://github.com/HKUDS/LightRAG
[48] https://www.youtube.com/watch?v=7QRPnAbVssg
[49] https://dev.to/lazypro/dockerize-local-rag-with-models-41al
[50] https://www.youtube.com/watch?v=7BKaw5wIY_8
[51] https://minimaldevops.com/retrieval-augmented-generation-rag-225c3313e5e4
[52] https://pretalx.com/pyconde-pydata-2025/talk/7FV8B3/
[53] https://github.com/plaggy/rag-containers
[54] https://www.firecrawl.dev/blog/best-open-source-rag-frameworks
[55] https://glasp.co/hatch/rH1SCUH4mKZpNDMkE0mpfgMNehJ2/p/3Jm6dz1WweS9ddUg7bt8
[56] https://www.reddit.com/r/Rag/comments/1ijn8zc/simple_rag_pipeline_fully_dockerized_completely/
[57] https://www.arxiv.org/pdf/2412.21023v1.pdf
[58] https://github.com/etalab-ia/albert-models
[59] https://haystack.deepset.ai/blog/cpu-optimized-models-with-fastrag
[60] https://huggingface.co/spaces/lamhieu/lightweight-embeddings
[61] https://dev.to/siddharthbhalsod/smaller-efficient-llms-the-future-of-ai-50fo
[62] https://www.linkedin.com/posts/philippe-de-meulenaer_deploying-a-lightweight-embedding-model-for-activity-7331566625021677568-8TFj
[63] https://www.reddit.com/r/LocalLLaMA/comments/18j39qt/what_embedding_models_are_you_using_for_rag/
[64] https://dev.to/pavanbelagatti/a-step-by-step-guide-to-containerizing-and-deploying-machine-learning-models-with-docker-21al
[65] https://zephyrnet.com/15-smallest-llms-that-you-can-run-on-local-devices/
[66] https://www.mongodb.com/developer/products/atlas/choose-embedding-model-rag/
[67] https://www.codeproject.com/Articles/526908/A-Simple-Parser-That-Converts-HTML-from-OneNote-to
[68] https://www.reddit.com/r/selfhosted/comments/xtlvgb/selfhosted_markdown_editor_docker/
[69] https://www.multimodal.dev/post/how-to-chunk-documents-for-rag
[70] https://docs.groupdocs.com/parser/java/extract-text-from-microsoft-onenote-sections/
[71] https://github.com/stevencohn/OneMore/issues/1538
[72] https://www.sagacify.com/news/a-guide-to-chunking-strategies-for-retrieval-augmented-generation-rag
[73] https://superuser.com/questions/753058/import-markdown-to-onenote
[74] https://www.ibm.com/think/tutorials/chunking-strategies-for-rag-with-langchain-watsonx-ai
[75] https://www.reddit.com/r/OneNote/comments/ss8ebt/markdown_plugin_for_onenote/
[76] https://www.youtube.com/watch?v=_qbpS2xSlU4
[77] https://gist.github.com/heardk/ded40b72056cee33abb18f3724e0a580
[78] https://github.com/dcycle/docker-md2html
[79] https://www.reddit.com/r/LangChain/comments/1bgqc2o/optimal_way_to_chunk_word_document_for/
[80] https://dev.to/mehmetakar/rag-vector-database-2lb2
[81] https://www.geeksforgeeks.org/top-vector-databases/
[82] https://qdrant.tech
[83] https://www.digitalocean.com/community/conceptual-articles/how-to-choose-the-right-vector-database
[84] https://www.g2.com/articles/best-vector-databases
[85] https://www.reddit.com/r/LangChain/comments/170jigz/my_strategy_for_picking_a_vector_database_a/
[86] https://lakefs.io/blog/12-vector-databases-2023/
[87] https://aerospike.com/solutions/use-cases/rag-vector-database/
[88] https://www.pinecone.io/learn/vector-database/
[89] https://cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/vector-db-choices
[90] https://www.techtarget.com/searchdatamanagement/tip/Top-vector-database-options-for-similarity-searches
[91] https://www.datacamp.com/blog/the-top-5-vector-databases
[92] https://dev.to/nikhilwagh/retrieval-augmented-generation-rag-with-vector-databases-powering-context-aware-ai-in-2025-4930
[93] https://aws.amazon.com/what-is/vector-databases/
[94] https://www.rohan-paul.com/p/vector-databases-for-rag-literature
[95] https://ollama.com/blog/ollama-is-now-available-as-an-official-docker-image
[96] https://huggingface.co/spaces/EnDevSols/TinyLLama_1.1B_Chat/blob/main/Dockerfile
[97] https://www.linkedin.com/posts/muhammad-huzaifa-79ab1a2a1_llama-tinnyllama-gemma2-activity-7231604483644915713-O6v2
[98] https://dev.to/narmidm/introducing-docker-model-runner-bring-ai-inference-to-your-local-dev-environment-316a
[99] https://github.com/ollama/ollama
[100] https://www.docker.com/products/model-runner/
[101] https://hub.docker.com/r/ollama/ollama
[102] https://www.docker.com/blog/a-quick-guide-to-containerizing-llamafile-with-docker-for-ai-applications/
[103] https://dev.to/coder_dragon/how-run-llm-in-local-using-docker-i2b
[104] https://dev.to/gabriellavoura/running-ollama-on-docker-a-quick-guide-475l
[105] https://www.linkedin.com/pulse/running-llama-model-ollama-docker-container-simple-guide-islam-bxedc
[106] https://www.docker.com/blog/run-llms-locally/
[107] https://www.williamleme.com/posts/2025/001-adding-live-data-to-local-models/
[108] https://www.linkedin.com/posts/itzanshuman_ai-mlops-devops-activity-7333839342613733379-VWSB
[109] https://huggingface.co/blog/ngxson/make-your-own-rag
