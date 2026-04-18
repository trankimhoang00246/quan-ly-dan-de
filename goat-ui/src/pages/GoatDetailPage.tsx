import { useEffect, useState } from 'react';
import { api } from '../api';
import { type Goat, type GoatLog, GENDER_LABEL, LABEL_LABEL, STATUS_LABEL, STATUS_COLOR, ACTION_LABEL } from '../types';

type ModalType = 'weight' | 'sell' | 'dead' | 'slaughter' | null;

interface Props {
  id: string;
  onClose: () => void;
}

export default function GoatDetailModal({ id, onClose }: Props) {
  const [idStack, setIdStack] = useState<string[]>([id]);
  const currentId = idStack[idStack.length - 1];

  const [goat, setGoat] = useState<Goat | null>(null);
  const [logs, setLogs] = useState<GoatLog[]>([]);
  const [children, setChildren] = useState<Goat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modal, setModal] = useState<ModalType>(null);
  const [mWeight, setMWeight] = useState('');
  const [mPrice, setMPrice] = useState('');
  const [mNote, setMNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [mError, setMError] = useState('');

  const navigateTo = (targetId: string) => {
    setIdStack(prev => [...prev, targetId]);
  };

  const goBack = () => {
    setIdStack(prev => prev.slice(0, -1));
  };

  const reload = () => {
    setLoading(true);
    setError('');
    Promise.all([api.getGoat(currentId), api.getLogs(currentId), api.getChildren(currentId)])
      .then(([g, l, c]) => { setGoat(g); setLogs(l); setChildren(c); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setGoat(null);
    setLogs([]);
    setChildren([]);
    reload();
  }, [currentId]);

  const openModal = (t: ModalType) => {
    setModal(t); setMWeight(''); setMPrice(''); setMNote(''); setMError('');
  };

  const closeActionModal = () => setModal(null);

  const handleAction = async () => {
    if (!modal) return;
    setMError('');
    setSaving(true);
    try {
      const body = {
        weight: mWeight ? Number(mWeight) : null,
        price: mPrice ? Number(mPrice) : null,
        note: mNote.trim() || null,
      };
      if (modal === 'weight') {
        if (!mWeight) return setMError('Vui lòng nhập cân nặng');
        await api.updateWeight(currentId, { weight: Number(mWeight), note: mNote.trim() || null });
      } else if (modal === 'sell') {
        await api.sell(currentId, body);
      } else if (modal === 'dead') {
        await api.markDead(currentId, body);
      } else if (modal === 'slaughter') {
        await api.slaughter(currentId, body);
      }
      closeActionModal();
      reload();
    } catch (e: any) {
      setMError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const fmtMoney = (v: number | null) =>
    v != null ? v.toLocaleString('vi-VN') + ' đ' : '-';

  const fmtDate = (s: string) =>
    new Date(s).toLocaleString('vi-VN');

  const isAlive = goat?.status === 'ALIVE';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 998 }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 28, width: 740, maxWidth: '96vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {idStack.length > 1 && (
              <button onClick={goBack} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 13, color: '#374151' }}>
                ← Quay lại
              </button>
            )}
            <h2 style={{ margin: 0 }}>
              {goat ? `Dê #${goat.code}` : 'Chi tiết dê'}
              {goat && (
                <span style={{ marginLeft: 14, fontSize: 14, color: STATUS_COLOR[goat.status], fontWeight: 600 }}>
                  [{STATUS_LABEL[goat.status]}]
                </span>
              )}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>

        {loading && <p>Đang tải...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && goat && (
          <>
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 20 }}>
              <div style={{ marginBottom: 8, fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
                ID: {goat.id}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', fontSize: 14 }}>
                <Info label="Giới tính" value={GENDER_LABEL[goat.gender]} />
                <Info label="Nhãn" value={LABEL_LABEL[goat.label]} />
                <Info label="Cân hiện tại" value={goat.currentWeight != null ? goat.currentWeight + ' kg' : '-'} />
                <Info label="Vốn" value={fmtMoney(goat.capital)} />
                <div>
                  <span style={{ color: '#6b7280' }}>Cha: </span>
                  {goat.fatherId
                    ? <span onClick={() => navigateTo(goat.fatherId!)} style={linkStyle}>{goat.fatherCode}</span>
                    : <strong>{goat.fatherCode ?? '-'}</strong>}
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Mẹ: </span>
                  {goat.motherId
                    ? <span onClick={() => navigateTo(goat.motherId!)} style={linkStyle}>{goat.motherCode}</span>
                    : <strong>{goat.motherCode ?? '-'}</strong>}
                </div>
                <Info label="Ngày tạo" value={fmtDate(goat.createdAt)} />
                <Info label="Cập nhật" value={fmtDate(goat.updatedAt)} />
                {goat.note && <Info label="Ghi chú" value={goat.note} />}
              </div>
            </div>

            {isAlive && (
              <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => openModal('weight')} style={btnStyle('#2563eb')}>Cập nhật cân</button>
                <button onClick={() => openModal('sell')} style={btnStyle('#16a34a')}>Bán dê</button>
                <button onClick={() => openModal('dead')} style={btnStyle('#6b7280')}>Dê chết</button>
                <button onClick={() => openModal('slaughter')} style={btnStyle('#ea580c')}>Làm thịt</button>
              </div>
            )}

            {children.length > 0 && (
              <>
                <h3 style={{ marginBottom: 10 }}>Danh sách con ({children.length})</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 24 }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={th}>Mã số</th>
                      <th style={th}>Giới tính</th>
                      <th style={th}>Nhãn</th>
                      <th style={th}>Cân</th>
                      <th style={th}>Trạng thái</th>
                      <th style={th}>Ngày sinh</th>
                      <th style={th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {children.map(child => (
                      <tr key={child.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={td}><strong>{child.code}</strong></td>
                        <td style={td}>{GENDER_LABEL[child.gender]}</td>
                        <td style={td}>{LABEL_LABEL[child.label]}</td>
                        <td style={td}>{child.currentWeight != null ? child.currentWeight + ' kg' : '-'}</td>
                        <td style={td}>
                          <span style={{ color: STATUS_COLOR[child.status], fontWeight: 600 }}>
                            {STATUS_LABEL[child.status]}
                          </span>
                        </td>
                        <td style={td}>{new Date(child.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td style={td}>
                          <button onClick={() => navigateTo(child.id)} style={{ padding: '3px 10px', cursor: 'pointer', fontSize: 12 }}>Xem</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <h3 style={{ marginBottom: 10 }}>Lịch sử thao tác</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={th}>Thời gian</th>
                  <th style={th}>Hành động</th>
                  <th style={th}>Cân (kg)</th>
                  <th style={th}>Tiền (đ)</th>
                  <th style={th}>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 16, textAlign: 'center', color: '#888' }}>Chưa có lịch sử</td></tr>
                )}
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={td}>{fmtDate(log.createdAt)}</td>
                    <td style={td}><strong>{ACTION_LABEL[log.action]}</strong></td>
                    <td style={td}>{log.weight != null ? log.weight : '-'}</td>
                    <td style={td}>{log.price != null ? log.price.toLocaleString('vi-VN') : '-'}</td>
                    <td style={td}>{log.note ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 28, minWidth: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0 }}>
              {modal === 'weight' && 'Cập nhật cân'}
              {modal === 'sell' && 'Bán dê'}
              {modal === 'dead' && 'Ghi nhận dê chết'}
              {modal === 'slaughter' && 'Làm thịt dê'}
            </h3>
            {mError && <p style={{ color: 'red', marginBottom: 10 }}>{mError}</p>}

            <ModalRow label={modal === 'weight' ? 'Cân nặng mới (kg) *' : 'Cân (kg)'}>
              <input type="number" step="0.1" min="0" value={mWeight} onChange={e => setMWeight(e.target.value)} style={inputStyle} />
            </ModalRow>

            {(modal === 'sell' || modal === 'dead' || modal === 'slaughter') && (
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
              <button onClick={closeActionModal} style={{ padding: '8px 16px', cursor: 'pointer' }}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{ color: '#6b7280' }}>{label}: </span>
      <strong>{value}</strong>
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

const linkStyle: React.CSSProperties = {
  cursor: 'pointer',
  color: '#2563eb',
  textDecoration: 'underline',
  fontWeight: 600,
};

const btnStyle = (bg: string): React.CSSProperties => ({
  padding: '8px 18px',
  background: bg,
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 14,
});

const th: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
  fontWeight: 600,
  borderBottom: '2px solid #d1d5db',
};

const td: React.CSSProperties = {
  padding: '8px 12px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 10px',
  fontSize: 14,
  boxSizing: 'border-box',
};
