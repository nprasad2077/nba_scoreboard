import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../src/src/App'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from './theme/theme'
import './styles/tailwind.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
)