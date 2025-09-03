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

  // Função para ativar fullscreen do YouTube
  const activateYouTubeFullscreen = () => {
    console.log('🎬 INICIANDO FULLSCREEN AUTOMÁTICO MULTI-ESTRATÉGIA');
    
    // ESTRATÉGIA 1: Simular tecla F na página principal
    setTimeout(() => {
      try {
        console.log('🎯 ESTRATÉGIA 1: Simulando tecla F na página principal...');
        
        // Simular o pressionamento da tecla F
        const fKeyEvent = new KeyboardEvent('keydown', {
          key: 'f',
          code: 'KeyF',
          keyCode: 70,
          which: 70,
          bubbles: true,
          cancelable: true,
          view: window
        });
        
        // Disparar o evento de tecla
        document.dispatchEvent(fKeyEvent);
        console.log('✅ Tecla F simulada na página principal!');
        
      } catch (error) {
        console.log('❌ Erro ao simular tecla F na página:', error);
      }
    }, 2000); // 2 segundos
    
    // ESTRATÉGIA 2: Simular tecla F no iframe
    setTimeout(() => {
      try {
        console.log('🎯 ESTRATÉGIA 2: Simulando tecla F no iframe...');
        
        if (iframeRef.current) {
          const iframe = iframeRef.current;
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          
          if (iframeDoc) {
            const fKeyEvent = new KeyboardEvent('keydown', {
              key: 'f',
              code: 'KeyF',
              keyCode: 70,
              which: 70,
              bubbles: true,
              cancelable: true,
              view: iframe.contentWindow || window
            });
            
            iframeDoc.dispatchEvent(fKeyEvent);
            console.log('✅ Tecla F simulada no iframe!');
          }
        }
        
      } catch (error) {
        console.log('❌ Erro ao simular tecla F no iframe:', error);
      }
    }, 3000); // 3 segundos
    
    // ESTRATÉGIA 3: Fullscreen da página via API
    setTimeout(() => {
      try {
        console.log('🎯 ESTRATÉGIA 3: Ativando fullscreen da página via API...');
        
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
          console.log('✅ Fullscreen da página ativado via API!');
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          (document.documentElement as any).webkitRequestFullscreen();
          console.log('✅ Fullscreen da página ativado via webkit!');
        } else if ((document.documentElement as any).msRequestFullscreen) {
          (document.documentElement as any).msRequestFullscreen();
          console.log('✅ Fullscreen da página ativado via ms!');
        }
        
      } catch (error) {
        console.log('❌ Erro ao ativar fullscreen da página:', error);
      }
    }, 4000); // 4 segundos
    
    // ESTRATÉGIA 4: Fullscreen do iframe via API
    setTimeout(() => {
      try {
        console.log('🎯 ESTRATÉGIA 4: Ativando fullscreen do iframe via API...');
        
        if (iframeRef.current) {
          const iframe = iframeRef.current;
          
          if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
            console.log('✅ Fullscreen do iframe ativado via API!');
          } else if ((iframe as any).webkitRequestFullscreen) {
            (iframe as any).webkitRequestFullscreen();
            console.log('✅ Fullscreen do iframe ativado via webkit!');
          } else if ((iframe as any).msRequestFullscreen) {
            (iframe as any).msRequestFullscreen();
            console.log('✅ Fullscreen do iframe ativado via ms!');
          }
        }
        
      } catch (error) {
        console.log('❌ Erro ao ativar fullscreen do iframe:', error);
      }
    }, 5000); // 5 segundos
    
    // ESTRATÉGIA 5: Tentar via postMessage para o YouTube
    setTimeout(() => {
      try {
        console.log('🎯 ESTRATÉGIA 5: Tentando fullscreen via postMessage...');
        
        if (iframeRef.current) {
          const iframe = iframeRef.current;
          
          // Comandos para o player do YouTube
          const commands = [
            { event: 'command', func: 'requestFullscreen' },
            { event: 'command', func: 'setFullscreen', args: [true] },
            { event: 'command', func: 'toggleFullscreen' }
          ];
          
          commands.forEach((command, index) => {
            setTimeout(() => {
              try {
                iframe.contentWindow?.postMessage(JSON.stringify(command), '*');
                console.log(`✅ Comando ${index + 1} enviado:`, command);
              } catch (error) {
                console.log(`❌ Erro no comando ${index + 1}:`, error);
              }
            }, index * 300);
          });
        }
        
      } catch (error) {
        console.log('❌ Erro no postMessage:', error);
      }
    }, 6000); // 6 segundos
    
    // ESTRATÉGIA 6: Simular clique no botão de fullscreen do YouTube
    setTimeout(() => {
      try {
        console.log('🎯 ESTRATÉGIA 6: Procurando botão de fullscreen no YouTube...');
        
        if (iframeRef.current) {
          const iframe = iframeRef.current;
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          
          if (iframeDoc) {
            // Procurar pelo botão de fullscreen
            const fullscreenSelectors = [
              '.ytp-fullscreen-button',
              'button[aria-label*="fullscreen"]',
              'button[aria-label*="tela cheia"]',
              '[data-tooltip*="fullscreen"]'
            ];
            
            fullscreenSelectors.forEach((selector) => {
              const elements = iframeDoc.querySelectorAll(selector);
              if (elements.length > 0) {
                console.log(`🎯 Botão de fullscreen encontrado: ${selector}`);
                
                try {
                  (elements[0] as HTMLElement).click();
                  console.log(`✅ Clique no botão de fullscreen executado: ${selector}`);
                } catch (clickError) {
                  console.log(`❌ Erro ao clicar no botão: ${selector}`, clickError);
                }
              }
            });
          }
        }
        
      } catch (error) {
        console.log('❌ Erro ao procurar botão de fullscreen:', error);
      }
    }, 7000); // 7 segundos
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setLoadError(false);
    
    // Tentar ativar fullscreen do YouTube após carregar
    activateYouTubeFullscreen();
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

      {/* BOTÃO DE TESTE VISÍVEL */}
      <div className="youtube-test-controls">
        <button 
          onClick={activateYouTubeFullscreen}
          className="test-button"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            background: 'red',
            color: 'white',
            border: 'none',
            padding: '10px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🎯 TESTE: Fullscreen Multi-Estratégia
        </button>
        
        <div className="test-info" style={{
          position: 'absolute',
          top: '50px',
          right: '10px',
          zIndex: 1000,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '11px',
          maxWidth: '250px'
        }}>
          <div>🎬 Vídeo: {dashboard.title}</div>
          <div>🆔 ID: {dashboard.youtubeVideoId}</div>
          <div>📱 Status: {isLoaded ? 'Carregado' : 'Carregando'}</div>
          <div>🎯 Clique no botão vermelho para testar</div>
          <div>⌨️ 6 estratégias diferentes de fullscreen</div>
          <div>⏱️ Executa automaticamente em sequência</div>
        </div>
      </div>
    </div>
  );
}
