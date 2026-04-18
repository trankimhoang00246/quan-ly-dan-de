import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import GoatListPage from './pages/GoatListPage';
import GoatDetailPage from './pages/GoatDetailPage';
import GoatFormPage from './pages/GoatFormPage';
import './App.css';

function Nav() {
  const loc = useLocation();
  return (
    <nav style={{ marginBottom: 24, padding: '12px 0', borderBottom: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 20 }}>
      <span style={{ fontWeight: 700, fontSize: 18 }}>Quản Lý Đàn Dê</span>
      <Link to="/" style={{ color: loc.pathname === '/' ? '#16a34a' : '#374151', textDecoration: 'none', fontWeight: loc.pathname === '/' ? 600 : 400 }}>
        Danh sách
      </Link>
      <Link to="/new" style={{ color: loc.pathname === '/new' ? '#16a34a' : '#374151', textDecoration: 'none', fontWeight: loc.pathname === '/new' ? 600 : 400 }}>
        Thêm mới
      </Link>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', fontFamily: 'Arial, sans-serif' }}>
        <Nav />
        <Routes>
          <Route path="/" element={<GoatListPage />} />
          <Route path="/new" element={<GoatFormPage />} />
          <Route path="/goat/:id" element={<GoatDetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
