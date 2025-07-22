import { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface DocumentPreviewProps {
  documentName: string;
  onClose: () => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  height: '80%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column'
};

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ documentName, onClose }) => {
  const [content, setContent] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!documentName) return;
    setIsLoading(true);
    
    const fetchDocumentContent = async () => {
      try {
        const response = await axios.get(`/api/documents/${documentName}`, {
          responseType: 'blob',
        });
        const extension = documentName.split('.').pop()?.toLowerCase() || '';
        setFileType(extension);

        if (['txt', 'md', 'py', 'js', 'ts', 'html', 'css', 'json', 'yaml'].includes(extension)) {
          const text = await response.data.text();
          setContent(text);
        } else if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
          const url = URL.createObjectURL(response.data);
          setContent(url);
        } else if (extension === 'pdf') {
           const url = URL.createObjectURL(response.data);
          setContent(url);
        } else {
            setContent('Preview for this file type is not supported.');
        }
      } catch (error) {
        console.error('Error fetching document content:', error);
        setContent('Could not load document content.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentContent();
  }, [documentName]);

  const renderContent = () => {
    if (isLoading) {
      return <CircularProgress />;
    }
    if (['png', 'jpg', 'jpeg', 'gif'].includes(fileType)) {
      return <img src={content} alt={documentName} style={{ maxWidth: '100%', maxHeight: '100%' }} />;
    }
    if (fileType === 'pdf') {
        return <iframe src={content} title={documentName} width="100%" height="100%" />;
    }
    return (
        <SyntaxHighlighter language={fileType} style={vscDarkPlus} showLineNumbers>
            {content}
        </SyntaxHighlighter>
    )
  }

  return (
    <Paper sx={style}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{documentName}</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        {renderContent()}
      </Box>
    </Paper>
  );
};

export default DocumentPreview;
