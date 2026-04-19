import { useEffect, useState } from 'react';
import { api } from '../api';
import { type Goat, GENDER_LABEL, LABEL_LABEL, STATUS_LABEL, STATUS_COLOR } from '../types';
import GoatFormModal from './GoatFormPage';
import GoatDetailModal from './GoatDetailPage';
import GoatActionDialog, { type GoatActionType } from '../components/GoatActionDialog';
import GoatEditDialog from '../components/GoatEditDialog';
import GoatFamilyTree from '../components/GoatFamilyTree';
import {
  Box, Tabs, Tab, TextField, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Typography, Paper, Stack,
  CircularProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ScaleIcon from '@mui/icons-material/Scale';
import SellIcon from '@mui/icons-material/Sell';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import SetMealIcon from '@mui/icons-material/SetMeal';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import EditIcon from '@mui/icons-material/Edit';


export default function GoatListPage() {
  const [herdGoats, setHerdGoats] = useState<Goat[]>([]);
  const [inactiveGoats, setInactiveGoats] = useState<Goat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [deleteGoatId, setDeleteGoatId] = useState<string | null>(null);
  const [deleteGoatCode, setDeleteGoatCode] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [actionGoatId, setActionGoatId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<GoatActionType | null>(null);

  const [editGoat, setEditGoat] = useState<Goat | null>(null);
  const [activeGoatId, setActiveGoatId] = useState<string | null>(null);
  const allGoats = [...herdGoats, ...inactiveGoats];
  const isParentOf = (goatId: string) =>
    allGoats.some(g => g.fatherId === goatId || g.motherId === goatId);

  const openAction = (goatId: string, type: GoatActionType) => {
    setActionGoatId(goatId); setActionType(type);
  };
  const closeAction = () => { setActionGoatId(null); setActionType(null); };

  const loadGoats = () => {
    setLoading(true);
    Promise.all([api.getHerdGoats(), api.getInactiveGoats()])
      .then(([herd, inactive]) => { setHerdGoats(herd); setInactiveGoats(inactive); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadGoats(); }, []);

  const isHerd = activeTab === 0;
  const filtered = (isHerd ? herdGoats : inactiveGoats)
    .filter(g => g.code.toLowerCase().includes(search.toLowerCase()));

  const fmtMoney = (v: number | null) =>
    v != null ? v.toLocaleString('vi-VN') + ' đ' : '-';

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress color="primary" /></Box>
  );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      {/* Tabs */}
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, v) => { setActiveTab(v); setSearch(''); }}
          textColor="primary" indicatorColor="primary">
          <Tab label={`Đàn dê (${herdGoats.length})`} />
          <Tab label={`Đã xuất / Đã chết (${inactiveGoats.length})`} />
          <Tab label="Sơ đồ cây" />
        </Tabs>
      </Paper>

      {activeTab === 2 && <GoatFamilyTree />}

      {/* Toolbar */}
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2, flexWrap: 'wrap', display: activeTab === 2 ? 'none' : 'flex' }}>
        <TextField
          size="small"
          placeholder="Tìm theo mã số..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center', color: 'text.secondary' }}><SearchIcon fontSize="small" /></Box>,
            },
          }}
          sx={{ width: 220 }}
        />
        <Typography variant="body2" color="text.secondary">
          Hiển thị {filtered.length} con
        </Typography>
        {isHerd && (
          <Button variant="contained" color="primary" startIcon={<AddIcon />}
            onClick={() => setShowCreate(true)} sx={{ ml: 'auto !important' }}>
            Thêm dê mới
          </Button>
        )}
      </Stack>

      {/* Table */}
      {activeTab !== 2 && <Paper variant="outlined">
        <Table size="small">
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Mã số</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Giới tính</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Nhãn</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Cân hiện tại</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Vốn</TableCell>
              {isHerd ? (
                <TableCell sx={{ fontWeight: 700 }}>Cha / Mẹ</TableCell>
              ) : (
                <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
              )}
              <TableCell sx={{ fontWeight: 700 }}>
                {isHerd ? 'Ngày tạo' : 'Ngày cập nhật'}
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Không có dê nào
                </TableCell>
              </TableRow>
            )}
            {filtered.map(goat => (
              <TableRow
                key={goat.id}
                hover
                onClick={() => setActiveGoatId(goat.id)}
                sx={{
                  opacity: isHerd ? 1 : 0.85,
                  cursor: 'pointer',
                  ...(activeGoatId === goat.id && {
                    bgcolor: '#f0fdf4',
                    borderLeft: '3px solid #16a34a',
                    opacity: 1,
                  }),
                }}
              >
                <TableCell><strong>{goat.code}</strong></TableCell>
                <TableCell>{GENDER_LABEL[goat.gender]}</TableCell>
                <TableCell>
                  <Chip label={LABEL_LABEL[goat.label]} size="small"
                    color={goat.label === 'GIONG' ? 'primary' : 'default'} variant="outlined" />
                </TableCell>
                <TableCell>{goat.currentWeight != null ? `${goat.currentWeight} kg` : '-'}</TableCell>
                <TableCell>{fmtMoney(goat.capital)}</TableCell>
                {isHerd ? (
                  <TableCell>
                    {goat.fatherCode || goat.motherCode ? (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {goat.fatherId
                          ? <Typography component="span" variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setSelectedId(goat.fatherId!)}>
                              {goat.fatherCode ?? '?'}
                            </Typography>
                          : <Typography component="span" variant="body2">{goat.fatherCode ?? '?'}</Typography>}
                        <Typography variant="body2" color="text.secondary"> / </Typography>
                        {goat.motherId
                          ? <Typography component="span" variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setSelectedId(goat.motherId!)}>
                              {goat.motherCode ?? '?'}
                            </Typography>
                          : <Typography component="span" variant="body2">{goat.motherCode ?? '?'}</Typography>}
                      </Box>
                    ) : '-'}
                  </TableCell>
                ) : (
                  <TableCell>
                    <Chip label={STATUS_LABEL[goat.status]} size="small"
                      sx={{ bgcolor: STATUS_COLOR[goat.status], color: '#fff', fontWeight: 600 }} />
                  </TableCell>
                )}
                <TableCell sx={{ fontSize: 13, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                  {new Date(isHerd ? (goat.date ?? goat.createdAt) : goat.updatedAt).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                    <Tooltip title="Xem chi tiết">
                      <IconButton size="small" onClick={() => setSelectedId(goat.id)} color="primary">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {isHerd && (
                      <>
                        <Tooltip title="Cập nhật cân">
                          <IconButton size="small" onClick={() => openAction(goat.id, 'weight')} color="primary">
                            <ScaleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Bán dê">
                          <IconButton size="small" onClick={() => openAction(goat.id, 'sell')} color="success">
                            <SellIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Dê chết">
                          <IconButton size="small" onClick={() => openAction(goat.id, 'dead')}>
                            <HeartBrokenIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Làm thịt">
                          <IconButton size="small" onClick={() => openAction(goat.id, 'slaughter')} color="warning">
                            <SetMealIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chích thuốc">
                          <IconButton size="small" onClick={() => openAction(goat.id, 'chich-thuoc')} sx={{ color: '#7c3aed' }}>
                            <VaccinesIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Sửa thông tin">
                      <IconButton size="small" onClick={() => setEditGoat(goat)} color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton size="small" onClick={() => { setDeleteGoatId(goat.id); setDeleteGoatCode(goat.code); }} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>}

      {/* Create modal */}
      {showCreate && (
        <GoatFormModal onClose={() => setShowCreate(false)} onSuccess={(id) => { setShowCreate(false); loadGoats(); setSelectedId(id); }} />
      )}

      {/* Detail modal */}
      {selectedId && (
        <GoatDetailModal id={selectedId} onClose={() => { setSelectedId(null); loadGoats(); }} />
      )}

      {/* Delete confirm */}
      <Dialog open={!!deleteGoatId} onClose={() => setDeleteGoatId(null)}>
        <DialogTitle>Xác nhận xóa dê</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa dê <strong>#{deleteGoatCode}</strong> không?
            Thao tác này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteGoatId(null)}>Hủy</Button>
          <Button variant="contained" color="error" disabled={deleting}
            onClick={async () => {
              setDeleting(true);
              try { await api.deleteGoat(deleteGoatId!); setDeleteGoatId(null); loadGoats(); }
              catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); setDeleteGoatId(null); }
              finally { setDeleting(false); }
            }}>
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {editGoat && (
        <GoatEditDialog
          goat={editGoat}
          isParent={isParentOf(editGoat.id)}
          isChild={!!(editGoat.fatherId || editGoat.motherId)}
          onClose={() => setEditGoat(null)}
          onSuccess={(updated) => {
            setEditGoat(null);
            setHerdGoats(prev => prev.map(g => g.id === updated.id ? updated : g));
            setInactiveGoats(prev => prev.map(g => g.id === updated.id ? updated : g));
          }}
        />
      )}

      <GoatActionDialog
        goatId={actionGoatId}
        actionType={actionType}
        onClose={closeAction}
        onSuccess={() => { closeAction(); loadGoats(); }}
      />
    </Box>
  );
}
