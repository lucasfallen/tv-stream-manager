import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardProvider } from './contexts/DashboardContext';
import TvDisplayPage from './pages/TvDisplayPage';
import AdminPage from './pages/AdminPage';
import './App.css';

/**
 * Componente principal da aplicação
 */
function App() {
  return (
    <DashboardProvider>
      <BrowserRouter>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<TvDisplayPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </DashboardProvider>
  );
}

export default App;
