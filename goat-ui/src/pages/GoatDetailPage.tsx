import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Goat, GoatLog, GENDER_LABEL, LABEL_LABEL, STATUS_LABEL, STATUS_COLOR, ACTION_LABEL } from '../types';

type ModalType = 'weight' | 'sell' | 'dead' | 'slaughter' | null;

export default function GoatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [goat, setGoat] = useState<Goat | null>(null);
  const [logs, setLogs] = useState<GoatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modal, setModal] = useState<ModalType>(null);
  const [mWeight, setMWeight] = useState('');
  const [mPrice, setMPrice] = useState('');
  const [mNote, setMNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [mError, setMError] = useState('');

  const reload = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([api.getGoat(id), api.getLogs(id)])
      .then(([g, l]) => { setGoat(g); setLogs(l); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [id]);

  const openModal = (t: ModalType) => {
    setModal(t); setMWeight(''); setMPrice(''); setMNote(''); setMError('');
  };

  const closeModal = () => setModal(null);

  const handleAction = async () => {
    if (!id || !modal) return;
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
        await api.updateWeight(id, { weight: Number(mWeight), note: mNote.trim() || null });
      } else if (modal === 'sell') {
        await api.sell(id, body);
      } else if (modal === 'dead') {
        await api.markDead(id, body);
      } else if (modal === 'slaughter') {
        await api.slaughter(id, body);
      }
      closeModal();
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

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!goat) return null;

  const isAlive = goat.status === 'ALIVE';

  return (
    <div>
      <button onClick={() => navigate('/')} style={{ marginBottom: 16, cursor: 'pointer' }}>
        ← Quay lại
      </button>

      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>
          Dê #{goat.code}
          <span style={{ marginLeft: 14, fontSize: 14, color: STATUS_COLOR[goat.status], fontWeight: 600 }}>
            [{STATUS_LABEL[goat.status]}]
          </span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', fontSize: 14 }}>
          <Info label="Giới tính" value={GENDER_LABEL[goat.gender]} />
          <Info label="Nhãn" value={LABEL_LABEL[goat.label]} />
          <Info label="Cân hiện tại" value={goat.currentWeight != null ? goat.currentWeight + ' kg' : '-'} />
          <Info label="Vốn" value={fmtMoney(goat.capital)} />
          <Info label="Cha" value={goat.fatherCode ?? '-'} />
          <Info label="Mẹ" value={goat.motherCode ?? '-'} />
          <Info label="Ngày tạo" value={fmtDate(goat.createdAt)} />
          <Info label="Cập nhật" value={fmtDate(goat.updatedAt)} />
          {goat.note && <Info label="Ghi chú" value={goat.note} />}
        </div>
      </div>

      {isAlive && (
        <div style={{ marginBottom: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => openModal('weight')} style={btnStyle('#2563eb')}>Cập nhật cân</button>
          <button onClick={() => openModal('sell')} style={btnStyle('#16a34a')}>Bán dê</button>
          <button onClick={() => openModal('dead')} style={btnStyle('#6b7280')}>Dê chết</button>
          <button onClick={() => openModal('slaughter')} style={btnStyle('#ea580c')}>Làm thịt</button>
        </div>
      )}

      <h3>Lịch sử thao tác</h3>
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

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 28, minWidth: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0 }}>
              {modal === 'weight' && 'Cập nhật cân'}
              {modal === 'sell' && 'Bán dê'}
              {modal === 'dead' && 'Ghi nhận dê chết'}
              {modal === 'slaughter' && 'Làm thịt dê'}
            </h3>
            {mError && <p style={{ color: 'red', marginBottom: 10 }}>{mError}</p>}

            {(modal === 'weight' || modal === 'sell' || modal === 'dead' || modal === 'slaughter') && (
              <ModalRow label={modal === 'weight' ? 'Cân nặng mới (kg) *' : 'Cân (kg)'}>
                <input type="number" step="0.1" min="0" value={mWeight} onChange={e => setMWeight(e.target.value)} style={inputStyle} />
              </ModalRow>
            )}

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
              <button onClick={closeModal} style={{ padding: '8px 16px', cursor: 'pointer' }}>Hủy</button>
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
