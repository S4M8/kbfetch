# kbfetch

Containerized RAG (Retrieval-Augmented Generation) Knowledge Base.

## Technologies Used

*   **FastAPI**: A modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints.
*   **Sentence Transformers**: A Python framework for state-of-the-art sentence, text, and image embeddings. Used here for generating embeddings from document chunks.
*   **Qdrant**: A vector similarity search engine and vector database. It stores vector embeddings and provides an API for similarity search.
*   **Ollama**: A tool for running large language models locally. Used here for the LLM service.
*   **Docker & Docker Compose**: Used for containerizing the application components and orchestrating their deployment.

## Installation

To set up and run `kbfetch`, you need to have Docker and Docker Compose installed on your system.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/kbfetch.git
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
    This will start the `rag_api` (FastAPI application), `vector_db` (Qdrant), and `llm_service` (Ollama) containers.

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