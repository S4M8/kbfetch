import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, Paper, Divider, IconButton, Modal } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';
import axios from 'axios';
import DocumentPreview from '../components/DocumentPreview';

const DocumentView: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<string[]>([]);
  const [previewingDoc, setPreviewingDoc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/api/documents');
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = () => {
    if (!selectedFiles) return;
    setIsUploading(true);

    const uploadPromises = Array.from(selectedFiles).map(file => {
      const formData = new FormData();
      formData.append('file', file);
      return axios.post('/api/upload', formData);
    });

    Promise.all(uploadPromises)
      .then(() => {
        // Short delay to give backend time to process
        setTimeout(() => {
          fetchDocuments();
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 1000);
      })
      .catch(error => {
        console.error('Error uploading files:', error);
        setIsUploading(false);
      });
  };

  const handleDelete = async (docName: string) => {
    try {
      await axios.delete(`/api/documents/${docName}`);
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handlePreview = (docName: string) => {
    setPreviewingDoc(docName);
  };

  const handleClosePreview = () => {
    setPreviewingDoc(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Document Management</Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Upload Documents</Typography>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'block', margin: '10px 0' }}
        />
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFiles || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </Paper>

      <Divider />

      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6">Knowledge Base Documents</Typography>
        <List>
          {documents.map((doc) => (
            <ListItem
              key={doc}
              secondaryAction={
                <>
                  <IconButton edge="end" aria-label="preview" onClick={() => handlePreview(doc)}>
                    <PreviewIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(doc)} sx={{ ml: 1 }}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemText primary={doc} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Modal open={!!previewingDoc} onClose={handleClosePreview}>
        <Box>
          <DocumentPreview documentName={previewingDoc || ''} onClose={handleClosePreview} />
        </Box>
      </Modal>
    </Box>
  );
};

export default DocumentView;
