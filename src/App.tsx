import { BrowserRouter } from 'react-router-dom';
import { DashboardProvider } from './contexts/DashboardContext';
import AppRoutes from './routes';
import './App.css';

/**
 * Componente principal da aplicação
 */
function App() {
  return (
    <DashboardProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="app-container">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </DashboardProvider>
  );
}

export default App;
