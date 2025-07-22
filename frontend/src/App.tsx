import { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import SideNav from './components/SideNav';
import ChatView, { type Message } from './views/ChatView';
import DocumentView from './views/DocumentView';

type View = 'chat' | 'documents';

function App() {
  const [currentView, setCurrentView] = useState<View>('chat');
  const [messages, setMessages] = useState<Message[]>([]);

  const handleNewMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleUpdateMessage = (index: number, newText: string) => {
    setMessages(prev => 
      prev.map((msg, i) => 
        i === index ? { ...msg, text: newText } : msg
      )
    );
  };

  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return <ChatView messages={messages} onNewMessage={handleNewMessage} onUpdateMessage={handleUpdateMessage} />;
      case 'documents':
        return <DocumentView />;
      default:
        return <ChatView messages={messages} onNewMessage={handleNewMessage} onUpdateMessage={handleUpdateMessage} />;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <SideNav onSelectView={setCurrentView} />
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
      >
        {renderView()}
      </Box>
    </Box>
  );
}

export default App;
