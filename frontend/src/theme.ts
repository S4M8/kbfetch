import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#54c7ec', // A vibrant blue
    },
    secondary: {
      main: '#ff6f61', // A lively coral
    },
    background: {
      default: '#1a1a1a',
      paper: '#2a2a2a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    }
  },
  typography: {
    fontFamily: '"Helvetica Neue", "Roboto", "Arial", sans-serif',
    h4: {
      fontFamily: '"Minecraft", "Roboto", "Arial", sans-serif',
      fontWeight: 'bold',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontFamily: '"Helvetica Neue", "Roboto", "Arial", sans-serif',
        },
        secondary: {
            fontFamily: '"Helvetica Neue", "Roboto", "Arial", sans-serif',
        }
      }
    }
  },
});

export default theme;
