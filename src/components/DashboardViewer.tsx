import { useEffect, useRef, useState } from 'react';
import { useDashboards } from '../contexts/DashboardContext';
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
    
    // Tentar ativar tela cheia após interação do usuário
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
  }, []);
  
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
      <div className="empty-state">
        <div className="empty-message">
          <h2>Nenhum dashboard configurado</h2>
          <p>Acesse a <a href="/admin" target="_blank" rel="noopener noreferrer">área administrativa</a> para configurar seus dashboards.</p>
        </div>
      </div>
    );
  }
  
  const handleIframeError = () => {
    setIframeError(true);
  };
  
  return (
    <div className="dashboard-viewer">
      {iframeError ? (
        <div className="iframe-error">
          <h3>Não foi possível carregar o dashboard</h3>
          <p>URL: {currentDashboard.url}</p>
          <p>Verifique se a URL está correta e acessível</p>
          <a href="/admin" className="admin-link">Ir para área administrativa</a>
        </div>
      ) : (
        <iframe 
          src={currentDashboard.url} 
          title={currentDashboard.title} 
          className="dashboard-frame"
          onError={handleIframeError}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          allow="fullscreen"
        />
      )}
      
      <div className="dashboard-info-overlay">
        <p className="current-title">{currentDashboard.title}</p>
        {isPlaying && <p className="next-indicator">Próximo em {currentDashboard.duration}s</p>}
      </div>
    </div>
  );
}