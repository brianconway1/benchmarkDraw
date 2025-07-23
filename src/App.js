
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
  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ 
        backgroundColor: '#000000', 
        minHeight: '100vh',
        padding: isMobile ? '5px' : '10px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* BENCH MARK SPORTS Logo Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: isMobile ? '5px' : '10px',
          padding: isMobile ? '5px' : '10px',
          borderBottom: '2px solid #ffffff',
          position: 'relative',
          zIndex: 10
        }}>
          <img 
            src="/BENCH MARK BRAND WHT.png" 
            alt="BENCH MARK SPORTS" 
            style={{
              maxWidth: isMobile ? '180px' : '100%',
              height: 'auto',
              display: 'block',
              margin: '0 auto',
              maxHeight: isMobile ? '40px' : '60px'
            }}
          />
        </div>
        
        <DrillDrawer />
      </div>
    </ThemeProvider>
  );
}

export default App;
