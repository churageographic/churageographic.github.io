import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, styled } from '@mui/material';
import { useEffect } from 'react';
import { clearExpiredCache } from './utils/cacheUtils';

const StyledContainer = styled(Container)({
  maxWidth: '1200px',
  padding: '20px',
  margin: '0 auto',
});

const StyledBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  width: '100%',
});

const StyledHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
});

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      marginBottom: '1rem',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      marginBottom: '1rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderRadius: '8px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
        },
      },
    },
  },
});

import IndexPage from '@/pages/IndexPage/IndexPage';
import CalendarPage from '@/pages/CalendarPage/CalendarPage';



function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={
            <StyledContainer>
              <IndexPage />
            </StyledContainer>
          } />
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
