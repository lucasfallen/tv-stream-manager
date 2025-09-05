import { useState, useEffect } from 'react';
import { useDashboards } from '../contexts/DashboardContext';
import DashboardControls from '../components/DashboardControls';
import DashboardEditor from '../components/DashboardEditor';
import DeviceEditor from '../components/DeviceEditor';
import { Device, DeviceType } from '../types/Device';
import '../styles/AdminPage.css';

export default function AdminPage() {
  const { 
    tvsList, 
    selectedTvId, 
    setSelectedTvId, 
    socketConnected,
    restoreTvState,
    dashboards
  } = useDashboards();
  
  const [activeTab, setActiveTab] = useState<'control' | 'editor'>('control');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDeviceEditorOpen, setIsDeviceEditorOpen] = useState(false);

  useEffect(() => {
    // Auto-select first TV if none selected
    if (!selectedTvId && tvsList.length > 0) {
      setSelectedTvId(tvsList[0].id);
    }
  }, [tvsList, selectedTvId, setSelectedTvId]);

  // Função para restaurar o estado de uma TV quando selecionada
  const handleTvSelection = (tvId: string) => {
    setSelectedTvId(tvId);
    
    // Restaurar o estado da TV do cache
    const tvState = restoreTvState(tvId);
    
    if (tvState) {
      console.log(`🔄 Estado restaurado para TV ${tvId}:`, tvState);
      console.log(`📺 Dashboard: ${tvState.currentDashboardIndex + 1}, Status: ${tvState.isPlaying ? 'Reproduzindo' : 'Pausado'}`);
    }
  };


  const selectedTv = tvsList.find(tv => tv.id === selectedTvId);
  
  // Obter o estado atual da TV selecionada
  const selectedTvState = selectedTvId ? restoreTvState(selectedTvId) : null;

  // Função para salvar alterações do dispositivo
  const handleDeviceSave = (deviceId: string, data: any) => {
    console.log('Salvando alterações do dispositivo:', deviceId, data);
    // TODO: Implementar salvamento no servidor
    // Por enquanto, apenas fecha o editor
    setIsDeviceEditorOpen(false);
  };

  // Converter TvClient para Device para o editor
  const selectedDevice: Device | null = selectedTv ? {
    id: selectedTv.id,
    name: selectedTv.name,
    type: 'tv' as DeviceType, // Por enquanto, assumir que é TV
    specs: {
      screenSize: '',
      resolution: '',
      operatingSystem: '',
      browser: '',
      processor: '',
      memory: '',
      storage: '',
      network: ''
    },
    notes: '',
    currentDashboardIndex: selectedTv.currentDashboardIndex,
    isPlaying: selectedTv.isPlaying,
    isConnected: selectedTv.isConnected,
    totalDashboards: selectedTv.totalDashboards
  } : null;
  
  // Obter o dashboard que está sendo exibido na TV selecionada
  const tvDashboard = selectedTvState && dashboards[selectedTvState.currentDashboardIndex] 
    ? dashboards[selectedTvState.currentDashboardIndex] 
    : null;

  return (
    <div className="layout-dashboard">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="brand-text">TV Stream Manager</span>
        </div>

        <div className="header-actions">
          {/* Status de conexão */}
          <div className={`status-indicator ${socketConnected ? 'online' : 'offline'}`}>
            <div className="status-dot"></div>
            <span className="hidden sm:inline">
              {socketConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>



          {/* Botão de toggle da sidebar */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="btn btn-ghost btn-sm sidebar-toggle"
            title={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`app-sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        <div className="sidebar-header">
          <h3 className="sidebar-title">Navegação</h3>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Controle</div>
            <div 
              className={`nav-item ${activeTab === 'control' ? 'active' : ''}`}
              onClick={() => setActiveTab('control')}
            >
              <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
              </svg>
              {!sidebarCollapsed && <span className="nav-item-text">Controle</span>}
            </div>
            <div 
              className={`nav-item ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {!sidebarCollapsed && <span className="nav-item-text">Editor</span>}
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">TVs Conectadas</div>
            {tvsList.length === 0 ? (
              <div className="empty-tvs">
                <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                </svg>
                {!sidebarCollapsed && (
                  <div className="empty-text">
                    <p>Nenhuma TV conectada</p>
                  </div>
                )}
              </div>
            ) : (
              tvsList.map(tv => (
                <div 
                  key={tv.id}
                  className={`nav-item tv-item ${selectedTvId === tv.id ? 'active' : ''}`}
                  onClick={() => handleTvSelection(tv.id)}
                >
                  <div className="tv-status-indicator">
                    <div className={`status-dot ${tv.isConnected ? 'online' : 'offline'}`}></div>
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <span className="nav-item-text">{tv.name}</span>
                      <span className="tv-count">
                        {tv.currentDashboardIndex + 1}/{tv.totalDashboards || 0}
                      </span>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Configurações</div>
            <div className="nav-item">
              <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {!sidebarCollapsed && <span className="nav-item-text">Configurações</span>}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="app-main">
        <div className="main-header">
          <h1 className="main-title">
            {activeTab === 'control' ? 'Controle de TVs' : 'Editor de Dashboards'}
          </h1>
          <p className="main-subtitle">
            {activeTab === 'control' 
              ? 'Gerencie e controle suas TVs em tempo real'
              : 'Crie e edite dashboards para exibição nas TVs'
            }
          </p>
        </div>

        <div className="main-content">
          {activeTab === 'control' ? (
            <div className="control-tab">
              {/* Informações da TV selecionada */}
              {selectedTv && (
                <div className="selected-tv-info card">
                  <div className="card-header">
                    <div className="tv-info-header">
                      <div className="tv-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="tv-details">
                        <h3 className="tv-name">{selectedTv.name}</h3>
                        <div className="tv-meta">
                          <span className={`status-badge ${selectedTv.isConnected ? 'success' : 'error'}`}>
                            {selectedTv.isConnected ? 'Conectado' : 'Desconectado'}
                          </span>
                          <span className="tv-dashboard-info">
                            Dashboard {selectedTv.currentDashboardIndex + 1} de {selectedTv.totalDashboards || 0}
                          </span>
                          {selectedTvState && (
                            <span className={`playback-status ${selectedTvState.isPlaying ? 'playing' : 'paused'}`}>
                              {selectedTvState.isPlaying ? '▶️ Reproduzindo' : '⏸️ Pausado'}
                            </span>
                          )}
                        </div>
                        <div className="device-info">
                          <span className="device-type">📺 TV</span>
                          <span className="device-id">ID: {selectedTv.id.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                    <div className="tv-actions">
                      <button 
                        onClick={() => setIsDeviceEditorOpen(true)}
                        className="btn btn-secondary"
                        title="Editar dispositivo"
                      >
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button 
                        onClick={() => setShowPreview(!showPreview)}
                        className={`btn ${showPreview ? 'btn-secondary' : 'btn-primary'}`}
                      >
                        {showPreview ? 'Ocultar Prévia' : 'Mostrar Prévia'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Controles do Dashboard */}
              <div className="dashboard-controls-section">
                <DashboardControls 
                  showPreview={showPreview} 
                  tvDashboard={tvDashboard || undefined}
                  tvDashboardIndex={selectedTvState?.currentDashboardIndex}
                />
              </div>
            </div>
          ) : (
            <div className="editor-tab">
              <DashboardEditor />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-left">
          <span>© 2024 TV Stream Manager. Todos os direitos reservados.</span>
        </div>
        <div className="footer-right">
          <span className="version-info">v1.0.0</span>
        </div>
      </footer>

      {/* Overlay para sidebar mobile */}
      {window.innerWidth <= 1024 && (
        <div 
          className={`sidebar-overlay ${!sidebarCollapsed ? 'open' : ''}`}
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Editor de Dispositivo */}
      {selectedDevice && (
        <DeviceEditor
          device={selectedDevice}
          isOpen={isDeviceEditorOpen}
          onClose={() => setIsDeviceEditorOpen(false)}
          onSave={handleDeviceSave}
        />
      )}
    </div>
  );
}