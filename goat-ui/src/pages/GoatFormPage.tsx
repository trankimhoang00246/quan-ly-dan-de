import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function GoatFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: '',
    gender: 'MALE',
    label: 'BUON',
    currentWeight: '',
    capital: '',
    fatherCode: '',
    motherCode: '',
    note: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const hasParen = form.fatherCode.trim() || form.motherCode.trim();

  const set = (k: string, v: string) => {
    setForm(f => {
      const next = { ...f, [k]: v };
      if ((k === 'fatherCode' || k === 'motherCode') && (next.fatherCode.trim() || next.motherCode.trim())) {
        next.capital = '0';
      }
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
        code: form.code.trim(),
        gender: form.gender,
        label: form.label,
        currentWeight: form.currentWeight ? Number(form.currentWeight) : null,
        capital: form.capital ? Number(form.capital) : 0,
        fatherCode: form.fatherCode.trim() || null,
        motherCode: form.motherCode.trim() || null,
        note: form.note.trim() || null,
      });
      navigate(`/goat/${goat.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 style={{ marginBottom: 20 }}>Thêm dê mới</h2>
      {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <Row label="Mã số *">
          <input
            value={form.code}
            onChange={e => set('code', e.target.value)}
            style={inputStyle}
            placeholder="VD: D001"
          />
        </Row>

        <Row label="Giới tính">
          <label style={{ marginRight: 20 }}>
            <input type="radio" checked={form.gender === 'MALE'} onChange={() => set('gender', 'MALE')} /> Đực
          </label>
          <label>
            <input type="radio" checked={form.gender === 'FEMALE'} onChange={() => set('gender', 'FEMALE')} /> Cái
          </label>
        </Row>

        <Row label="Nhãn">
          <label style={{ marginRight: 20 }}>
            <input type="radio" checked={form.label === 'BUON'} onChange={() => set('label', 'BUON')} /> Buôn
          </label>
          <label>
            <input type="radio" checked={form.label === 'GIONG'} onChange={() => set('label', 'GIONG')} /> Giống
          </label>
        </Row>

        <Row label="Cân hiện tại (kg)">
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.currentWeight}
            onChange={e => set('currentWeight', e.target.value)}
            style={inputStyle}
            placeholder="kg"
          />
        </Row>

        <Row label="Cha (mã số)">
          <input
            value={form.fatherCode}
            onChange={e => set('fatherCode', e.target.value)}
            style={inputStyle}
            placeholder="Mã số dê cha (nếu có)"
          />
        </Row>

        <Row label="Mẹ (mã số)">
          <input
            value={form.motherCode}
            onChange={e => set('motherCode', e.target.value)}
            style={inputStyle}
            placeholder="Mã số dê mẹ (nếu có)"
          />
        </Row>

        <Row label="Vốn (đ)">
          <input
            type="number"
            min="0"
            value={form.capital}
            onChange={e => set('capital', e.target.value)}
            style={inputStyle}
            placeholder="0"
            readOnly={!!hasParen}
          />
          {hasParen && <span style={{ marginLeft: 8, color: '#888', fontSize: 13 }}>(đẻ ra = 0đ)</span>}
        </Row>

        <Row label="Ghi chú">
          <textarea
            value={form.note}
            onChange={e => set('note', e.target.value)}
            style={{ ...inputStyle, height: 70, resize: 'vertical' }}
          />
        </Row>

        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button type="submit" disabled={saving} style={{ padding: '8px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button type="button" onClick={() => navigate('/')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
      <label style={{ width: 140, fontWeight: 500, fontSize: 14 }}>{label}</label>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 10px',
  fontSize: 14,
  boxSizing: 'border-box',
};
