import { Component, type ReactNode } from 'react';
import { Box, Button, Typography } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <Box sx={{ textAlign: 'center', mt: 12, p: 4 }}>
        <ReportProblemIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" color="error" sx={{ mb: 1 }}>Đã xảy ra lỗi không mong muốn</Typography>
        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
          {this.state.error?.message ?? 'Lỗi không xác định'}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
          Tải lại trang
        </Button>
      </Box>
    );
  }
}
