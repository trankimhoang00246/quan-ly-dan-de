import { lazy, Suspense, useState } from 'react';
import { AppBar, Toolbar, Typography, Container, CssBaseline, Tabs, Tab, Box, Button, CircularProgress } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListIcon from '@mui/icons-material/FormatListBulleted';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginPage from './pages/LoginPage';
import { SnackbarProvider } from './context/SnackbarContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

const DashboardPage   = lazy(() => import('./pages/DashboardPage'));
const GoatListPage    = lazy(() => import('./pages/GoatListPage'));
const TransactionPage = lazy(() => import('./pages/TransactionPage'));

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress color="primary" />
    </Box>
  );
}

const theme = createTheme({
  palette: {
    primary: { main: '#16a34a' },
    secondary: { main: '#ea580c' },
  },
});

function AppShell() {
  const { isAuthenticated, username, logout } = useAuth();
  const [tab, setTab] = useState(0);

  if (!isAuthenticated) return <LoginPage />;

  return (
    <ErrorBoundary>
      <CssBaseline />
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar sx={{ gap: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            🐐 Quản Lý Đàn Dê
          </Typography>
          <Box sx={{ ml: 2, flex: 1 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              textColor="inherit"
              indicatorColor="secondary"
              sx={{ minHeight: 64 }}
            >
              <Tab
                icon={<DashboardIcon />}
                iconPosition="start"
                label="Dashboard"
                sx={{ color: 'rgba(255,255,255,0.85)', minHeight: 64, fontWeight: 600 }}
              />
              <Tab
                icon={<ListIcon />}
                iconPosition="start"
                label="Danh sách dê"
                sx={{ color: 'rgba(255,255,255,0.85)', minHeight: 64, fontWeight: 600 }}
              />
              <Tab
                icon={<ReceiptIcon />}
                iconPosition="start"
                label="Chi phí & Doanh thu"
                sx={{ color: 'rgba(255,255,255,0.85)', minHeight: 64, fontWeight: 600 }}
              />
            </Tabs>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              {username}
            </Typography>
            <Button
              color="inherit"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={logout}
              sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'none' }}
            >
              Đăng xuất
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Suspense fallback={<PageLoader />}>
          {tab === 0 && <DashboardPage />}
          {tab === 1 && <GoatListPage />}
          {tab === 2 && <TransactionPage />}
        </Suspense>
      </Container>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
