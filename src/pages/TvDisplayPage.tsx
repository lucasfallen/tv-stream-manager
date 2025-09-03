import { useEffect, useState } from 'react';
import DashboardViewer from '../components/DashboardViewer';
import { useDashboards } from '../contexts/DashboardContext';
import '../styles/TvDisplayPage.css';

const TvDisplayPage = () => {
  const { 
    dashboards, 
    socketConnected,
    connectSocket
  } = useDashboards();
  const [tvName, setTvName] = useState<string>('');
  const [showNameForm, setShowNameForm] = useState<boolean>(true);

  useEffect(() => {
    const savedTvName = localStorage.getItem('tvName');
    if (savedTvName) {
      setTvName(savedTvName);
      setShowNameForm(false);
      connectSocket('tv', savedTvName);
    }
  }, [connectSocket]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tvName.trim()) {
      localStorage.setItem('tvName', tvName);
      setShowNameForm(false);
      connectSocket('tv', tvName);
    }
  };

  if (showNameForm) {
    return (
      <div className="tv-setup-page">
        <div className="setup-container">
          <div className="setup-header">
            <div className="setup-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="setup-title">Identificação da TV</h1>
            <p className="setup-subtitle">
              Digite um nome para identificar esta TV no painel de controle administrativo
            </p>
          </div>
          
          <form onSubmit={handleNameSubmit} className="setup-form">
            <div className="form-field">
              <label htmlFor="tv-name" className="form-label">
                <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Nome da TV
              </label>
              <input
                id="tv-name"
                type="text"
                value={tvName}
                onChange={(e) => setTvName(e.target.value)}
                placeholder="Ex: TV Sala de Reuniões"
                className="input name-input"
                autoFocus
                required
              />
              <p className="input-help">
                Este nome será exibido no painel administrativo para identificação
              </p>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-lg setup-button"
              disabled={!tvName.trim()}
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirmar e Conectar
            </button>
          </form>
          
          <div className="setup-footer">
            <div className="connection-info">
              <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="info-text">
                A TV será conectada automaticamente ao servidor após a identificação
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tv-display-page">
      {dashboards.length === 0 ? (
        <div className="tv-waiting-state">
          <div className="waiting-content">
            <div className="waiting-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="waiting-title">Aguardando conteúdo</h2>
            <p className="waiting-description">
              Configure dashboards no painel de administração para começar a exibição
            </p>
            
            <div className="connection-status-display">
              <div className={`status-indicator ${socketConnected ? 'connected' : 'disconnected'}`}>
                <div className="status-dot"></div>
                <span className="status-text">
                  {socketConnected ? 'Conectado ao servidor' : 'Desconectado do servidor'}
                </span>
              </div>
              
              <div className="tv-info">
                <span className="tv-name-display">{tvName}</span>
                <span className="tv-type">TV</span>
              </div>
            </div>
            
            <div className="waiting-actions">
              <a 
                href="/admin" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Abrir Painel Administrativo
              </a>
            </div>
          </div>
        </div>
      ) : (
        <DashboardViewer />
      )}
    </div>
  );
};

export default TvDisplayPage;