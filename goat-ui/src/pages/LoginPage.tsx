import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  Box, Button, TextField, Typography, Paper, Alert, CircularProgress,
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('Vui lòng nhập đầy đủ thông tin'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.login(username, password);
      login(res.token, res.username);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: '#f0fdf4',
    }}>
      <Paper elevation={3} sx={{ p: 4, width: 360, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <AgricultureIcon sx={{ fontSize: 48, color: '#16a34a' }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, color: '#15803d' }}>
            Quản Lý Đàn Dê
          </Typography>
          <Typography variant="body2" color="text.secondary">Đăng nhập để tiếp tục</Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Tên đăng nhập" size="small" fullWidth autoFocus
              value={username} onChange={e => setUsername(e.target.value)}
            />
            <TextField
              label="Mật khẩu" type="password" size="small" fullWidth
              value={password} onChange={e => setPassword(e.target.value)}
            />
            <Button
              type="submit" variant="contained" fullWidth disabled={loading}
              sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, py: 1.2 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Đăng nhập'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
