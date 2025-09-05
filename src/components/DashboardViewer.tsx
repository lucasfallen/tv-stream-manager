import { useEffect, useRef, useState } from 'react';
import { useDashboards } from '../contexts/DashboardContext';
import { detectContentType } from '../utils/youtubeUtils';
import YouTubePlayer from './YouTubePlayer';
import '../styles/DashboardViewer.css';

export default function DashboardViewer() {
  const { 
    currentDashboard, 
    nextDashboard, 
    isPlaying 
  } = useDashboards();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [iframeError, setIframeError] = useState<boolean>(false);
  
  // Ativar modo de tela cheia quando componente montar
  useEffect(() => {
    const requestFullScreen = () => {
      try {
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) { /* Safari */
          (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).msRequestFullscreen) { /* IE11 */
          (elem as any).msRequestFullscreen();
        }
      } catch (error) {
        console.log('Tela cheia não disponível:', error);
      }
    };
    
    // Verificar se é um vídeo do YouTube
    const isYouTubeVideo = currentDashboard?.contentType === 'youtube' && currentDashboard?.youtubeVideoId;
    
    if (isYouTubeVideo) {
      // Para vídeos do YouTube, ativar fullscreen automaticamente após um pequeno delay
      const autoFullscreenTimer = setTimeout(() => {
        requestFullScreen();
      }, 1000); // Delay de 1 segundo para garantir que o vídeo carregou
      
      return () => clearTimeout(autoFullscreenTimer);
    } else {
      // Para dashboards normais, ativar fullscreen apenas após interação do usuário
      const handleFirstInteraction = () => {
        requestFullScreen();
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      };
      
      document.addEventListener('click', handleFirstInteraction);
      document.addEventListener('keydown', handleFirstInteraction);
      
      return () => {
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      };
    }
  }, [currentDashboard]);
  
  useEffect(() => {
    // Resetar o estado de erro quando mudar de dashboard
    setIframeError(false);
    
    // Limpeza do timer anterior
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Configura o novo timer se isPlaying for true
    if (isPlaying && currentDashboard) {
      timerRef.current = setTimeout(() => {
        nextDashboard();
      }, currentDashboard.duration * 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentDashboard, nextDashboard, isPlaying]);
  
  if (!currentDashboard) {
    return (
      <div className="dashboard-viewer-empty">
        <div className="empty-content">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
          <h2 className="empty-title">Nenhum dashboard configurado</h2>
          <p className="empty-description">
            Acesse a área administrativa para configurar seus dashboards
          </p>
          <a 
            href="/admin" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary"
          >
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ir para área administrativa
          </a>
        </div>
      </div>
    );
  }

  // Detectar o tipo de conteúdo baseado na URL
  const contentType = currentDashboard.contentType || detectContentType(currentDashboard.url);
  
  // Se for um vídeo do YouTube, usar o YouTubePlayer
  if (contentType === 'youtube') {
    return (
      <div className="dashboard-viewer">
        <YouTubePlayer 
          dashboard={currentDashboard} 
          onError={() => setIframeError(true)}
        />
      </div>
    );
  }
  
  const handleIframeError = () => {
    setIframeError(true);
  };
  
  return (
    <div className="dashboard-viewer">
      {iframeError ? (
        <div className="iframe-error-state">
          <div className="error-content">
            <div className="error-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="error-title">Não foi possível carregar o dashboard</h3>
            <div className="error-details">
              <div className="detail-item">
                <span className="detail-label">URL:</span>
                <span className="detail-value url-value">{currentDashboard.url}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Título:</span>
                <span className="detail-value">{currentDashboard.title}</span>
              </div>
            </div>
            <p className="error-description">
              Verifique se a URL está correta e acessível
            </p>
            <a 
              href="/admin" 
              className="btn btn-secondary"
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ir para área administrativa
            </a>
          </div>
        </div>
      ) : (
        <>
          <iframe 
            src={currentDashboard.url} 
            title={currentDashboard.title} 
            className="dashboard-frame"
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            allow="fullscreen"
          />
          
          <div className="dashboard-info-overlay">
            <div className="overlay-content">
              <div className="dashboard-title">
                <svg className="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="title-text">{currentDashboard.title}</span>
              </div>
              
              {isPlaying && (
                <div className="playback-info">
                  <div className="playback-status">
                    <div className="status-dot playing"></div>
                    <span className="status-text">Reproduzindo</span>
                  </div>
                  <div className="next-indicator">
                    <svg className="indicator-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="indicator-text">
                      Próximo em {currentDashboard.duration}s
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}