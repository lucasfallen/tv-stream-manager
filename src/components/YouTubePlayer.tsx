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
    if (iframeRef.current) {
      try {
        const iframe = iframeRef.current;
        
        console.log('🎬 INICIANDO SEQUÊNCIA AUTOMÁTICA: CLIQUE NO CARD + FULLSCREEN');
        console.log('📍 Iframe encontrado:', iframe);
        console.log('📍 URL do iframe:', iframe.src);
        
        // ESTRATÉGIA 1: Clique direto no iframe (mais simples e eficaz)
        setTimeout(() => {
          console.log('🎯 ESTRATÉGIA 1: Clique direto no iframe...');
          
          try {
            // Simular clique no centro do iframe
            const rect = iframe.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            console.log(`📍 Coordenadas do iframe: ${rect.left}, ${rect.top}, ${rect.width}x${rect.height}`);
            console.log(`📍 Centro do iframe: ${centerX}, ${centerY}`);
            
            // Criar e disparar evento de clique
            const clickEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: centerX,
              clientY: centerY,
              button: 0,
              buttons: 1
            });
            
            iframe.dispatchEvent(clickEvent);
            console.log('✅ Clique no iframe executado com sucesso!');
            
          } catch (error) {
            console.log('❌ Erro no clique direto:', error);
          }
        }, 1000); // 1 segundo
        
        // ESTRATÉGIA 2: Tentar acessar o conteúdo do iframe
        setTimeout(() => {
          console.log('🎯 ESTRATÉGIA 2: Tentando acessar conteúdo do iframe...');
          
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            
            if (iframeDoc) {
              console.log('✅ Documento do iframe acessível!');
              console.log('📍 Título do documento:', iframeDoc.title);
              
              // Procurar por elementos clicáveis
              const clickableElements = iframeDoc.querySelectorAll('*');
              console.log(`📍 Total de elementos no iframe: ${clickableElements.length}`);
              
              // Procurar por elementos específicos do YouTube
              const youtubeElements = iframeDoc.querySelectorAll('.ytp-pause-overlay, .ytp-cued-thumbnail-overlay, .html5-video-container, video, .ytp-large-play-button');
              console.log(`📍 Elementos do YouTube encontrados: ${youtubeElements.length}`);
              
              youtubeElements.forEach((element, index) => {
                console.log(`📍 Elemento ${index}:`, element.tagName, element.className);
                
                try {
                  // Tentar clicar no elemento
                  (element as HTMLElement).click();
                  console.log(`✅ Clique executado no elemento ${index}:`, element.tagName);
                } catch (clickError) {
                  console.log(`❌ Erro ao clicar no elemento ${index}:`, clickError);
                }
              });
              
            } else {
              console.log('❌ Não foi possível acessar o documento do iframe');
            }
            
          } catch (error) {
            console.log('❌ Erro ao acessar conteúdo do iframe:', error);
          }
        }, 2000); // 2 segundos
        
        // ESTRATÉGIA 3: Tentar via postMessage
        setTimeout(() => {
          console.log('🎯 ESTRATÉGIA 3: Tentando via postMessage...');
          
          try {
            // Comandos para o player do YouTube
            const commands = [
              { event: 'command', func: 'playVideo' },
              { event: 'command', func: 'requestFullscreen' },
              { event: 'command', func: 'setFullscreen', args: [true] }
            ];
            
            commands.forEach((command, index) => {
              setTimeout(() => {
                try {
                  iframe.contentWindow?.postMessage(JSON.stringify(command), '*');
                  console.log(`✅ Comando ${index + 1} enviado:`, command);
                } catch (error) {
                  console.log(`❌ Erro no comando ${index + 1}:`, error);
                }
              }, index * 500);
            });
            
          } catch (error) {
            console.log('❌ Erro no postMessage:', error);
          }
        }, 3000); // 3 segundos
        
        // ESTRATÉGIA 4: Clique duplo no iframe
        setTimeout(() => {
          console.log('🎯 ESTRATÉGIA 4: Clique duplo no iframe...');
          
          try {
            const rect = iframe.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Clique duplo
            const doubleClickEvent = new MouseEvent('dblclick', {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: centerX,
              clientY: centerY,
              button: 0,
              buttons: 1
            });
            
            iframe.dispatchEvent(doubleClickEvent);
            console.log('✅ Clique duplo no iframe executado!');
            
          } catch (error) {
            console.log('❌ Erro no clique duplo:', error);
          }
        }, 4000); // 4 segundos
        
        // ESTRATÉGIA 5: Múltiplos cliques em diferentes posições
        setTimeout(() => {
          console.log('🎯 ESTRATÉGIA 5: Múltiplos cliques em diferentes posições...');
          
          try {
            const rect = iframe.getBoundingClientRect();
            
            // Posições para clicar
            const positions = [
              { x: rect.left + rect.width * 0.25, y: rect.top + rect.height * 0.25 }, // Top-left
              { x: rect.left + rect.width * 0.75, y: rect.top + rect.height * 0.25 }, // Top-right
              { x: rect.left + rect.width * 0.25, y: rect.top + rect.height * 0.75 }, // Bottom-left
              { x: rect.left + rect.width * 0.75, y: rect.top + rect.height * 0.75 }, // Bottom-right
              { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.5 }   // Center
            ];
            
            positions.forEach((pos, index) => {
              setTimeout(() => {
                try {
                  const clickEvent = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: pos.x,
                    clientY: pos.y,
                    button: 0,
                    buttons: 1
                  });
                  
                  iframe.dispatchEvent(clickEvent);
                  console.log(`✅ Clique ${index + 1} em posição ${pos.x}, ${pos.y}`);
                  
                } catch (error) {
                  console.log(`❌ Erro no clique ${index + 1}:`, error);
                }
              }, index * 200);
            });
            
          } catch (error) {
            console.log('❌ Erro nos múltiplos cliques:', error);
          }
        }, 5000); // 5 segundos
        
      } catch (error) {
        console.log('❌ Erro geral na função:', error);
      }
    } else {
      console.log('❌ Iframe não encontrado!');
    }
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
          🎯 TESTE: Clique Automático
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
          maxWidth: '200px'
        }}>
          <div>🎬 Vídeo: {dashboard.title}</div>
          <div>🆔 ID: {dashboard.youtubeVideoId}</div>
          <div>📱 Status: {isLoaded ? 'Carregado' : 'Carregando'}</div>
          <div>🎯 Clique no botão vermelho para testar</div>
        </div>
      </div>
    </div>
  );
}
