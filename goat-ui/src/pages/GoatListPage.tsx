import { useEffect, useState } from 'react';
import { api } from '../api';
import { type Goat, GENDER_LABEL, LABEL_LABEL, STATUS_LABEL, STATUS_COLOR, TAG_LABEL, TAG_COLOR } from '../types';
import GoatFormModal from './GoatFormPage';
import GoatDetailModal from './GoatDetailPage';
import GoatActionDialog, { type GoatActionType } from '../components/GoatActionDialog';
import GoatEditDialog from '../components/GoatEditDialog';
import GoatFamilyTree from '../components/GoatFamilyTree';
import { useToast } from '../context/SnackbarContext';
import {
  Box, Tabs, Tab, TextField, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Typography, Paper, Stack,
  CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel, Collapse,
  Checkbox, useMediaQuery, useTheme, Card, CardContent, CardActions, Divider, Fab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ScaleIcon from '@mui/icons-material/Scale';
import SellIcon from '@mui/icons-material/Sell';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import SetMealIcon from '@mui/icons-material/SetMeal';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ChecklistIcon from '@mui/icons-material/Checklist';

export default function GoatListPage() {
  const { showToast } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [herdGoats, setHerdGoats] = useState<Goat[]>([]);
  const [inactiveGoats, setInactiveGoats] = useState<Goat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [showFilter, setShowFilter] = useState(false);
  const [filterGender, setFilterGender] = useState('');
  const [filterLabel, setFilterLabel] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const activeFilterCount = [filterGender, filterLabel, filterTag].filter(Boolean).length;

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDialog, setBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<GoatActionType | null>(null);

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
  const filtered = (isHerd ? herdGoats : inactiveGoats).filter(g => {
    if (!g.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterGender && g.gender !== filterGender) return false;
    if (filterLabel && g.label !== filterLabel) return false;
    if (filterTag && (g.tag ?? '') !== filterTag) return false;
    return true;
  });

  const allSelected = filtered.length > 0 && filtered.every(g => selected.has(g.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(g => g.id)));
  };
  const toggleOne = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleExport = async () => {
    setExporting(true);
    try { await api.exportGoats(); showToast('Đã xuất file Excel'); }
    catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Xuất file thất bại', 'error'); }
    finally { setExporting(false); }
  };

  const fmtMoney = (v: number | null) =>
    v != null ? v.toLocaleString('vi-VN') + ' đ' : '-';

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress color="primary" /></Box>
  );
  if (error) return <Alert severity="error">{error}</Alert>;

  const selectedList = filtered.filter(g => selected.has(g.id));

  return (
    <Box>
      {/* Tabs */}
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, v) => { setActiveTab(v); setSearch(''); setSelected(new Set()); }}
          textColor="primary" indicatorColor="primary">
          <Tab label={`Đàn dê (${herdGoats.length})`} />
          <Tab label={`Đã xuất / Đã chết (${inactiveGoats.length})`} />
          <Tab label="Sơ đồ cây" />
        </Tabs>
      </Paper>

      {activeTab === 2 && <GoatFamilyTree />}

      {/* Toolbar */}
      <Stack spacing={1} sx={{ mb: 2, display: activeTab === 2 ? 'none' : 'flex' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
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
            sx={{ width: isMobile ? '100%' : 220 }}
          />
          <Button
            size="small" variant={showFilter ? 'contained' : 'outlined'}
            startIcon={<FilterListIcon />}
            color={activeFilterCount > 0 ? 'warning' : 'inherit'}
            onClick={() => setShowFilter(v => !v)}
          >
            Lọc {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </Button>
          {activeFilterCount > 0 && (
            <Button size="small" color="inherit" onClick={() => { setFilterGender(''); setFilterLabel(''); setFilterTag(''); }}>
              Xóa lọc
            </Button>
          )}
          {!isMobile && (
            <Typography variant="body2" color="text.secondary">
              Hiển thị {filtered.length} con
            </Typography>
          )}
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {isHerd && selected.size > 0 && (
              <Button variant="outlined" color="secondary" size="small"
                startIcon={<ChecklistIcon />}
                onClick={() => setBulkDialog(true)}>
                Hàng loạt ({selected.size})
              </Button>
            )}
            <Button size="small" variant="outlined" color="inherit"
              startIcon={exporting ? <CircularProgress size={14} /> : <FileDownloadIcon />}
              onClick={handleExport} disabled={exporting}>
              Xuất Excel
            </Button>
            {isHerd && (
              <Button variant="contained" color="primary" startIcon={<AddIcon />}
                onClick={() => setShowCreate(true)}>
                Thêm dê mới
              </Button>
            )}
          </Box>
        </Stack>

        <Collapse in={showFilter}>
          <Stack direction="row" spacing={1.5} sx={{ pt: 1, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Giới tính</InputLabel>
              <Select label="Giới tính" value={filterGender} onChange={e => setFilterGender(e.target.value)}>
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="MALE">Đực</MenuItem>
                <MenuItem value="FEMALE">Cái</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Nhãn</InputLabel>
              <Select label="Nhãn" value={filterLabel} onChange={e => setFilterLabel(e.target.value)}>
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="BUON">Buôn</MenuItem>
                <MenuItem value="GIONG">Giống</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Đánh giá</InputLabel>
              <Select label="Đánh giá" value={filterTag} onChange={e => setFilterTag(e.target.value)}>
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="DEP">Đẹp</MenuItem>
                <MenuItem value="XAU">Xấu</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Collapse>
      </Stack>

      {/* Mobile card view */}
      {activeTab !== 2 && isMobile && (
        <Stack spacing={1.5}>
          {filtered.length === 0 && (
            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              {activeFilterCount > 0 ? 'Không có dê nào khớp với bộ lọc' : 'Không có dê nào'}
            </Paper>
          )}
          {filtered.map(goat => (
            <Card key={goat.id} variant="outlined"
              sx={{
                ...(activeGoatId === goat.id && { borderColor: '#16a34a', borderWidth: 2 }),
              }}
              onClick={() => setActiveGoatId(goat.id)}
            >
              <CardContent sx={{ pb: 0.5, pt: 1.5, px: 2 }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>#{goat.code}</Typography>
                  <Stack direction="row" spacing={0.5}>
                    {goat.tag && (
                      <Chip label={TAG_LABEL[goat.tag]} size="small"
                        sx={{ bgcolor: TAG_COLOR[goat.tag], color: '#fff', fontWeight: 600, fontSize: 11 }} />
                    )}
                    {!isHerd && (
                      <Chip label={STATUS_LABEL[goat.status]} size="small"
                        sx={{ bgcolor: STATUS_COLOR[goat.status], color: '#fff', fontWeight: 600, fontSize: 11 }} />
                    )}
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 0.5 }}>
                  <Chip label={GENDER_LABEL[goat.gender]} size="small" variant="outlined" />
                  <Chip label={LABEL_LABEL[goat.label]} size="small"
                    color={goat.label === 'GIONG' ? 'primary' : 'default'} variant="outlined" />
                </Stack>
                <Box sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {goat.currentWeight != null && <span>⚖️ {goat.currentWeight} kg &nbsp;</span>}
                  <span>💰 {fmtMoney(goat.capital)}</span>
                  {(goat.fatherCode || goat.motherCode) && (
                    <Box sx={{ mt: 0.5 }}>
                      Cha: {goat.fatherCode ?? '-'} / Mẹ: {goat.motherCode ?? '-'}
                    </Box>
                  )}
                </Box>
              </CardContent>
              <Divider sx={{ mt: 1 }} />
              <CardActions sx={{ px: 1, py: 0.5, justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => setSelectedId(goat.id)} color="primary">
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  {isHerd && (
                    <>
                      <IconButton size="small" onClick={() => openAction(goat.id, 'weight')} color="primary">
                        <ScaleIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => openAction(goat.id, 'sell')} color="success">
                        <SellIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => openAction(goat.id, 'chich-thuoc')} sx={{ color: '#7c3aed' }}>
                        <VaccinesIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </Stack>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => setEditGoat(goat)} color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => { setDeleteGoatId(goat.id); setDeleteGoatCode(goat.code); }} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}

      {/* Desktop table view */}
      {activeTab !== 2 && !isMobile && (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                {isHerd && (
                  <TableCell padding="checkbox">
                    <Checkbox size="small" checked={allSelected} indeterminate={selected.size > 0 && !allSelected}
                      onChange={toggleAll} />
                  </TableCell>
                )}
                <TableCell sx={{ fontWeight: 700 }}>Mã số</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Giới tính</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nhãn</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Đánh giá</TableCell>
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
                  <TableCell colSpan={isHerd ? 10 : 9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    {activeFilterCount > 0 ? 'Không có dê nào khớp với bộ lọc' : 'Không có dê nào'}
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
                  {isHerd && (
                    <TableCell padding="checkbox" onClick={e => e.stopPropagation()}>
                      <Checkbox size="small" checked={selected.has(goat.id)} onChange={() => toggleOne(goat.id)} />
                    </TableCell>
                  )}
                  <TableCell><strong>{goat.code}</strong></TableCell>
                  <TableCell>{GENDER_LABEL[goat.gender]}</TableCell>
                  <TableCell>
                    <Chip label={LABEL_LABEL[goat.label]} size="small"
                      color={goat.label === 'GIONG' ? 'primary' : 'default'} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    {goat.tag
                      ? <Chip label={TAG_LABEL[goat.tag]} size="small" sx={{ bgcolor: TAG_COLOR[goat.tag], color: '#fff', fontWeight: 600 }} />
                      : <Box sx={{ color: 'text.disabled', fontSize: 12 }}>—</Box>}
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
        </Paper>
      )}

      {/* Bulk action dialog */}
      <Dialog open={bulkDialog} onClose={() => setBulkDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Thao tác hàng loạt ({selectedList.length} con)</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Chọn hành động áp dụng cho: {selectedList.map(g => g.code).join(', ')}
          </Typography>
          <Stack spacing={1.5}>
            {([
              { action: 'weight' as GoatActionType, label: '⚖️ Cập nhật cân', color: 'primary' },
              { action: 'chich-thuoc' as GoatActionType, label: '💉 Chích thuốc', color: 'secondary' },
            ] as const).map(({ action, label }) => (
              <Button key={action} variant="outlined" color={action === 'weight' ? 'primary' : 'secondary'}
                onClick={() => { setBulkAction(action); setBulkDialog(false); }}>
                {label}
              </Button>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialog(false)}>Hủy</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk action execution — one at a time for each selected goat */}
      {bulkAction && selectedList.length > 0 && (() => {
        const current = selectedList[0];
        return (
          <GoatActionDialog
            goatId={current.id}
            actionType={bulkAction}
            onClose={() => { setBulkAction(null); setSelected(new Set()); }}
            onSuccess={() => {
              const remaining = selectedList.slice(1);
              if (remaining.length === 0) {
                setBulkAction(null);
                setSelected(new Set());
                loadGoats();
                showToast(`Đã hoàn thành thao tác hàng loạt cho ${selectedList.length} con`);
              } else {
                setSelected(new Set(remaining.map(g => g.id)));
              }
            }}
          />
        );
      })()}

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
              try { await api.deleteGoat(deleteGoatId!); showToast(`Đã xóa dê #${deleteGoatCode}`); setDeleteGoatId(null); loadGoats(); }
              catch (e: unknown) { const msg = e instanceof Error ? e.message : String(e); showToast(msg, 'error'); setError(msg); setDeleteGoatId(null); }
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

      {/* FAB on mobile for adding goat */}
      {isMobile && isHerd && activeTab === 0 && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 24, right: 24, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
          onClick={() => setShowCreate(true)}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}
