# kbfetch

Containerized RAG (Retrieval-Augmented Generation) Knowledge Base.

## Technologies Used

*   **FastAPI**: A modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints.
*   **Sentence Transformers**: A Python framework for state-of-the-art sentence, text, and image embeddings. Specifically, `all-MiniLM-L6-v2` is used for generating embeddings from document chunks.
*   **Qdrant**: A vector similarity search engine and vector database. It stores vector embeddings and provides an API for similarity search.
*   **Ollama**: A tool for running large language models locally. `Phi-3` is used as the LLM for generating responses.
*   **Docker & Docker Compose**: Used for containerizing the application components and orchestrating their deployment.

## Installation

To set up and run `kbfetch`, you need to have Docker and Docker Compose installed on your system.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/S4M8/kbfetch.git
    cd kbfetch
    ```

2.  **Build the Docker images**:
    ```bash
    docker-compose build
    ```

3.  **Start the services**:
    ```bash
    docker-compose up -d
    ```
    This will start the `rag_api` (FastAPI application which now includes LLM generation), `vector_db` (Qdrant), and `llm_service` (Ollama) containers.

## Usage

### Using the kbfetch CLI

A command-line interface (CLI) tool `kbfetch_cli.py` is provided to simplify interaction with the `kbfetch` application.

#### Uploading Documents

To upload a document, use the `upload` command followed by the path to your document file:

```bash
python kbfetch_cli.py upload <path_to_your_document>
```

Example:
```bash
python kbfetch_cli.py upload my_document.md
```

#### Querying the Knowledge Base

To query the knowledge base, use the `query` command followed by your query text:

```bash
python kbfetch_cli.py query "Your question here"
```

Example:
```bash
python kbfetch_cli.py query "What is kbfetch?"
```

## Profiling (Initial Version)

The following profiling was conducted on a machine with an Intel i9 CPU, 64GB of RAM, and an NVIDIA 3090 GPU. The `llm_service` was running in CPU mode.

### Resource Usage

| Service         | State  | CPU % (Peak) | Memory Usage (Peak) |
| --------------- | ------ | ------------ | ------------------- |
| **rag_api**     | Idle   | 0.41%        | 2.077 GiB           |
|                 | Upload | 0.43%        | 2.113 GiB           |
|                 | Query  | 0.40%        | 2.113 GiB           |
| **vector_db**   | Idle   | 0.24%        | 122.3 MiB           |
|                 | Upload | 0.38%        | 124.8 MiB           |
|                 | Query  | 0.25%        | 123.2 MiB           |
| **llm_service** | Idle   | 0.00%        | 12.94 MiB           |
|                 | Upload | 0.00%        | 12.94 MiB           |
|                 | Query  | **~100%**    | **3.998 GiB**       |

### Estimated Minimum Hardware Requirements

*   **RAM:** 8 GB
*   **CPU:** 4-core
*   **Storage:** 10 GB

**Note:** The primary bottleneck is the `llm_service` during query operations. Using a supported GPU for the `llm_service` would significantly improve performance and reduce CPU load.


## Planned Features

📄 Document Format Support
- [] JSON parsing and embedding
- [] YAML document support
- [] PDF content extraction (including OCR capabilities)
- [] Image processing and embedding (e.g., screenshots, scanned pages)
- [] CSV and Excel document ingestion
- [] XML document parsing
- [] TOML config file support

🔍 Search & Query Enhancements
- [] Semantic and intent-aware search
- [] Faceted filtering (type, tags, date, source, etc.)
- [] Full-text OCR for scanned documents and image-based PDFs

🧠 Metadata & Classification
- [] Automatic metadata extraction (e.g., author, date, keywords)
- [] Custom tagging system for documents
- [] NLP-driven auto-classification into topics or categories

🔗 UI, Workflow & Automation
- [] Web-based dashboard for browsing and managing knowledge base entries
- [] Rich document previews (syntax highlighting, PDF/image thumbnails, tree views)
- [] Commenting and collaborative annotations
- [] Bulk and recursive directory uploads
- [] Export content or search results to PDF, DOCX, or HTML
- [] Workflow automation (e.g., auto-tagging, alerts, custom triggers)

🔐 Security & Access Control
- [] Role-based access control
- [] Document-level permissions
- [] Audit logging and version history tracking for changes

🔧 Integrations & Extensibility
- [] API endpoints for external integration (e.g., Slack, GitHub, Zapier)
- [] Webhooks and event triggers (e.g., on document addition/modification)
- [] Pluggable embedding model support (e.g., OpenAI, Cohere, local models)

📊 Analytics & Reporting
- [] Usage and search analytics dashboard
- [] Document type breakdown reports
- [] Query success/failure rate tracking

🌐 Internationalization & Localization
- [] Multilingual document support
- [] Language detection and tagging