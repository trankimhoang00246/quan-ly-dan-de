import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Goat, GENDER_LABEL, LABEL_LABEL, STATUS_LABEL, STATUS_COLOR } from '../types';

export default function GoatListPage() {
  const navigate = useNavigate();
  const [goats, setGoats] = useState<Goat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getGoats()
      .then(setGoats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = goats.filter(g => {
    const matchStatus = filterStatus === 'ALL' || g.status === filterStatus;
    const matchSearch = g.code.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const fmtMoney = (v: number | null) =>
    v != null ? v.toLocaleString('vi-VN') + ' đ' : '-';

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Tìm theo mã số..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '6px 10px', fontSize: 14, width: 200 }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '6px 10px', fontSize: 14 }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ALIVE">Đang sống</option>
          <option value="SOLD">Đã bán</option>
          <option value="DEAD">Đã chết</option>
          <option value="SLAUGHTERED">Đã làm thịt</option>
        </select>
        <span style={{ color: '#555' }}>
          Hiển thị {filtered.length}/{goats.length} con
        </span>
        <button onClick={() => navigate('/new')} style={{ marginLeft: 'auto', padding: '6px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>
          + Thêm dê mới
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={th}>Mã số</th>
            <th style={th}>Giới tính</th>
            <th style={th}>Nhãn</th>
            <th style={th}>Cân hiện tại</th>
            <th style={th}>Vốn</th>
            <th style={th}>Cha / Mẹ</th>
            <th style={th}>Trạng thái</th>
            <th style={th}>Ngày tạo</th>
            <th style={th}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={9} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                Không có dê nào
              </td>
            </tr>
          )}
          {filtered.map(goat => (
            <tr key={goat.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={td}>
                <strong>{goat.code}</strong>
              </td>
              <td style={td}>{GENDER_LABEL[goat.gender]}</td>
              <td style={td}>{LABEL_LABEL[goat.label]}</td>
              <td style={td}>{goat.currentWeight != null ? goat.currentWeight + ' kg' : '-'}</td>
              <td style={td}>{fmtMoney(goat.capital)}</td>
              <td style={td}>
                {goat.fatherCode || goat.motherCode
                  ? `${goat.fatherCode ?? '?'} / ${goat.motherCode ?? '?'}`
                  : '-'}
              </td>
              <td style={td}>
                <span style={{ color: STATUS_COLOR[goat.status], fontWeight: 600 }}>
                  {STATUS_LABEL[goat.status]}
                </span>
              </td>
              <td style={td}>{new Date(goat.createdAt).toLocaleDateString('vi-VN')}</td>
              <td style={td}>
                <button
                  onClick={() => navigate(`/goat/${goat.id}`)}
                  style={{ padding: '4px 12px', cursor: 'pointer', fontSize: 13 }}
                >
                  Xem
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
