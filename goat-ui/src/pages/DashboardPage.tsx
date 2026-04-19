import { useEffect, useState } from 'react';
import { api } from '../api';
import type { DashboardStats } from '../types';
import {
  Box, Grid, Paper, Typography, CircularProgress, Alert, Divider, LinearProgress,
  TextField, Button, Stack, Chip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

const fmtMoney = (v: number) => v.toLocaleString('vi-VN') + ' đ';

function StatCard({ title, value, sub, color = '#16a34a' }: {
  title: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderLeft: `4px solid ${color}`, height: '100%' }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, color }}>{value}</Typography>
      {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
    </Paper>
  );
}

function SegmentBar({ segments }: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <Box>
      <Box sx={{ display: 'flex', borderRadius: 1, overflow: 'hidden', height: 28, mb: 1.5 }}>
        {total === 0
          ? <Box sx={{ flex: 1, bgcolor: 'grey.200' }} />
          : segments.map(s => s.value > 0 && (
              <Box key={s.label} sx={{ flex: s.value, bgcolor: s.color, transition: 'flex 0.5s' }} />
            ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
        {segments.map(s => (
          <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: s.color, flexShrink: 0 }} />
            <Typography variant="caption">
              {s.label}: <strong>{s.value}</strong>{' '}
              <Typography component="span" variant="caption" color="text.secondary">
                ({total ? Math.round(s.value / total * 100) : 0}%)
              </Typography>
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
      {children}
    </Typography>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
      {children}
    </Typography>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  const loadStats = (from: string, to: string) => {
    setLoading(true);
    setError('');
    api.getDashboardStats(from || undefined, to || undefined)
      .then(setStats)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStats('', ''); }, []);

  const handleApply = () => {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    loadStats(fromDate, toDate);
  };

  const handleClear = () => {
    setFromDate(''); setToDate('');
    setAppliedFrom(''); setAppliedTo('');
    loadStats('', '');
  };

  const isFiltered = !!appliedFrom || !!appliedTo;

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress color="primary" />
    </Box>
  );
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!stats) return null;

  const profit = stats.totalRevenue + stats.otherRevenue - stats.totalCapital - stats.otherExpenses;
  const profitPositive = profit >= 0;
  const profitColor = profitPositive ? '#16a34a' : '#dc2626';
  const inactive = stats.soldCount + stats.deadCount + stats.slaughteredCount;

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '';

  return (
    <Box>
      {/* Header + filter bar */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Dashboard Tổng Quan Đàn Dê
          </Typography>
          {isFiltered && (
            <Typography variant="caption" color="text.secondary">
              Đang lọc: {fmtDate(appliedFrom) || '…'} → {fmtDate(appliedTo) || '…'}
            </Typography>
          )}
        </Box>
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <FilterListIcon color="action" fontSize="small" />
            <TextField
              label="Từ ngày" type="date" size="small"
              value={fromDate} onChange={e => setFromDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: 160 }}
            />
            <TextField
              label="Đến ngày" type="date" size="small"
              value={toDate} onChange={e => setToDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: 160 }}
            />
            <Button variant="contained" size="small" onClick={handleApply}
              disabled={loading}>
              Áp dụng
            </Button>
            {isFiltered && (
              <Button size="small" startIcon={<ClearIcon />} onClick={handleClear} color="inherit">
                Xóa lọc
              </Button>
            )}
            {isFiltered && (
              <Chip label="Đang lọc" color="warning" size="small" variant="outlined" />
            )}
          </Stack>
        </Paper>
      </Box>

      {/* === Herd Summary === */}
      <SectionLabel>Thống kê đàn</SectionLabel>
      <Grid container spacing={2} sx={{ mb: 3, mt: 0.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Tổng số dê (từ trước tới nay)"
            value={stats.totalGoats}
            sub={`Còn sống: ${stats.aliveCount} · Đã xuất: ${inactive}`}
            color="#6366f1"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Đang sống trong chuồng"
            value={stats.aliveCount}
            sub={`Đực: ${stats.maleAlive} · Cái: ${stats.femaleAlive}`}
            color="#16a34a"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Đã bán"
            value={stats.soldCount}
            sub="Tổng số dê đã xuất bán"
            color="#ea580c"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Đã chết / Làm thịt"
            value={stats.deadCount + stats.slaughteredCount}
            sub={`Chết tự nhiên: ${stats.deadCount} · Làm thịt: ${stats.slaughteredCount}`}
            color="#dc2626"
          />
        </Grid>
      </Grid>

      {/* === Financial Summary === */}
      <SectionLabel>Tài chính</SectionLabel>
      <Grid container spacing={2} sx={{ mb: 3, mt: 0.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Tổng vốn đã đầu tư"
            value={fmtMoney(stats.totalCapital)}
            sub="Tổng vốn tất cả dê"
            color="#6366f1"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Tổng doanh thu bán dê"
            value={fmtMoney(stats.totalRevenue)}
            sub="Từ bán & làm thịt có ghi giá"
            color="#0891b2"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Chi phí phát sinh"
            value={fmtMoney(stats.otherExpenses)}
            sub="Thức ăn, cám và chi phí khác"
            color="#dc2626"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Doanh thu khác"
            value={fmtMoney(stats.otherRevenue)}
            sub="Phân dê và doanh thu phụ"
            color="#16a34a"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderLeft: `4px solid ${profitColor}` }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {profitPositive ? 'Lợi nhuận' : 'Lỗ'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {profitPositive
                ? <TrendingUpIcon sx={{ color: profitColor, fontSize: 32 }} />
                : <TrendingDownIcon sx={{ color: profitColor, fontSize: 32 }} />}
              <Typography variant="h4" sx={{ fontWeight: 700, color: profitColor }}>
                {fmtMoney(Math.abs(profit))}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {profitPositive ? 'Doanh thu (bán dê + khác) trừ vốn và chi phí phát sinh' : 'Doanh thu (bán dê + khác) chưa đủ bù vốn và chi phí'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* === Charts === */}
      <SectionLabel>Biểu đồ phân bố</SectionLabel>
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <SectionTitle>Phân bố trạng thái (tất cả dê)</SectionTitle>
            <SegmentBar segments={[
              { label: 'Đang sống', value: stats.aliveCount, color: '#16a34a' },
              { label: 'Đã bán', value: stats.soldCount, color: '#ea580c' },
              { label: 'Đã chết', value: stats.deadCount, color: '#6b7280' },
              { label: 'Làm thịt', value: stats.slaughteredCount, color: '#dc2626' },
            ]} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <SectionTitle>Giới tính — đang sống ({stats.aliveCount} con)</SectionTitle>
            <SegmentBar segments={[
              { label: 'Đực', value: stats.maleAlive, color: '#2563eb' },
              { label: 'Cái', value: stats.femaleAlive, color: '#db2777' },
            ]} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <SectionTitle>Nhãn dê — đang sống ({stats.aliveCount} con)</SectionTitle>
            <SegmentBar segments={[
              { label: 'Giống', value: stats.giongAlive, color: '#16a34a' },
              { label: 'Buôn', value: stats.buonAlive, color: '#d97706' },
            ]} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <SectionTitle>Cân nặng & tỷ lệ giống/buôn</SectionTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ textAlign: 'center', minWidth: 110 }}>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 800 }}>
                  {stats.avgWeightAlive > 0 ? `${stats.avgWeightAlive}` : '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.avgWeightAlive > 0 ? 'kg trung bình' : 'Chưa có dữ liệu'}
                </Typography>
                <br />
                <Typography variant="caption" color="text.secondary">(dê đang sống)</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>
                    Giống ({stats.giongAlive})
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 700 }}>
                    Buôn ({stats.buonAlive})
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats.aliveCount > 0 ? (stats.giongAlive / stats.aliveCount) * 100 : 0}
                  sx={{
                    height: 14, borderRadius: 1,
                    bgcolor: '#d97706',
                    '& .MuiLinearProgress-bar': { bgcolor: '#16a34a', borderRadius: 1 },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {stats.aliveCount > 0
                    ? `${Math.round(stats.giongAlive / stats.aliveCount * 100)}% giống · ${Math.round(stats.buonAlive / stats.aliveCount * 100)}% buôn`
                    : 'Chưa có dê nào'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
