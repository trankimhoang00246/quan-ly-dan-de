import { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, CssBaseline, Tabs, Tab, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListIcon from '@mui/icons-material/FormatListBulleted';
import ReceiptIcon from '@mui/icons-material/Receipt';
import GoatListPage from './pages/GoatListPage';
import DashboardPage from './pages/DashboardPage';
import TransactionPage from './pages/TransactionPage';

const theme = createTheme({
  palette: {
    primary: { main: '#16a34a' },
    secondary: { main: '#ea580c' },
  },
});

export default function App() {
  const [tab, setTab] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar sx={{ gap: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            🐐 Quản Lý Đàn Dê
          </Typography>
          <Box sx={{ ml: 2 }}>
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
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        {tab === 0 && <DashboardPage />}
        {tab === 1 && <GoatListPage />}
        {tab === 2 && <TransactionPage />}
      </Container>
    </ThemeProvider>
  );
}
