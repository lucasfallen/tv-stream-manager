import { Routes, Route, Navigate } from 'react-router-dom';
import TvDisplayPage from '../pages/TvDisplayPage';
import AdminPage from '../pages/AdminPage';

// Componente para rotas privadas
function PrivateRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = true; // Substituir pela lógica real de autenticação
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TvDisplayPage />} />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
