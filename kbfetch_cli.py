#!/usr/bin/env python
import argparse
import requests
import os
import json
import mimetypes

BASE_URL = os.environ.get("KBFETCH_BASE_URL", "http://localhost:8000")

def upload_document(file_path: str):
    url = f"{BASE_URL}/upload"
    
    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type is None:
        mime_type = "application/octet-stream"

    with open(file_path, "rb") as f:
        files = {"file": (os.path.basename(file_path), f, mime_type)}
        try:
            response = requests.post(url, files=files)
            response.raise_for_status()
            print(json.dumps(response.json(), indent=2))
        except requests.exceptions.RequestException as e:
            print(f"Error uploading document: {e}")

def query_knowledge_base(query_text: str):
    url = f"{BASE_URL}/query"
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(url, headers=headers, json={"q": query_text})
        response.raise_for_status()
        data = response.json()
        if "results" in data:
            print(data["results"])
        else:
            print(json.dumps(data, indent=2))
    except requests.exceptions.RequestException as e:
        print(f"Error querying knowledge base: {e}")

def main():
    parser = argparse.ArgumentParser(description="kbfetch CLI tool for RAG application.")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    upload_parser = subparsers.add_parser("upload", help="Upload a document to the knowledge base.")
    upload_parser.add_argument("file_path", type=str, help="Path to the document file to upload.")
    upload_parser.set_defaults(func=lambda args: upload_document(args.file_path))

    query_parser = subparsers.add_parser("query", help="Query the knowledge base.")
    query_parser.add_argument("query_text", type=str, nargs='+', help="The text query for the knowledge base.")
    query_parser.set_defaults(func=lambda args: query_knowledge_base(" ".join(args.query_text)))

    args = parser.parse_args()

    if args.command:
        args.func(args)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()