import { useEffect, useRef, useState } from 'react';
import { Dashboard } from '../types/Dashboard';
import { generateYouTubeEmbedUrl } from '../utils/youtubeUtils';
import '../styles/YouTubePlayer.css';

interface YouTubePlayerProps {
  dashboard: Dashboard;
  onError?: () => void;
}

export default function YouTubePlayer({ dashboard, onError }: YouTubePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Gera a URL de embed do YouTube com os parâmetros configurados
  const embedUrl = generateYouTubeEmbedUrl(
    dashboard.youtubeVideoId || '',
    {
      startTime: dashboard.youtubeStartTime,
      endTime: dashboard.youtubeEndTime,
      autoplay: dashboard.youtubeAutoplay ?? true,
      mute: dashboard.youtubeMute ?? true
    }
  );

  useEffect(() => {
    // Resetar estados quando mudar o dashboard
    setIsLoaded(false);
    setLoadError(false);
  }, [dashboard.id]);

  const handleLoad = () => {
    setIsLoaded(true);
    setLoadError(false);
  };

  const handleError = () => {
    setLoadError(true);
    onError?.();
  };

  // Se não tiver videoId, mostrar erro
  if (!dashboard.youtubeVideoId) {
    return (
      <div className="youtube-player-error">
        <div className="error-content">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="error-title">Vídeo do YouTube não encontrado</h3>
          <p className="error-description">
            O ID do vídeo não foi configurado corretamente
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="youtube-player">
      {!isLoaded && !loadError && (
        <div className="youtube-loading">
          <div className="loading-spinner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <p className="loading-text">Carregando vídeo...</p>
        </div>
      )}

      {loadError && (
        <div className="youtube-error">
          <div className="error-content">
            <div className="error-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="error-title">Erro ao carregar vídeo</h3>
            <p className="error-description">
              Não foi possível carregar o vídeo do YouTube
            </p>
            <button 
              onClick={() => {
                setIsLoaded(false);
                setLoadError(false);
                // Recarregar o iframe
                if (iframeRef.current) {
                  iframeRef.current.src = iframeRef.current.src;
                }
              }}
              className="btn btn-primary"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={dashboard.title}
        className="youtube-iframe"
        onLoad={handleLoad}
        onError={handleError}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ display: isLoaded && !loadError ? 'block' : 'none' }}
      />

      {/* Overlay de informações do vídeo */}
      <div className="youtube-info-overlay">
        <div className="overlay-content">
          <div className="video-title">
            <svg className="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="title-text">{dashboard.title}</span>
          </div>

          {/* Informações específicas do YouTube */}
          <div className="youtube-meta">
            {dashboard.youtubeStartTime && (
              <div className="meta-item">
                <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="meta-label">Início:</span>
                <span className="meta-value">{formatTime(dashboard.youtubeStartTime)}</span>
              </div>
            )}

            {dashboard.youtubeEndTime && (
              <div className="meta-item">
                <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="meta-label">Fim:</span>
                <span className="meta-value">{formatTime(dashboard.youtubeEndTime)}</span>
              </div>
            )}

            <div className="meta-item">
              <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="meta-label">YouTube</span>
              <span className="meta-value">Vídeo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Formata tempo em segundos para formato legível (ex: 1m 30s)
 */
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
