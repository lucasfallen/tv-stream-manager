import { useDashboards } from '../contexts/DashboardContext';
import { Dashboard } from '../types/Dashboard';
import { detectContentType } from '../utils/youtubeUtils';
import YouTubePlayer from './YouTubePlayer';
import '../styles/DashboardControls.css';

interface DashboardControlsProps {
  showPreview?: boolean;
  tvDashboard?: Dashboard; // Dashboard que está sendo exibido na TV
  tvDashboardIndex?: number; // Índice do dashboard na TV
}

export default function DashboardControls({ showPreview = false, tvDashboard, tvDashboardIndex }: DashboardControlsProps) {
  const { 
    dashboards,
    currentIndex,
    goToDashboard,
    nextDashboard,
    previousDashboard,
    isPlaying,
    setIsPlaying,
    currentDashboard,
    selectedTvId,
    restoreTvState
  } = useDashboards();
  
  // Determinar qual dashboard mostrar na prévia
  const previewDashboard = tvDashboard || currentDashboard;
  
  // Determinar qual índice usar no seletor
  // Se uma TV está selecionada, usar o índice da TV, senão usar o currentIndex geral
  const selectedTvState = selectedTvId ? restoreTvState(selectedTvId) : null;
  const selectorIndex = selectedTvState ? selectedTvState.currentDashboardIndex : currentIndex;
  
  return (
    <div className={`dashboard-controls ${showPreview ? 'with-preview' : ''}`}>
      {/* Header com informações atuais */}
      <div className="controls-header">
        <div className="current-dashboard-info">
          <h3 className="current-title">
            {tvDashboard 
              ? `${tvDashboard.title} (TV)`
              : (currentDashboard?.title || 'Nenhum dashboard selecionado')
            }
          </h3>
          <div className="current-meta">
            <span className="dashboard-counter">
              {tvDashboard 
                ? `${(tvDashboardIndex || 0) + 1} de ${dashboards.length} (TV)`
                : (dashboards.length > 0 ? `${currentIndex + 1} de ${dashboards.length}` : '0 dashboards')
              }
            </span>
            <span className="duration-info">
              {previewDashboard ? `${previewDashboard.duration}s` : '0s'}
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
              value={selectorIndex}
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
            className={`btn ${isPlaying ? 'btn-warning' : 'btn-success'}`}
            title={isPlaying ? 'Pausar reprodução' : 'Iniciar reprodução'}
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
                Reproduzir
              </>
            )}
          </button>
        </div>
      </div>

      {/* Informações detalhadas */}
      {previewDashboard && (
        <div className="dashboard-details">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Tipo:</span>
              <span className={`detail-value content-type ${previewDashboard.contentType || 'dashboard'}`}>
                {previewDashboard.contentType === 'youtube' ? (
                  <>
                    <svg className="type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                    </svg>
                    Vídeo do YouTube
                  </>
                ) : (
                  <>
                    <svg className="type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 00-2 2v8a2 2 0 00-2-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Dashboard
                  </>
                )}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">URL:</span>
              <span className="detail-value url-value" title={previewDashboard.url}>
                {previewDashboard.url}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Duração:</span>
              <span className="detail-value">{previewDashboard.duration} segundos</span>
            </div>
            {previewDashboard.contentType === 'youtube' && previewDashboard.youtubeVideoId && (
              <div className="detail-item">
                <span className="detail-label">Vídeo ID:</span>
                <span className="detail-value video-id">{previewDashboard.youtubeVideoId}</span>
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
      {showPreview && previewDashboard && (
        <div className="dashboard-preview">
          <div className="preview-header">
            <h4>
              {tvDashboard ? 'Prévia da TV' : 'Prévia do Painel'}
            </h4>
            <span className="preview-info">
              {tvDashboard 
                ? `Visualização em tempo real - ${tvDashboard.title}`
                : `Visualização do painel - ${previewDashboard.title}`
              }
            </span>
          </div>
          <div className="preview-container">
            {/* Renderização condicional baseada no tipo de conteúdo */}
            {(() => {
              const contentType = previewDashboard.contentType || detectContentType(previewDashboard.url);
              
              if (contentType === 'youtube') {
                return (
                  <div className="youtube-preview">
                    <YouTubePlayer 
                      dashboard={previewDashboard} 
                      onError={() => {
                        console.log('Erro na prévia do YouTube');
                      }}
                      autoFullscreen={false} // Desabilitar fullscreen na prévia do admin
                    />
                  </div>
                );
              } else {
                return (
                  <iframe 
                    src={previewDashboard.url} 
                    title={`Prévia de ${previewDashboard.title}`}
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