import { useState } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText, Paper, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

export interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface ChatViewProps {
  messages: Message[];
  onNewMessage: (message: Message) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, onNewMessage }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { sender: 'user', text: input };
    onNewMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/query', { q: input });
      const botMessage: Message = { sender: 'bot', text: response.data.results };
      onNewMessage(botMessage);
    } catch (error) {
      const errorMessage: Message = {
        sender: 'bot',
        text: 'Error: Could not connect to the knowledge base.',
      };
      onNewMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto', // Center the component horizontally
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 100px)', // Give it a defined height
      }}
    >
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>KBfetch</Typography>
      
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 0 }}>
        {messages.length > 0 && (
          <Paper sx={{ overflowY: 'auto', p: 2, mb: 2, flexGrow: 1 }}>
            <List>
              {messages.map((message, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={message.text}
                    secondary={message.sender === 'user' ? 'You' : 'Bot'}
                    sx={{
                      textAlign: message.sender === 'user' ? 'right' : 'left',
                      '& .MuiListItemText-primary': {
                        whiteSpace: message.sender === 'bot' ? 'pre-wrap' : 'normal',
                      },
                    }}
                  />
                </ListItem>
              ))}
              {isLoading && (
                <ListItem sx={{ justifyContent: 'flex-start' }}>
                  <CircularProgress size={24} />
                  <Typography sx={{ ml: 2 }}>Thinking...</Typography>
                </ListItem>
              )}
            </List>
          </Paper>
        )}
      </Box>

      <Box sx={{ display: 'flex', width: '100%' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your query..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          disabled={isLoading}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={isLoading}
          sx={{ ml: 1 }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatView;