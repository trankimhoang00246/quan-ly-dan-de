import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import GoatListPage from './pages/GoatListPage';

const theme = createTheme({
  palette: {
    primary: { main: '#16a34a' },
    secondary: { main: '#ea580c' },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppBar position="static" color="primary" elevation={2}>
          <Toolbar>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              🐐 Quản Lý Đàn Dê
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
          <Routes>
            <Route path="/" element={<GoatListPage />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}
