import { useState } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText, Paper, Typography, CircularProgress } from '@mui/material';

export interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface ChatViewProps {
  messages: Message[];
  onNewMessage: (message: Message) => void;
  onUpdateMessage: (index: number, newText: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, onNewMessage, onUpdateMessage }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    onNewMessage(userMessage);
    setInput('');
    setIsLoading(true);

    // Add a placeholder for the bot's response
    const botMessagePlaceholder: Message = { sender: 'bot', text: '' };
    onNewMessage(botMessagePlaceholder);
    const botMessageIndex = messages.length + 1;

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: input }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const jsonChunks = chunk.split('\n').filter(Boolean);

        for (const jsonChunk of jsonChunks) {
          try {
            const parsed = JSON.parse(jsonChunk);
            if (parsed.response) {
              fullResponse += parsed.response;
              onUpdateMessage(botMessageIndex, fullResponse);
            }
          } catch (e) {
            console.error("Failed to parse stream chunk:", jsonChunk);
          }
        }
      }
    } catch (error) {
      const errorText = 'Error: Could not connect to the knowledge base.';
      onUpdateMessage(botMessageIndex, errorText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 100px)',
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
                        whiteSpace: 'pre-wrap',
                      },
                    }}
                  />
                </ListItem>
              ))}
              {isLoading && messages[messages.length - 1]?.text === '' && (
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
