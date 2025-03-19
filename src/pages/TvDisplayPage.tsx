import { useEffect, useState } from 'react';
import '../styles/TvDisplayPage.css';
import DashboardViewer from '../components/DashboardViewer';
import { useDashboards } from '../contexts/DashboardContext';

const TvDisplayPage = () => {
  const { 
    dashboards, 
    currentIndex,
    socketConnected,
    connectSocket
  } = useDashboards();
  const [tvName, setTvName] = useState<string>('');
  const [showNameForm, setShowNameForm] = useState<boolean>(true);

  useEffect(() => {
    // Carregar nome da TV do localStorage, se existir
    const savedTvName = localStorage.getItem('tvName');
    if (savedTvName) {
      setTvName(savedTvName);
      setShowNameForm(false);
      // Conectar como cliente de TV com o nome salvo
      connectSocket('tv', savedTvName);
    }
  }, [connectSocket]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tvName.trim()) {
      localStorage.setItem('tvName', tvName);
      setShowNameForm(false);
      // Conectar como cliente de TV com o nome fornecido
      connectSocket('tv', tvName);
    }
  };

  if (showNameForm) {
    return (
      <div className="tv-name-form-container">
        <div className="tv-name-form-card">
          <h2>Identificação da TV</h2>
          <p>Digite um nome para identificar esta TV no painel de controle</p>
          <form onSubmit={handleNameSubmit}>
            <input
              type="text"
              value={tvName}
              onChange={(e) => setTvName(e.target.value)}
              placeholder="Ex: TV Sala de Reuniões"
              autoFocus
            />
            <button type="submit">Confirmar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="tv-display-container">
      {dashboards.length === 0 ? (
        <div className="no-dashboards-message">
          <h2>Aguardando conteúdo</h2>
          <p>Configure dashboards no painel de administração.</p>
          <div className={`connection-status ${socketConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            <span>{socketConnected ? 'Conectado ao servidor' : 'Desconectado do servidor'}</span>
          </div>
        </div>
      ) : (
        <DashboardViewer />
      )}
    </div>
  );
};

export default TvDisplayPage; 