import { useEffect, useState } from 'react';
import { api } from '../api';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, TextField, Stack, Alert,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
  Select, MenuItem, InputLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  onClose: () => void;
  onSuccess: (goatId: string) => void;
}

export default function GoatFormModal({ onClose, onSuccess }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    code: '', gender: 'MALE', label: 'BUON',
    currentWeight: '', capital: '', fatherId: '', motherId: '', note: '',
    date: today,
  });
  const [goats, setGoats] = useState<{ id: string; code: string; gender: string }[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.getHerdGoats().then(setGoats).catch(() => {}); }, []);

  const hasParen = form.fatherId || form.motherId;

  const set = (k: string, v: string) => {
    setForm(f => {
      const next = { ...f, [k]: v };
      if ((k === 'fatherId' || k === 'motherId') && (next.fatherId || next.motherId)) next.capital = '0';
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.code.trim()) return setError('Vui lòng nhập mã số');
    setSaving(true);
    try {
      const goat = await api.createGoat({
        code: form.code.trim(), gender: form.gender, label: form.label,
        currentWeight: form.currentWeight ? Number(form.currentWeight) : null,
        capital: form.capital ? Number(form.capital) : 0,
        fatherId: form.fatherId || null, motherId: form.motherId || null,
        note: form.note.trim() || null,
        date: form.date || null,
      });
      onSuccess(goat.id);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={onClose}>
      <DialogTitle>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Thêm dê mới</span>
          <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Mã số *" size="small" fullWidth
              value={form.code} onChange={e => set('code', e.target.value)}
              placeholder="VD: D001"
            />

            <FormControl>
              <FormLabel>Giới tính</FormLabel>
              <RadioGroup row value={form.gender} onChange={e => set('gender', e.target.value)}>
                <FormControlLabel value="MALE" control={<Radio size="small" />} label="Đực" />
                <FormControlLabel value="FEMALE" control={<Radio size="small" />} label="Cái" />
              </RadioGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Nhãn</FormLabel>
              <RadioGroup row value={form.label} onChange={e => set('label', e.target.value)}>
                <FormControlLabel value="BUON" control={<Radio size="small" />} label="Buôn" />
                <FormControlLabel value="GIONG" control={<Radio size="small" />} label="Giống" />
              </RadioGroup>
            </FormControl>

            <TextField
              label="Cân hiện tại (kg)" size="small" fullWidth type="number"
              value={form.currentWeight} onChange={e => set('currentWeight', e.target.value)}
              slotProps={{ htmlInput: { step: 0.1, min: 0 } }}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>Cha</InputLabel>
              <Select label="Cha" value={form.fatherId} onChange={e => set('fatherId', e.target.value)}>
                <MenuItem value="">-- Không có --</MenuItem>
                {goats.filter(g => g.gender === 'MALE').map(g => (
                  <MenuItem key={g.id} value={g.id}>{g.code}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Mẹ</InputLabel>
              <Select label="Mẹ" value={form.motherId} onChange={e => set('motherId', e.target.value)}>
                <MenuItem value="">-- Không có --</MenuItem>
                {goats.filter(g => g.gender === 'FEMALE').map(g => (
                  <MenuItem key={g.id} value={g.id}>{g.code}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Vốn (đ)" size="small" fullWidth type="number"
              value={form.capital} onChange={e => set('capital', e.target.value)}
              slotProps={{ htmlInput: { min: 0, readOnly: !!hasParen } }}
              disabled={!!hasParen}
              helperText={hasParen ? 'Dê đẻ ra = 0đ' : undefined}
            />

            <TextField
              label="Ngày nhập / ngày sinh" type="date" size="small" fullWidth
              value={form.date} onChange={e => set('date', e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="Ghi chú" size="small" fullWidth multiline rows={2}
              value={form.note} onChange={e => set('note', e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained" color="primary" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
