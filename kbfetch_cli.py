#!/usr/bin/env python
import argparse
import requests
import os
import json

BASE_URL = "http://localhost:8000"

def upload_document(file_path: str):
    url = f"{BASE_URL}/upload"
    with open(file_path, "rb") as f:
        files = {"file": (os.path.basename(file_path), f, "text/markdown")} # Default to markdown, can be extended
        response = requests.post(url, files=files)
    response.raise_for_status()
    print(json.dumps(response.json(), indent=2))

def query_knowledge_base(query_text: str):
    url = f"{BASE_URL}/query"
    headers = {"Content-Type": "text/plain"}
    response = requests.post(url, headers=headers, data=query_text)
    response.raise_for_status()
    data = response.json()
    if "results" in data:
        for i, result in enumerate(data["results"]):
            print(f"--- Result {i+1} ---")
            print(result)
            print() # Add a blank line for readability
    else:
        print(json.dumps(data, indent=2))

def main():
    parser = argparse.ArgumentParser(description="kbfetch CLI tool for RAG application.")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Upload command
    upload_parser = subparsers.add_parser("upload", help="Upload a document to the knowledge base.")
    upload_parser.add_argument("file_path", type=str, help="Path to the document file to upload.")
    upload_parser.set_defaults(func=upload_document)

    # Query command
    query_parser = subparsers.add_parser("query", help="Query the knowledge base.")
    query_parser.add_argument("query_text", type=str, nargs='+', help="The text query for the knowledge base.")
    query_parser.set_defaults(func=query_knowledge_base)

    args = parser.parse_args()

    if args.command:
        try:
            if args.command == "upload":
                args.func(args.file_path)
            elif args.command == "query":
                args.func(" ".join(args.query_text))
        except requests.exceptions.RequestException as e:
            print(f"Error: {e}")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()