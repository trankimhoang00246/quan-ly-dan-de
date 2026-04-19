import { useState } from 'react';
import { api } from '../api';
import { useToast } from '../context/SnackbarContext';
import type { Goat } from '../types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Alert, Box,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
} from '@mui/material';

interface Props {
  goat: Goat;
  isParent: boolean;  // có con → không cho sửa giới tính
  isChild: boolean;   // có cha/mẹ → không cho sửa giá vốn
  onClose: () => void;
  onSuccess: (updated: Goat) => void;
}

export default function GoatEditDialog({ goat, isParent, isChild, onClose, onSuccess }: Props) {
  const { showToast } = useToast();
  const [gender, setGender] = useState(goat.gender);
  const [label, setLabel] = useState(goat.label);
  const [tag, setTag] = useState(goat.tag ?? '');
  const [capital, setCapital] = useState(goat.capital != null ? String(goat.capital) : '');
  const [note, setNote] = useState(goat.note ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      const updated = await api.updateGoat(goat.id, {
        gender,
        label,
        tag: tag || null,
        capital: capital !== '' ? Number(capital) : goat.capital,
        note: note.trim() || null,
      });
      showToast('Đã cập nhật thông tin dê');
      onSuccess(updated);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Chỉnh sửa thông tin dê #{goat.code}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <FormControl disabled={isParent}>
            <FormLabel>
              Giới tính
              {isParent && <Box component="span" sx={{ ml: 1, fontSize: 11, color: 'warning.main' }}>(đã có con — không thể đổi)</Box>}
            </FormLabel>
            <RadioGroup row value={gender} onChange={e => { if (!isParent) setGender(e.target.value as any); }}>
              <FormControlLabel value="MALE" control={<Radio size="small" />} label="Đực" />
              <FormControlLabel value="FEMALE" control={<Radio size="small" />} label="Cái" />
            </RadioGroup>
          </FormControl>

          <FormControl>
            <FormLabel>Nhãn</FormLabel>
            <RadioGroup row value={label} onChange={e => setLabel(e.target.value as any)}>
              <FormControlLabel value="BUON" control={<Radio size="small" />} label="Buôn" />
              <FormControlLabel value="GIONG" control={<Radio size="small" />} label="Giống" />
            </RadioGroup>
          </FormControl>

          <FormControl>
            <FormLabel>Đánh giá (tuỳ chọn)</FormLabel>
            <RadioGroup row value={tag} onChange={e => setTag(e.target.value)}>
              <FormControlLabel value="" control={<Radio size="small" />} label="Không" />
              <FormControlLabel value="DEP" control={<Radio size="small" />} label="Đẹp" />
              <FormControlLabel value="XAU" control={<Radio size="small" />} label="Xấu" />
            </RadioGroup>
          </FormControl>

          <TextField
            label="Giá vốn (đ)" type="number" size="small" fullWidth
            value={capital} onChange={e => setCapital(e.target.value)}
            disabled={isChild}
            helperText={isChild ? 'Dê đẻ ra — giá vốn luôn là 0 đ' : undefined}
            slotProps={{ htmlInput: { min: 0 } }}
          />

          <TextField
            label="Ghi chú" size="small" fullWidth multiline rows={2}
            value={note} onChange={e => setNote(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" color="primary" disabled={saving} onClick={handleSubmit}>
          {saving ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
