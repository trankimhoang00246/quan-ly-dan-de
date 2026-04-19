import { useEffect, useState } from 'react';
import { api } from '../api';
import { type Goat, type GoatLog, GENDER_LABEL, LABEL_LABEL, STATUS_LABEL, STATUS_COLOR, ACTION_LABEL } from '../types';
import GoatActionDialog, { type GoatActionType } from '../components/GoatActionDialog';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Button, IconButton, Box, Stack, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, Paper,
  Alert, CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ScaleIcon from '@mui/icons-material/Scale';
import SellIcon from '@mui/icons-material/Sell';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import SetMealIcon from '@mui/icons-material/SetMeal';
import DeleteIcon from '@mui/icons-material/Delete';

interface Props { id: string; onClose: () => void; }

export default function GoatDetailModal({ id, onClose }: Props) {
  const [idStack, setIdStack] = useState<string[]>([id]);
  const currentId = idStack[idStack.length - 1];

  const [goat, setGoat] = useState<Goat | null>(null);
  const [logs, setLogs] = useState<GoatLog[]>([]);
  const [children, setChildren] = useState<Goat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modal, setModal] = useState<GoatActionType | null>(null);

  const navigateTo = (targetId: string) => setIdStack(prev => [...prev, targetId]);
  const goBack = () => setIdStack(prev => prev.slice(0, -1));

  const reload = () => {
    setLoading(true); setError('');
    Promise.all([api.getGoat(currentId), api.getLogs(currentId), api.getChildren(currentId)])
      .then(([g, l, c]) => { setGoat(g); setLogs(l); setChildren(c); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setGoat(null); setLogs([]); setChildren([]);
    setLoading(true); setError('');
    Promise.all([api.getGoat(currentId), api.getLogs(currentId), api.getChildren(currentId)])
      .then(([g, l, c]) => { setGoat(g); setLogs(l); setChildren(c); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [currentId]);

  const openModal = (t: GoatActionType) => setModal(t);

  const fmtMoney = (v: number | null) => v != null ? v.toLocaleString('vi-VN') + ' đ' : '-';
  const fmtDate = (s: string) => new Date(s).toLocaleString('vi-VN');
  const isAlive = goat?.status === 'ALIVE';

  return (
    <>
      <Dialog open fullWidth maxWidth="md" onClose={onClose} scroll="paper">
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
              {idStack.length > 1 && (
                <IconButton size="small" onClick={goBack}><ArrowBackIcon fontSize="small" /></IconButton>
              )}
              <Box sx={{ fontSize: 18, fontWeight: 700 }}>
                {goat ? `Dê #${goat.code}` : 'Chi tiết dê'}
              </Box>
              {goat && (
                <Chip label={STATUS_LABEL[goat.status]} size="small"
                  sx={{ bgcolor: STATUS_COLOR[goat.status], color: '#fff', fontWeight: 600 }} />
              )}
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />}
                onClick={() => setConfirmDelete(true)}>
                Xóa dê
              </Button>
              <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}
          {error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && goat && (
            <Stack spacing={3}>
              {/* Info card */}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ fontSize: 12, color: 'text.secondary', fontFamily: 'monospace', mb: 1 }}>
                  ID: {goat.id}
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', fontSize: 14 }}>
                  <InfoItem label="Giới tính" value={GENDER_LABEL[goat.gender]} />
                  <InfoItem label="Nhãn" value={LABEL_LABEL[goat.label]} />
                  <InfoItem label="Cân hiện tại" value={goat.currentWeight != null ? `${goat.currentWeight} kg` : '-'} />
                  <InfoItem label="Vốn" value={fmtMoney(goat.capital)} />
                  <Box>
                    <Box component="span" sx={{ color: 'text.secondary' }}>Cha: </Box>
                    {goat.fatherId
                      ? <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }} onClick={() => navigateTo(goat.fatherId!)}>{goat.fatherCode}</Box>
                      : <Box component="span" sx={{ fontWeight: 600 }}>{goat.fatherCode ?? '-'}</Box>}
                  </Box>
                  <Box>
                    <Box component="span" sx={{ color: 'text.secondary' }}>Mẹ: </Box>
                    {goat.motherId
                      ? <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }} onClick={() => navigateTo(goat.motherId!)}>{goat.motherCode}</Box>
                      : <Box component="span" sx={{ fontWeight: 600 }}>{goat.motherCode ?? '-'}</Box>}
                  </Box>
                  <InfoItem label="Ngày nhập/sinh" value={goat.date ? new Date(goat.date).toLocaleDateString('vi-VN') : fmtDate(goat.createdAt)} />
                  <InfoItem label="Cập nhật" value={fmtDate(goat.updatedAt)} />
                  {goat.note && <InfoItem label="Ghi chú" value={goat.note} />}
                </Box>
              </Paper>

              {/* Actions */}
              {isAlive && (
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  <Button variant="contained" color="primary" startIcon={<ScaleIcon />} size="small" onClick={() => openModal('weight')}>Cập nhật cân</Button>
                  <Button variant="contained" color="success" startIcon={<SellIcon />} size="small" onClick={() => openModal('sell')}>Bán dê</Button>
                  <Button variant="contained" color="inherit" startIcon={<HeartBrokenIcon />} size="small" onClick={() => openModal('dead')}>Dê chết</Button>
                  <Button variant="contained" color="warning" startIcon={<SetMealIcon />} size="small" onClick={() => openModal('slaughter')}>Làm thịt</Button>
                </Stack>
              )}

              {/* Children */}
              {children.length > 0 && (
                <Box>
                  <Box sx={{ fontSize: 16, fontWeight: 700, mb: 1 }}>Danh sách con ({children.length})</Box>
                  <Paper variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'grey.100' }}>
                        <TableRow>
                          {['Mã số', 'Giới tính', 'Nhãn', 'Cân', 'Trạng thái', 'Ngày sinh', ''].map(h => (
                            <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {children.map(child => (
                          <TableRow key={child.id} hover>
                            <TableCell><strong>{child.code}</strong></TableCell>
                            <TableCell>{GENDER_LABEL[child.gender]}</TableCell>
                            <TableCell>
                              <Chip label={LABEL_LABEL[child.label]} size="small"
                                color={child.label === 'GIONG' ? 'primary' : 'default'} variant="outlined" />
                            </TableCell>
                            <TableCell>{child.currentWeight != null ? `${child.currentWeight} kg` : '-'}</TableCell>
                            <TableCell>
                              <Chip label={STATUS_LABEL[child.status]} size="small"
                                sx={{ bgcolor: STATUS_COLOR[child.status], color: '#fff', fontWeight: 600 }} />
                            </TableCell>
                            <TableCell sx={{ fontSize: 13, color: 'text.secondary' }}>
                              {new Date(child.date ?? child.createdAt).toLocaleDateString('vi-VN')}
                            </TableCell>
                            <TableCell>
                              <Button size="small" onClick={() => navigateTo(child.id)}>Xem</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </Box>
              )}

              {/* Logs */}
              <Box>
                <Box sx={{ fontSize: 16, fontWeight: 700, mb: 1 }}>Lịch sử thao tác</Box>
                <Paper variant="outlined">
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'grey.100' }}>
                      <TableRow>
                        {['Ngày thực tế', 'Hành động', 'Cân (kg)', 'Tiền (đ)', 'Ghi chú'].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                            Chưa có lịch sử
                          </TableCell>
                        </TableRow>
                      )}
                      {logs.map(log => (
                        <TableRow key={log.id} hover>
                          <TableCell sx={{ fontSize: 13, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                            {log.date
                              ? new Date(log.date).toLocaleDateString('vi-VN')
                              : fmtDate(log.createdAt)}
                          </TableCell>
                          <TableCell><strong>{ACTION_LABEL[log.action]}</strong></TableCell>
                          <TableCell>{log.weight != null ? log.weight : '-'}</TableCell>
                          <TableCell>{log.price != null ? log.price.toLocaleString('vi-VN') : '-'}</TableCell>
                          <TableCell>{log.note ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Xác nhận xóa dê</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa dê <strong>#{goat?.code}</strong> không?
            Thao tác này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Hủy</Button>
          <Button variant="contained" color="error" disabled={deleting}
            onClick={async () => {
              setDeleting(true);
              try { await api.deleteGoat(currentId); onClose(); }
              catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); setConfirmDelete(false); }
              finally { setDeleting(false); }
            }}>
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      <GoatActionDialog
        goatId={modal ? currentId : null}
        actionType={modal}
        onClose={() => setModal(null)}
        onSuccess={() => { setModal(null); reload(); }}
      />
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Box component="span" sx={{ color: 'text.secondary' }}>{label}: </Box>
      <Box component="span" sx={{ fontWeight: 600 }}>{value}</Box>
    </Box>
  );
}
