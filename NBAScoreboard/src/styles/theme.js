import { ThemeProvider, createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#64b5f6",  // Brighter blue for better visibility
      dark: "#1e88e5",
      light: "#90caf9",
    },
    secondary: {
      main: "#ce93d8",
    },
    background: {
      default: "#121212",  // Dark but not pure black
      paper: "#1e1e1e",    // Slightly lighter for cards
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.85)", // Increased opacity for better readability
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '[data-theme="dark"]': {
            "--background": "215 25% 7%",
            "--foreground": "210 40% 98%",
            "--card": "215 25% 12%",
            "--card-foreground": "210 40% 98%",
            "--popover": "215 25% 12%",
            "--popover-foreground": "210 40% 98%",
            "--primary": "210 100% 52%",
            "--primary-foreground": "0 0% 100%",
            "--secondary": "215 25% 12%",
            "--secondary-foreground": "210 40% 98%",
            "--muted": "215 25% 12%",
            "--muted-foreground": "217.9 10.6% 75%",
            "--accent": "215 25% 12%",
            "--accent-foreground": "210 40% 98%",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e1e1e",
          borderColor: "rgba(255, 255, 255, 0.1)",
          '&:hover': {
            backgroundColor: "#252525", // Slightly lighter on hover
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1e1e1e",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e1e1e",
        },
        indicator: {
          backgroundColor: "#64b5f6", // Brighter indicator
        },
      },
    },
  },
});

export default darkTheme;