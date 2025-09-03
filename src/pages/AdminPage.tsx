import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDashboards } from '../contexts/DashboardContext';
import DashboardEditor from '../components/DashboardEditor';
import DashboardControls from '../components/DashboardControls';
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
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-main">
            <div className="header-title">
              <h1 className="page-title">
                <svg className="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Gerenciador de TVs
              </h1>
              <p className="page-subtitle">
                Controle centralizado para todas as suas TVs corporativas
              </p>
            </div>
            
            <div className="admin-info">
              {isEditingName ? (
                <form onSubmit={handleNameSubmit} className="name-edit-form">
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="input name-input"
                    placeholder="Nome do administrador"
                    autoFocus
                  />
                  <div className="name-actions">
                    <button type="submit" className="btn btn-success btn-sm">
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Salvar
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsEditingName(false)}
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="admin-name-display" onClick={() => setIsEditingName(true)}>
                  <div className="admin-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="admin-details">
                    <span className="admin-label">Administrador</span>
                    <span className="admin-name">{adminName}</span>
                  </div>
                  <button className="edit-name-btn" title="Editar nome">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="header-actions">
            <div className={`connection-status ${socketConnected ? 'connected' : 'disconnected'}`}>
              <div className="status-dot"></div>
              <span>{socketConnected ? 'Conectado ao servidor' : 'Desconectado do servidor'}</span>
            </div>
            
            {showTvLink && (
              <div className="tv-link-card">
                <div className="link-content">
                  <svg className="link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="link-text">
                    <span className="link-label">Abra a TV neste link:</span>
                    <Link to="/" target="_blank" className="tv-link">
                      Abrir TV
                    </Link>
                  </div>
                </div>
                <button 
                  className="close-link-btn"
                  onClick={() => setShowTvLink(false)}
                  title="Fechar"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Conteúdo principal */}
      <div className="admin-content">
        {/* Seção de TVs */}
        <section className="tvs-section">
          <div className="section-header">
            <h2 className="section-title">
              <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              TVs Conectadas
            </h2>
            <span className="section-info">
              {tvsList.length} TV{tvsList.length !== 1 ? 's' : ''} conectada{tvsList.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {tvsList.length === 0 ? (
            <div className="empty-tvs">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3>Nenhuma TV conectada</h3>
              <p>Abra uma nova janela com a URL da TV para estabelecer conexão</p>
              <Link to="/" target="_blank" className="btn btn-primary">
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Abrir TV
              </Link>
            </div>
          ) : (
            <div className="tvs-grid">
              <button 
                className={`tv-card ${!selectedTvId ? 'selected' : ''}`}
                onClick={handleSelectAllTvs}
              >
                <div className="tv-card-header">
                  <div className="tv-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="tv-status">
                    <div className="status-dot online"></div>
                    <span className="status-text">Online</span>
                  </div>
                </div>
                
                <div className="tv-card-body">
                  <h3 className="tv-name">Todas as TVs</h3>
                  <p className="tv-description">
                    Modo transmissão para {tvsList.length} TV{tvsList.length !== 1 ? 's' : ''}
                  </p>
                  <div className="tv-count">
                    <span className="count-number">{tvsList.length}</span>
                    <span className="count-label">conectada{tvsList.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </button>
              
              {tvsList.map(tv => (
                <button 
                  key={tv.id}
                  className={`tv-card ${selectedTvId === tv.id ? 'selected' : ''}`}
                  onClick={() => handleTvSelect(tv.id)}
                >
                  <div className="tv-card-header">
                    <div className="tv-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="tv-status">
                      <div className="status-dot online"></div>
                      <span className="status-text">Online</span>
                    </div>
                  </div>
                  
                  <div className="tv-card-body">
                    <h3 className="tv-name">{tv.name}</h3>
                    <p className="tv-description">
                      Dashboard: {tv.currentDashboardIndex + 1} • {tv.isPlaying ? 'Reproduzindo' : 'Pausado'}
                    </p>
                    <div className="tv-meta">
                      <span className="meta-item">
                        <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Dashboard {tv.currentDashboardIndex + 1}
                      </span>
                      <span className={`meta-item ${tv.isPlaying ? 'playing' : 'paused'}`}>
                        <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          {tv.isPlaying ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                        {tv.isPlaying ? 'Reproduzindo' : 'Pausado'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
        
        {/* Seção de controle/edição */}
        <section className="control-section">
          <div className="section-header">
            <div className="section-tabs">
              <button 
                className={`tab-button ${!isEditMode ? 'active' : ''}`}
                onClick={() => setIsEditMode(false)}
              >
                <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.234M2.239 7.188l2.234-.777M6.5 6.5l3.5 3.5M13.5 13.5l3.5 3.5" />
                </svg>
                Controle
              </button>
              <button 
                className={`tab-button ${isEditMode ? 'active' : ''}`}
                onClick={() => setIsEditMode(true)}
              >
                <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editor
              </button>
            </div>
            
            <div className="section-info">
              {selectedTvId ? (
                <div className="target-info">
                  <span className="target-label">Controle direcionado para:</span>
                  <span className="target-name">
                    {tvsList.find(tv => tv.id === selectedTvId)?.name}
                  </span>
                </div>
              ) : (
                <div className="target-info">
                  <span className="target-label">Modo transmissão:</span>
                  <span className="target-description">
                    Os comandos serão enviados para todas as TVs conectadas
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="section-content">
            {isEditMode ? <DashboardEditor /> : <DashboardControls showPreview={true} />}
          </div>
        </section>
      </div>
    </div>
  );
}