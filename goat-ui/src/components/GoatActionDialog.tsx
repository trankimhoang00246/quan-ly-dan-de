import { useState } from 'react';
import { api } from '../api';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Alert,
} from '@mui/material';

export type GoatActionType = 'weight' | 'sell' | 'dead' | 'slaughter';

const ACTION_LABEL: Record<GoatActionType, string> = {
  weight:    'Cập nhật cân',
  sell:      'Bán dê',
  dead:      'Ghi nhận dê chết',
  slaughter: 'Làm thịt dê',
};

interface Props {
  goatId: string | null;
  actionType: GoatActionType | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GoatActionDialog({ goatId, actionType, onClose, onSuccess }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [mWeight, setMWeight] = useState('');
  const [mPrice, setMPrice] = useState('');
  const [mNote, setMNote] = useState('');
  const [mDate, setMDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [mError, setMError] = useState('');

  const handleClose = () => {
    setMWeight(''); setMPrice(''); setMNote(''); setMDate(today); setMError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!goatId || !actionType) return;
    if (actionType === 'weight' && !mWeight) { setMError('Vui lòng nhập cân nặng'); return; }
    setSaving(true); setMError('');
    try {
      const body = {
        weight: mWeight ? Number(mWeight) : null,
        price: mPrice ? Number(mPrice) : null,
        note: mNote.trim() || null,
        date: mDate || null,
      };
      if (actionType === 'weight') await api.updateWeight(goatId, { weight: Number(mWeight), note: body.note, date: body.date });
      else if (actionType === 'sell') await api.sell(goatId, body);
      else if (actionType === 'dead') await api.markDead(goatId, body);
      else if (actionType === 'slaughter') await api.slaughter(goatId, body);
      handleClose();
      onSuccess();
    } catch (e: unknown) { setMError(e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={!!goatId && !!actionType} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{actionType ? ACTION_LABEL[actionType] : ''}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {mError && <Alert severity="error">{mError}</Alert>}
          <TextField
            label="Ngày thực tế" type="date" size="small" fullWidth
            value={mDate} onChange={e => setMDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label={actionType === 'weight' ? 'Cân nặng mới (kg) *' : 'Cân (kg)'}
            type="number" size="small" fullWidth
            value={mWeight} onChange={e => setMWeight(e.target.value)}
            slotProps={{ htmlInput: { step: 0.1, min: 0 } }}
          />
          {(actionType === 'sell' || actionType === 'dead' || actionType === 'slaughter') && (
            <TextField label="Tiền bán (đ)" type="number" size="small" fullWidth
              value={mPrice} onChange={e => setMPrice(e.target.value)}
              slotProps={{ htmlInput: { min: 0 } }} />
          )}
          <TextField label="Ghi chú" size="small" fullWidth
            value={mNote} onChange={e => setMNote(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        <Button variant="contained" color="primary" disabled={saving} onClick={handleSubmit}>
          {saving ? 'Đang lưu...' : 'Xác nhận'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
