from pathlib import Path
from typing import List

class DocumentProcessor:
    def __init__(self):
        self.parsers = {
            '.md': self.process_markdown,
            '.html': self.process_html,
            '.one': self.process_onenote,
            '.txt': self.process_text
        }
    
    def process_document(self, file_path: str) -> List[str]:
        """Process document and return text chunks"""
        extension = Path(file_path).suffix.lower()
        parser = self.parsers.get(extension, self.process_text)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return parser(content)

    def process_markdown(self, content: str) -> List[str]:
        # Basic chunking for now, will be improved later
        return [chunk for chunk in content.split('\n\n') if chunk.strip()]

    def process_html(self, content: str) -> List[str]:
        # Basic chunking for now, will be improved later
        return [chunk for chunk in content.split('\n\n') if chunk.strip()]

    def process_onenote(self, content: str) -> List[str]:
        # Placeholder for OneNote processing
        return [content]

    def process_text(self, content: str) -> List[str]:
        return [chunk for chunk in content.split('\n\n') if chunk.strip()]