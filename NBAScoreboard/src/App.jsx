import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Scoreboard from './components/Scoreboard';

const darkTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        h6: {
          fontSize: '1.1rem',
          '@media (min-width:600px)': {
            fontSize: '1.25rem',
          },
        },
      },
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Scoreboard />
    </ThemeProvider>
  );
}

export default App;