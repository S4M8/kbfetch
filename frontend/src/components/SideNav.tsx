import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import FolderIcon from '@mui/icons-material/Folder';
import viteLogo from '/vite.svg';

interface SideNavProps {
  onSelectView: (view: 'chat' | 'documents') => void;
}

const drawerWidth = 240;

const SideNav: React.FC<SideNavProps> = ({ onSelectView }) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar>
        <img src={viteLogo} className="logo" alt="KBfetch Logo" />
      </Toolbar>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => onSelectView('chat')}>
            <ListItemIcon>
              <ChatIcon />
            </ListItemIcon>
            <ListItemText primary="Chat" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => onSelectView('documents')}>
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText primary="Documents" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default SideNav;