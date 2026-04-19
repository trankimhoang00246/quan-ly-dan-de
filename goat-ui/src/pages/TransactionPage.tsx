import { useEffect, useState } from 'react';
import { api } from '../api';
import type { FarmTransaction, TransactionType } from '../types';
import { TRANSACTION_TYPE_LABEL, TRANSACTION_TYPE_COLOR } from '../types';
import {
  Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  RadioGroup, FormControlLabel, Radio, FormLabel, FormControl,
  IconButton, Chip, Stack, Alert, CircularProgress, Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

const fmtMoney = (v: number) => v.toLocaleString('vi-VN') + ' đ';
const today = () => new Date().toISOString().slice(0, 10);

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<FarmTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterType, setFilterType] = useState<'' | TransactionType>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedType, setAppliedType] = useState<'' | TransactionType>('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState<FarmTransaction | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [formDesc, setFormDesc] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<TransactionType>('EXPENSE');
  const [formDate, setFormDate] = useState(today());
  const [formNote, setFormNote] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDesc, setDeleteDesc] = useState('');
  const [deleting, setDeleting] = useState(false);

  const load = (type: string, from: string, to: string) => {
    setLoading(true);
    setError('');
    api.getTransactions(type || undefined, from || undefined, to || undefined)
      .then(setTransactions)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load('', '', ''); }, []);

  const handleApply = () => {
    setAppliedType(filterType);
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    load(filterType, fromDate, toDate);
  };

  const handleClear = () => {
    setFilterType(''); setFromDate(''); setToDate('');
    setAppliedType(''); setAppliedFrom(''); setAppliedTo('');
    load('', '', '');
  };

  const isFiltered = !!appliedType || !!appliedFrom || !!appliedTo;

  const openCreate = () => {
    setEditingTx(null);
    setFormDesc(''); setFormAmount(''); setFormType('EXPENSE');
    setFormDate(today()); setFormNote('');
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (t: FarmTransaction) => {
    setEditingTx(t);
    setFormDesc(t.description);
    setFormAmount(String(t.amount));
    setFormType(t.type);
    setFormDate(t.date);
    setFormNote(t.note || '');
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formDesc.trim()) { setFormError('Vui lòng nhập mô tả'); return; }
    const amt = parseFloat(formAmount);
    if (!formAmount || isNaN(amt) || amt <= 0) { setFormError('Số tiền phải lớn hơn 0'); return; }
    if (!formDate) { setFormError('Vui lòng chọn ngày'); return; }

    setSaving(true);
    setFormError('');
    const body = { description: formDesc.trim(), amount: amt, type: formType, date: formDate, note: formNote.trim() || null };
    try {
      if (editingTx) {
        await api.updateTransaction(editingTx.id, body as any);
      } else {
        await api.createTransaction(body as any);
      }
      setShowForm(false);
      load(appliedType, appliedFrom, appliedTo);
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deleteTransaction(deleteId);
      setDeleteId(null);
      load(appliedType, appliedFrom, appliedTo);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const totalRevenue = transactions.filter(t => t.type === 'REVENUE').reduce((s, t) => s + t.amount, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Quản lý Chi phí & Doanh thu
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Thêm giao dịch
        </Button>
      </Box>

      {/* Filter bar */}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <FilterListIcon color="action" fontSize="small" />
          <Stack direction="row" spacing={0.5}>
            {(['', 'EXPENSE', 'REVENUE'] as const).map((t) => (
              <Button
                key={t}
                size="small"
                variant={filterType === t ? 'contained' : 'outlined'}
                onClick={() => setFilterType(t)}
                sx={{ minWidth: 100 }}
              >
                {t === '' ? 'Tất cả' : TRANSACTION_TYPE_LABEL[t]}
              </Button>
            ))}
          </Stack>
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
        </Stack>
      </Paper>

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper variant="outlined" sx={{ p: 2, borderLeft: '4px solid #dc2626' }}>
            <Typography variant="body2" color="text.secondary">Tổng chi phí (trong danh sách)</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#dc2626' }}>{fmtMoney(totalExpenses)}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper variant="outlined" sx={{ p: 2, borderLeft: '4px solid #16a34a' }}>
            <Typography variant="body2" color="text.secondary">Tổng doanh thu khác (trong danh sách)</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#16a34a' }}>{fmtMoney(totalRevenue)}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>Ngày</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Loại</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mô tả</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Số tiền</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ghi chú</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Chưa có giao dịch nào
                  </TableCell>
                </TableRow>
              ) : transactions.map(t => (
                <TableRow key={t.id} hover>
                  <TableCell>{new Date(t.date + 'T00:00:00').toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    <Chip
                      label={TRANSACTION_TYPE_LABEL[t.type]}
                      size="small"
                      sx={{ bgcolor: TRANSACTION_TYPE_COLOR[t.type] + '20', color: TRANSACTION_TYPE_COLOR[t.type], fontWeight: 600, border: `1px solid ${TRANSACTION_TYPE_COLOR[t.type]}40` }}
                    />
                  </TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: TRANSACTION_TYPE_COLOR[t.type] }}>
                    {fmtMoney(t.amount)}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{t.note || '—'}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openEdit(t)} title="Chỉnh sửa">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => { setDeleteId(t.id); setDeleteDesc(t.description); }} title="Xóa">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTx ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Mô tả *"
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              fullWidth
              placeholder="VD: Cám tháng 4, Bán phân dê..."
            />
            <TextField
              label="Số tiền *"
              type="number"
              value={formAmount}
              onChange={e => setFormAmount(e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { min: 0 } }}
            />
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, mb: 0.5 }}>Loại *</FormLabel>
              <RadioGroup row value={formType} onChange={e => setFormType(e.target.value as TransactionType)}>
                <FormControlLabel value="EXPENSE" control={<Radio />} label="Chi phí" />
                <FormControlLabel value="REVENUE" control={<Radio />} label="Doanh thu khác" />
              </RadioGroup>
            </FormControl>
            <TextField
              label="Ngày *"
              type="date"
              value={formDate}
              onChange={e => setFormDate(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Ghi chú"
              value={formNote}
              onChange={e => setFormNote(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowForm(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa giao dịch "<strong>{deleteDesc}</strong>"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
