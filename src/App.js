
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import DrillDrawer from './components/DrillDrawer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#32CD32',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ 
        backgroundColor: '#000000', 
        minHeight: '100vh',
        padding: '10px',
        '@media (max-width: 768px)': {
          padding: '5px',
        }
      }}>
        {/* BENCH MARK SPORTS Logo Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '10px',
          padding: '10px',
          borderBottom: '2px solid #ffffff',
          '@media (max-width: 768px)': {
            marginBottom: '5px',
            padding: '5px',
          }
        }}>
          <img 
            src="/BENCH MARK BRAND WHT.png" 
            alt="BENCH MARK SPORTS" 
            style={{
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              margin: '0 auto',
              '@media (max-width: 768px)': {
                maxWidth: '200px',
              }
            }}
          />
        </div>
        
      <DrillDrawer />
    </div>
    </ThemeProvider>
  );
}

export default App;
