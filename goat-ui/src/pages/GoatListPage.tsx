import { useEffect, useState } from 'react';
import { api } from '../api';
import { type Goat, GENDER_LABEL, LABEL_LABEL, STATUS_LABEL, STATUS_COLOR } from '../types';
import GoatFormModal from './GoatFormPage';
import GoatDetailModal from './GoatDetailPage';

type ActionType = 'weight' | 'sell' | 'dead' | 'slaughter';

export default function GoatListPage() {
  const [herdGoats, setHerdGoats] = useState<Goat[]>([]);
  const [inactiveGoats, setInactiveGoats] = useState<Goat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'herd' | 'inactive'>('herd');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [actionGoatId, setActionGoatId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [mWeight, setMWeight] = useState('');
  const [mPrice, setMPrice] = useState('');
  const [mNote, setMNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [mError, setMError] = useState('');

  const openAction = (goatId: string, type: ActionType) => {
    setActionGoatId(goatId);
    setActionType(type);
    setMWeight(''); setMPrice(''); setMNote(''); setMError('');
  };

  const closeAction = () => { setActionGoatId(null); setActionType(null); };

  const handleAction = async () => {
    if (!actionGoatId || !actionType) return;
    if (actionType === 'weight' && !mWeight) { setMError('Vui lòng nhập cân nặng'); return; }
    setSaving(true); setMError('');
    try {
      const body = { weight: mWeight ? Number(mWeight) : null, price: mPrice ? Number(mPrice) : null, note: mNote.trim() || null };
      if (actionType === 'weight') await api.updateWeight(actionGoatId, { weight: Number(mWeight), note: mNote.trim() || null });
      else if (actionType === 'sell') await api.sell(actionGoatId, body);
      else if (actionType === 'dead') await api.markDead(actionGoatId, body);
      else if (actionType === 'slaughter') await api.slaughter(actionGoatId, body);
      closeAction();
      loadGoats();
    } catch (e: any) {
      setMError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const loadGoats = () => {
    Promise.all([api.getHerdGoats(), api.getInactiveGoats()])
      .then(([herd, inactive]) => { setHerdGoats(herd); setInactiveGoats(inactive); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadGoats(); }, []);

  const filtered = (activeTab === 'herd' ? herdGoats : inactiveGoats)
    .filter(g => g.code.toLowerCase().includes(search.toLowerCase()));

  const fmtMoney = (v: number | null) =>
    v != null ? v.toLocaleString('vi-VN') + ' đ' : '-';

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '2px solid #e5e7eb' }}>
        <button
          onClick={() => { setActiveTab('herd'); setSearch(''); }}
          style={{ padding: '8px 20px', fontSize: 14, border: 'none', borderBottom: activeTab === 'herd' ? '2px solid #16a34a' : '2px solid transparent', background: 'none', cursor: 'pointer', fontWeight: activeTab === 'herd' ? 700 : 400, color: activeTab === 'herd' ? '#16a34a' : '#555', marginBottom: -2 }}
        >
          Đàn dê ({herdGoats.length})
        </button>
        <button
          onClick={() => { setActiveTab('inactive'); setSearch(''); }}
          style={{ padding: '8px 20px', fontSize: 14, border: 'none', borderBottom: activeTab === 'inactive' ? '2px solid #ea580c' : '2px solid transparent', background: 'none', cursor: 'pointer', fontWeight: activeTab === 'inactive' ? 700 : 400, color: activeTab === 'inactive' ? '#ea580c' : '#555', marginBottom: -2 }}
        >
          Đã xuất / Đã chết ({inactiveGoats.length})
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Tìm theo mã số..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '6px 10px', fontSize: 14, width: 200 }}
        />
        <span style={{ color: '#555' }}>
          Hiển thị {filtered.length} con
        </span>
        {activeTab === 'herd' && (
          <button
            onClick={() => setShowCreate(true)}
            style={{ marginLeft: 'auto', padding: '6px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}
          >
            + Thêm dê mới
          </button>
        )}
      </div>

      {/* Herd table (ALIVE) */}
      {activeTab === 'herd' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={th}>ID</th>
              <th style={th}>Mã số</th>
              <th style={th}>Giới tính</th>
              <th style={th}>Nhãn</th>
              <th style={th}>Cân hiện tại</th>
              <th style={th}>Vốn</th>
              <th style={th}>Cha / Mẹ</th>
              <th style={th}>Ngày tạo</th>
              <th style={th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#888' }}>Không có dê nào</td></tr>
            )}
            {filtered.map(goat => (
              <tr key={goat.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ ...td, fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{goat.id}</td>
                <td style={td}><strong>{goat.code}</strong></td>
                <td style={td}>{GENDER_LABEL[goat.gender]}</td>
                <td style={td}>{LABEL_LABEL[goat.label]}</td>
                <td style={td}>{goat.currentWeight != null ? goat.currentWeight + ' kg' : '-'}</td>
                <td style={td}>{fmtMoney(goat.capital)}</td>
                <td style={td}>
                  {goat.fatherCode || goat.motherCode ? (
                    <>
                      {goat.fatherId
                        ? <span onClick={() => setSelectedId(goat.fatherId!)} style={{ cursor: 'pointer', color: '#2563eb', textDecoration: 'underline' }}>{goat.fatherCode ?? '?'}</span>
                        : (goat.fatherCode ?? '?')}
                      {' / '}
                      {goat.motherId
                        ? <span onClick={() => setSelectedId(goat.motherId!)} style={{ cursor: 'pointer', color: '#2563eb', textDecoration: 'underline' }}>{goat.motherCode ?? '?'}</span>
                        : (goat.motherCode ?? '?')}
                    </>
                  ) : '-'}
                </td>
                <td style={td}>{new Date(goat.createdAt).toLocaleString('vi-VN')}</td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button onClick={() => setSelectedId(goat.id)} style={{ padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>Xem</button>
                    <button onClick={() => openAction(goat.id, 'weight')} style={btnStyle('#2563eb')}>Cập nhật cân</button>
                    <button onClick={() => openAction(goat.id, 'sell')} style={btnStyle('#16a34a')}>Bán</button>
                    <button onClick={() => openAction(goat.id, 'dead')} style={btnStyle('#6b7280')}>Chết</button>
                    <button onClick={() => openAction(goat.id, 'slaughter')} style={btnStyle('#ea580c')}>Làm thịt</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Inactive table (SOLD / DEAD / SLAUGHTERED) */}
      {activeTab === 'inactive' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={th}>ID</th>
              <th style={th}>Mã số</th>
              <th style={th}>Giới tính</th>
              <th style={th}>Nhãn</th>
              <th style={th}>Cân cuối</th>
              <th style={th}>Vốn</th>
              <th style={th}>Trạng thái</th>
              <th style={th}>Ngày cập nhật</th>
              <th style={th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#888' }}>Không có dê nào</td></tr>
            )}
            {filtered.map(goat => (
              <tr key={goat.id} style={{ borderBottom: '1px solid #e5e7eb', opacity: 0.85 }}>
                <td style={{ ...td, fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{goat.id}</td>
                <td style={td}><strong>{goat.code}</strong></td>
                <td style={td}>{GENDER_LABEL[goat.gender]}</td>
                <td style={td}>{LABEL_LABEL[goat.label]}</td>
                <td style={td}>{goat.currentWeight != null ? goat.currentWeight + ' kg' : '-'}</td>
                <td style={td}>{fmtMoney(goat.capital)}</td>
                <td style={td}>
                  <span style={{ color: STATUS_COLOR[goat.status], fontWeight: 600 }}>
                    {STATUS_LABEL[goat.status]}
                  </span>
                </td>
                <td style={td}>{new Date(goat.updatedAt).toLocaleString('vi-VN')}</td>
                <td style={td}>
                  <button onClick={() => setSelectedId(goat.id)} style={{ padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>Xem</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showCreate && (
        <GoatFormModal
          onClose={() => setShowCreate(false)}
          onSuccess={(goatId) => {
            setShowCreate(false);
            loadGoats();
            setSelectedId(goatId);
          }}
        />
      )}

      {selectedId && (
        <GoatDetailModal
          id={selectedId}
          onClose={() => { setSelectedId(null); loadGoats(); }}
        />
      )}

      {actionGoatId && actionType && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 28, minWidth: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0 }}>
              {actionType === 'weight' && 'Cập nhật cân'}
              {actionType === 'sell' && 'Bán dê'}
              {actionType === 'dead' && 'Ghi nhận dê chết'}
              {actionType === 'slaughter' && 'Làm thịt dê'}
            </h3>
            {mError && <p style={{ color: 'red', marginBottom: 10 }}>{mError}</p>}
            <ModalRow label={actionType === 'weight' ? 'Cân nặng mới (kg) *' : 'Cân (kg)'}>
              <input type="number" step="0.1" min="0" value={mWeight} onChange={e => setMWeight(e.target.value)} style={inputStyle} />
            </ModalRow>
            {(actionType === 'sell' || actionType === 'dead' || actionType === 'slaughter') && (
              <ModalRow label="Tiền bán (đ)">
                <input type="number" min="0" value={mPrice} onChange={e => setMPrice(e.target.value)} style={inputStyle} />
              </ModalRow>
            )}
            <ModalRow label="Ghi chú">
              <input value={mNote} onChange={e => setMNote(e.target.value)} style={inputStyle} />
            </ModalRow>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleAction} disabled={saving} style={{ padding: '8px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                {saving ? 'Đang lưu...' : 'Xác nhận'}
              </button>
              <button onClick={closeAction} style={{ padding: '8px 16px', cursor: 'pointer' }}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
      <label style={{ width: 160, fontSize: 14 }}>{label}</label>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '6px 10px', fontSize: 14, boxSizing: 'border-box',
};

const btnStyle = (bg: string): React.CSSProperties => ({
  padding: '3px 8px', background: bg, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12,
});

const th: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
  fontWeight: 600,
  borderBottom: '2px solid #d1d5db',
};

const td: React.CSSProperties = {
  padding: '8px 12px',
  verticalAlign: 'middle',
};
