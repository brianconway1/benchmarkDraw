
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
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ 
        backgroundColor: '#000000', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        {/* BENCH MARK SPORTS Logo Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          padding: '20px',
          borderBottom: '2px solid #ffffff'
        }}>
          <img 
            src="/BENCH MARK BRAND WHT.png" 
            alt="BENCH MARK SPORTS" 
            style={{
              maxWidth: '400px',
              height: 'auto',
              display: 'block',
              margin: '0 auto'
            }}
          />
        </div>
        
      <DrillDrawer />
    </div>
    </ThemeProvider>
  );
}

export default App;
