import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDashboards } from '../contexts/DashboardContext';
import DashboardEditor from '../components/DashboardEditor';
import DashboardControls from '../components/DashboardControls';
import socketService from '../services/SocketService';
import '../styles/AdminPage.css';

export default function AdminPage() {
  const { 
    isEditMode, 
    setIsEditMode, 
    tvsList, 
    selectedTvId, 
    setSelectedTvId, 
    renameClient,
    socketConnected
  } = useDashboards();
  
  const [showTvLink, setShowTvLink] = useState(true);
  const [adminName, setAdminName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  
  // Inicializar nome do admin
  useEffect(() => {
    const savedName = localStorage.getItem('adminName');
    if (savedName) {
      setAdminName(savedName);
      renameClient(savedName);
    } else {
      const defaultName = `Admin-${Math.random().toString(36).substring(2, 6)}`;
      setAdminName(defaultName);
      localStorage.setItem('adminName', defaultName);
      renameClient(defaultName);
    }
  }, [renameClient]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminName.trim()) {
      localStorage.setItem('adminName', adminName);
      renameClient(adminName);
      setIsEditingName(false);
    }
  };

  const handleTvSelect = (tvId: string) => {
    setSelectedTvId(tvId);
  };

  const handleSelectAllTvs = () => {
    setSelectedTvId(null);
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="header-left">
          <h1>Gerenciador de TVs</h1>
          
          <div className="admin-name-container">
            {isEditingName ? (
              <form onSubmit={handleNameSubmit} className="admin-name-form">
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  autoFocus
                />
                <button type="submit">Salvar</button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setIsEditingName(false)}
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <div className="admin-name" onClick={() => setIsEditingName(true)}>
                <span>Admin: <span className="name">{adminName}</span></span>
                <span className="edit-icon">✏️</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="header-actions">
          <div className={`socket-status ${socketConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            <span>{socketConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
          
          {showTvLink && (
            <div className="tv-link-container">
              <p>Abra a TV neste link: <Link to="/" target="_blank">Abrir TV</Link></p>
              <button 
                className="dismiss-btn" 
                onClick={() => setShowTvLink(false)}
                title="Fechar"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </header>
      
      <div className="admin-content">
        <section className="tvs-selection-container">
          <h2>TVs Conectadas</h2>
          {tvsList.length > 0 ? (
            <div className="tvs-list">
              <button 
                className={`tv-item ${!selectedTvId ? 'selected' : ''}`}
                onClick={handleSelectAllTvs}
              >
                <div className="tv-info">
                  <span className="tv-name">Todas as TVs</span>
                  <span className="tv-status">Modo transmissão para {tvsList.length} TVs</span>
                </div>
                <div className="connection-status">
                  <div className="status-dot"></div>
                  <span>{tvsList.length} conectadas</span>
                </div>
              </button>
              
              {tvsList.map(tv => (
                <button 
                  key={tv.id}
                  className={`tv-item ${selectedTvId === tv.id ? 'selected' : ''}`}
                  onClick={() => handleTvSelect(tv.id)}
                >
                  <div className="tv-info">
                    <span className="tv-name">{tv.name}</span>
                    <span className="tv-status">
                      Dashboard: {tv.currentDashboardIndex + 1} • 
                      {tv.isPlaying ? ' Reproduzindo' : ' Pausado'}
                    </span>
                  </div>
                  <div className="connection-status">
                    <div className="status-dot"></div>
                    <span>Online</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="no-tvs">
              Nenhuma TV conectada. Abra uma nova janela com a URL da TV.
            </div>
          )}
        </section>
        
        <section className="admin-panel">
          <div className="mode-switcher">
            <button 
              className={`mode-btn ${!isEditMode ? 'active' : ''}`}
              onClick={() => setIsEditMode(false)}
            >
              Controle
            </button>
            <button 
              className={`mode-btn ${isEditMode ? 'active' : ''}`}
              onClick={() => setIsEditMode(true)}
            >
              Editor
            </button>
          </div>
          
          {selectedTvId ? (
            <div className="targeting-message">
              Controle direcionado para: <strong>{tvsList.find(tv => tv.id === selectedTvId)?.name}</strong>
            </div>
          ) : (
            <div className="broadcast-message">
              Modo transmissão: os comandos serão enviados para todas as TVs conectadas.
            </div>
          )}
          
          {isEditMode ? (
            <DashboardEditor />
          ) : (
            <DashboardControls showPreview={true} />
          )}
        </section>
      </div>
    </div>
  );
} 