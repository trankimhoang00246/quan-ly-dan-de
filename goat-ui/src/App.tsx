import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GoatListPage from './pages/GoatListPage';
import './App.css';

function Nav() {
  return (
    <nav style={{ marginBottom: 24, padding: '12px 0', borderBottom: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 20 }}>
      <span style={{ fontWeight: 700, fontSize: 18 }}>Quản Lý Đàn Dê</span>
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
        </Routes>
      </div>
    </BrowserRouter>
  );
}
