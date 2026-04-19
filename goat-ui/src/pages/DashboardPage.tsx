import { useEffect, useState } from 'react';
import { api } from '../api';
import type { DashboardStats, VaccineDueItem } from '../types';
import {
  Box, Grid, Paper, Typography, CircularProgress, Alert, Divider, LinearProgress,
  TextField, Button, Stack, Chip, Table, TableHead, TableRow, TableCell, TableBody,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import ScaleIcon from '@mui/icons-material/Scale';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

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
    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mt: 2, mb: 0.5 }}>
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

function DeltaChip({ current, prev }: { current: number; prev: number }) {
  if (prev === 0 && current === 0) return null;
  const delta = current - prev;
  const pct = prev > 0 ? Math.round(delta / prev * 100) : 100;
  const up = delta >= 0;
  return (
    <Chip
      size="small"
      icon={up ? <TrendingUpIcon /> : <TrendingDownIcon />}
      label={`${up ? '+' : ''}${pct}% so tháng trước`}
      color={up ? 'success' : 'error'}
      variant="outlined"
      sx={{ fontSize: 11 }}
    />
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [prevStats, setPrevStats] = useState<DashboardStats | null>(null);
  const [vaccineDue, setVaccineDue] = useState<VaccineDueItem[]>([]);
  const [needsWeight, setNeedsWeight] = useState<any[]>([]);
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

  const loadMonthComparison = () => {
    const now = new Date();
    // This month
    const thisStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const thisEnd = now.toISOString().split('T')[0];
    // Last month
    const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const lastEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

    // We already fetch this month via main loadStats — fetch prev for comparison
    api.getDashboardStats(lastStart, lastEnd).then(setPrevStats).catch(() => {});
    // Reload current stats to this month range (overwrite all-time)
    api.getDashboardStats(thisStart, thisEnd).then(setStats).catch(() => {});
  };

  useEffect(() => {
    loadStats('', '');
    loadMonthComparison();
    api.getVaccineDue(14).then(setVaccineDue).catch(() => {});
    api.getNeedsWeight(30).then(setNeedsWeight).catch(() => {});
  }, []);

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
  const prevProfit = prevStats
    ? prevStats.totalRevenue + prevStats.otherRevenue - prevStats.totalCapital - prevStats.otherExpenses
    : 0;

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '';
  const alertCount = needsWeight.length + vaccineDue.filter(v => v.daysLeft <= 0).length;

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
            <Button variant="contained" size="small" onClick={handleApply} disabled={loading}>
              Áp dụng
            </Button>
            {isFiltered && (
              <Button size="small" startIcon={<ClearIcon />} onClick={handleClear} color="inherit">
                Xóa lọc
              </Button>
            )}
            {isFiltered && <Chip label="Đang lọc" color="warning" size="small" variant="outlined" />}
          </Stack>
        </Paper>
      </Box>

      {/* === Cần chú ý === */}
      {alertCount > 0 && (
        <>
          <SectionLabel>Cần chú ý</SectionLabel>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            {needsWeight.length > 0 && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ borderColor: '#f59e0b', borderWidth: 1.5 }}>
                  <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid #fde68a' }}>
                    <ScaleIcon sx={{ color: '#d97706', fontSize: 20 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#92400e' }}>
                      Chưa cân {`>`} 30 ngày
                    </Typography>
                    <Chip label={`${needsWeight.length} con`} size="small" color="warning" sx={{ ml: 'auto' }} />
                  </Box>
                  <Box sx={{ px: 2, py: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {needsWeight.map((g: any) => (
                      <Chip key={g.id} label={`#${g.code}`} size="small" variant="outlined" color="warning" />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}
            {vaccineDue.filter(v => v.daysLeft <= 0).length > 0 && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ borderColor: '#ef4444', borderWidth: 1.5 }}>
                  <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid #fecaca' }}>
                    <WarningAmberIcon sx={{ color: '#dc2626', fontSize: 20 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#7f1d1d' }}>
                      Vaccine quá hạn
                    </Typography>
                    <Chip label={`${vaccineDue.filter(v => v.daysLeft <= 0).length} con`} size="small" color="error" sx={{ ml: 'auto' }} />
                  </Box>
                  <Box sx={{ px: 2, py: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {vaccineDue.filter(v => v.daysLeft <= 0).map(v => (
                      <Chip key={v.goatId} label={`#${v.goatCode} (${v.medicine})`} size="small" variant="outlined" color="error" />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}

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
          <StatCard title="Đã bán" value={stats.soldCount} sub="Tổng số dê đã xuất bán" color="#ea580c" />
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
      <SectionLabel>Tài chính — tháng này</SectionLabel>
      <Grid container spacing={2} sx={{ mb: 3, mt: 0.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderLeft: '4px solid #6366f1', height: '100%' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Tổng vốn đã đầu tư</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#6366f1' }}>{fmtMoney(stats.totalCapital)}</Typography>
            {prevStats && <DeltaChip current={stats.totalCapital} prev={prevStats.totalCapital} />}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderLeft: '4px solid #0891b2', height: '100%' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Doanh thu bán dê</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0891b2' }}>{fmtMoney(stats.totalRevenue)}</Typography>
            {prevStats && <DeltaChip current={stats.totalRevenue} prev={prevStats.totalRevenue} />}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderLeft: '4px solid #dc2626', height: '100%' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Chi phí phát sinh</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#dc2626' }}>{fmtMoney(stats.otherExpenses)}</Typography>
            {prevStats && <DeltaChip current={stats.otherExpenses} prev={prevStats.otherExpenses} />}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderLeft: '4px solid #16a34a', height: '100%' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Doanh thu khác</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#16a34a' }}>{fmtMoney(stats.otherRevenue)}</Typography>
            {prevStats && <DeltaChip current={stats.otherRevenue} prev={prevStats.otherRevenue} />}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderLeft: `4px solid ${profitColor}` }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {profitPositive ? 'Lợi nhuận' : 'Lỗ'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {profitPositive
                ? <TrendingUpIcon sx={{ color: profitColor, fontSize: 32 }} />
                : <TrendingDownIcon sx={{ color: profitColor, fontSize: 32 }} />}
              <Typography variant="h4" sx={{ fontWeight: 700, color: profitColor }}>
                {fmtMoney(Math.abs(profit))}
              </Typography>
              {prevStats && <DeltaChip current={profit} prev={prevProfit} />}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {profitPositive
                ? 'Doanh thu (bán dê + khác) trừ vốn và chi phí phát sinh'
                : 'Doanh thu (bán dê + khác) chưa đủ bù vốn và chi phí'}
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

      {/* === Vaccine due === */}
      <SectionLabel>Lịch tiêm vaccine</SectionLabel>
      <Paper variant="outlined" sx={{ mt: 1, mb: 1 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid #e5e7eb' }}>
          <VaccinesIcon sx={{ color: '#7c3aed', fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Dê cần chích thuốc trong 14 ngày tới
          </Typography>
          {vaccineDue.length > 0 && (
            <Chip label={`${vaccineDue.length} con`} size="small" color="warning" sx={{ ml: 'auto' }} />
          )}
        </Box>
        {vaccineDue.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}>
            Không có lịch tiêm nào trong 14 ngày tới
          </Box>
        ) : (
          <Table size="small">
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                {['Mã dê', 'Thuốc', 'Ngày cần chích', 'Còn lại'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {vaccineDue.map(item => (
                <TableRow key={`${item.goatId}-${item.nextDueDate}`} hover>
                  <TableCell><strong>#{item.goatCode}</strong></TableCell>
                  <TableCell>{item.medicine}</TableCell>
                  <TableCell>{new Date(item.nextDueDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.daysLeft === 0 ? 'Hôm nay' : item.daysLeft < 0 ? `Quá ${Math.abs(item.daysLeft)} ngày` : `${item.daysLeft} ngày`}
                      size="small"
                      color={item.daysLeft <= 0 ? 'error' : item.daysLeft <= 3 ? 'warning' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
