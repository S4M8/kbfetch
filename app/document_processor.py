import re
from pathlib import Path
from typing import List
import tiktoken
from bs4 import BeautifulSoup
import html2text

class DocumentProcessor:
    def __init__(self):
        self.parsers = {
            '.md': self.process_markdown,
            '.html': self.process_html,
            '.one': self.process_onenote,
            '.txt': self.process_text
        }
        self.tokenizer = tiktoken.get_encoding("cl100k_base")
        self.chunk_size = 500  # tokens
        self.chunk_overlap = 50 # tokens

    def _chunk_text_token_aware(self, text: str) -> List[str]:
        tokens = self.tokenizer.encode(text)
        chunks = []
        for i in range(0, len(tokens), self.chunk_size - self.chunk_overlap):
            chunk = tokens[i : i + self.chunk_size]
            chunks.append(self.tokenizer.decode(chunk))
        return chunks
    
    def process_document(self, file_path: str) -> List[str]:
        """Process document and return text chunks"""
        extension = Path(file_path).suffix.lower()
        parser = self.parsers.get(extension, self.process_text)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return parser(content)
        except FileNotFoundError:
            return [f"Error: File not found at {file_path}"]
        except Exception as e:
            return [f"Error processing file {file_path}: {e}"]

    def process_markdown(self, content: str) -> List[str]:
        # This is a basic implementation, more advanced markdown parsers could be used
        chunks = []
        # Split by headings (e.g., #, ##, ###)
        sections = re.split(r'\n#{1,6} ', content)
        for section in sections:
            if section.strip():
                # Add the heading back if it was a heading split
                if not section.startswith(' '):
                    section = '#' + section
                chunks.extend(self._chunk_text_token_aware(section.strip()))
        return chunks

    def process_html(self, content: str) -> List[str]:
        h = html2text.HTML2Text()
        h.ignore_links = True
        h.ignore_images = True
        markdown_content = h.handle(content)
        
        return self.process_markdown(markdown_content)

    def process_onenote(self, content: str) -> List[str]:
        # Placeholder for OneNote processing - remains basic for now
        return self._chunk_text_token_aware(content)

    def process_text(self, content: str) -> List[str]:
        return self._chunk_text_token_aware(content)

