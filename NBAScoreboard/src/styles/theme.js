import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  typography: {
    // Increase the font size scaling factor
    htmlFontSize: 16 * 1.5, // Base font size scaled by 150%
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
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
          backgroundColor: "#101010",
          borderColor: "rgba(255, 255, 255, 0.1)",
          '&:hover': {
            backgroundColor: "#252525",
          },
        },
      },
    },
    // Adjust icon sizes
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fontSize: '1.5rem', // Increase default icon size
        },
        fontSizeLarge: {
          fontSize: '2.25rem',
        },
        fontSizeSmall: {
          fontSize: '1.125rem',
        },
      },
    },
    // Adjust spacing for cards
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px', // Increase padding
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    // Adjust tab sizes
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: '72px', // Increase tab height
          fontSize: '1rem',
          padding: '12px 24px',
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
          backgroundColor: "#101010",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: "#101010",
          minHeight: '72px', // Match tab height
        },
        indicator: {
          backgroundColor: "#64b5f6",
          height: '3px', // Slightly thicker indicator
        },
      },
    },
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#64b5f6",
      dark: "#1e88e5",
      light: "#90caf9",
    },
    secondary: {
      main: "#ce93d8",
    },
    background: {
      default: "#121212",
      paper: "#101010",
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.85)",
    },
  },
  // Adjust spacing scale
  spacing: factor => `${0.25 * factor * 1.5}rem`, // Scale up spacing by 150%
});

export default darkTheme;