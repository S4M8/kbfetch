#!/bin/bash
set -e

echo "Starting Ollama server..."
ollama serve &
OLLAMA_PID=$!

echo "Waiting for Ollama to be ready..."
sleep 30

echo "Pulling phi3 model..."
if ollama pull phi3; then
    echo "phi3 model pulled successfully."
else
    echo "Failed to pull phi3 model." >&2
    exit 1
fi

echo "Setup complete. Ollama running with phi3 model."
wait $OLLAMA_PID