import { useDashboards } from '../contexts/DashboardContext';
import { detectContentType } from '../utils/youtubeUtils';
import YouTubePlayer from './YouTubePlayer';
import '../styles/DashboardControls.css';

interface DashboardControlsProps {
  showPreview?: boolean;
}

export default function DashboardControls({ showPreview = false }: DashboardControlsProps) {
  const { 
    dashboards,
    currentIndex,
    goToDashboard,
    nextDashboard,
    previousDashboard,
    isPlaying,
    setIsPlaying,
    currentDashboard
  } = useDashboards();
  
  return (
    <div className={`dashboard-controls ${showPreview ? 'with-preview' : ''}`}>
      {/* Header com informações atuais */}
      <div className="controls-header">
        <div className="current-dashboard-info">
          <h3 className="current-title">{currentDashboard?.title || 'Nenhum dashboard selecionado'}</h3>
          <div className="current-meta">
            <span className="dashboard-counter">
              {dashboards.length > 0 ? `${currentIndex + 1} de ${dashboards.length}` : '0 dashboards'}
            </span>
            <span className="duration-info">
              {currentDashboard ? `${currentDashboard.duration}s` : '0s'}
            </span>
          </div>
        </div>
        
        <div className="playback-status">
          <div className={`status-indicator ${isPlaying ? 'playing' : 'paused'}`}>
            <div className="status-dot"></div>
            <span>{isPlaying ? 'Reproduzindo' : 'Pausado'}</span>
          </div>
        </div>
      </div>

      {/* Controles principais */}
      <div className="controls-main">
        <div className="navigation-controls">
          <button 
            onClick={previousDashboard} 
            className="btn btn-secondary nav-btn"
            disabled={dashboards.length === 0}
            title="Dashboard anterior"
          >
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>
          
          <div className="dashboard-selector">
            <select 
              value={currentIndex}
              onChange={(e) => goToDashboard(Number(e.target.value))}
              className="input dashboard-select"
              disabled={dashboards.length === 0}
            >
              {dashboards.length === 0 ? (
                <option value="">Nenhum dashboard disponível</option>
              ) : (
                dashboards.map((dashboard, index) => (
                  <option key={dashboard.id} value={index}>
                    {dashboard.title}
                  </option>
                ))
              )}
            </select>
            <div className="select-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          <button 
            onClick={nextDashboard} 
            className="btn btn-secondary nav-btn"
            disabled={dashboards.length === 0}
            title="Próximo dashboard"
          >
            Próximo
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="playback-controls">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`btn btn-lg ${isPlaying ? 'btn-danger' : 'btn-success'} play-btn`}
            disabled={dashboards.length === 0}
            title={isPlaying ? 'Pausar rotação' : 'Iniciar rotação'}
          >
            {isPlaying ? (
              <>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Pausar
              </>
            ) : (
              <>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Iniciar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Informações detalhadas */}
      {currentDashboard && (
        <div className="dashboard-details">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Tipo:</span>
              <span className={`detail-value content-type ${currentDashboard.contentType || 'dashboard'}`}>
                {currentDashboard.contentType === 'youtube' ? (
                  <>
                    <svg className="type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                    </svg>
                    Vídeo do YouTube
                  </>
                ) : (
                  <>
                    <svg className="type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Dashboard
                  </>
                )}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">URL:</span>
              <span className="detail-value url-value" title={currentDashboard.url}>
                {currentDashboard.url}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Duração:</span>
              <span className="detail-value">{currentDashboard.duration} segundos</span>
            </div>
            {currentDashboard.contentType === 'youtube' && currentDashboard.youtubeVideoId && (
              <div className="detail-item">
                <span className="detail-label">Vídeo ID:</span>
                <span className="detail-value video-id">{currentDashboard.youtubeVideoId}</span>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className={`detail-value status-badge ${isPlaying ? 'status-playing' : 'status-paused'}`}>
                {isPlaying ? 'Em rotação' : 'Pausado'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Prévia do dashboard */}
      {showPreview && currentDashboard && (
        <div className="dashboard-preview">
          <div className="preview-header">
            <h4>Prévia do Dashboard</h4>
            <span className="preview-info">Visualização em tempo real</span>
          </div>
          <div className="preview-container">
            {/* Renderização condicional baseada no tipo de conteúdo */}
            {(() => {
              const contentType = currentDashboard.contentType || detectContentType(currentDashboard.url);
              
              if (contentType === 'youtube') {
                return (
                  <div className="youtube-preview">
                    <YouTubePlayer 
                      dashboard={currentDashboard} 
                      onError={() => {
                        console.log('Erro na prévia do YouTube');
                      }}
                    />
                  </div>
                );
              } else {
                return (
                  <iframe 
                    src={currentDashboard.url} 
                    title={`Prévia de ${currentDashboard.title}`}
                    className="preview-frame"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    allow="fullscreen"
                  />
                );
              }
            })()}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {dashboards.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
          <h3>Nenhum dashboard configurado</h3>
          <p>Adicione dashboards na aba Editor para começar a usar o sistema</p>
        </div>
      )}
    </div>
  );
}