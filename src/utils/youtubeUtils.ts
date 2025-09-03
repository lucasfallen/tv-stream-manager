/**
 * Utilitários para trabalhar com URLs do YouTube
 */

export interface YouTubeUrlInfo {
  videoId: string;
  startTime?: number;
  endTime?: number;
  autoplay?: boolean;
  mute?: boolean;
}

/**
 * Extrai o ID do vídeo de uma URL do YouTube
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extrai parâmetros adicionais de uma URL do YouTube
 */
export function extractYouTubeParams(url: string): Partial<YouTubeUrlInfo> {
  const urlObj = new URL(url);
  const params: Partial<YouTubeUrlInfo> = {};

  // Tempo de início (t=)
  const startTime = urlObj.searchParams.get('t');
  if (startTime) {
    params.startTime = parseTimeParameter(startTime);
  }

  // Tempo de fim (end=)
  const endTime = urlObj.searchParams.get('end');
  if (endTime) {
    params.endTime = parseInt(endTime);
  }

  // Autoplay
  const autoplay = urlObj.searchParams.get('autoplay');
  if (autoplay) {
    params.autoplay = autoplay === '1';
  }

  // Mute
  const mute = urlObj.searchParams.get('mute');
  if (mute) {
    params.mute = mute === '1';
  }

  return params;
}

/**
 * Converte parâmetro de tempo do YouTube (ex: "1m30s") para segundos
 */
function parseTimeParameter(timeParam: string): number {
  let totalSeconds = 0;
  
  // Padrão: 1h2m30s ou 2m30s ou 30s
  const timeRegex = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/;
  const match = timeParam.match(timeRegex);
  
  if (match) {
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
  }
  
  return totalSeconds;
}

/**
 * Valida se uma URL é do YouTube
 */
export function isValidYouTubeUrl(url: string): boolean {
  const youtubeDomains = [
    'youtube.com',
    'www.youtube.com',
    'youtu.be',
    'www.youtu.be',
    'm.youtube.com'
  ];
  
  try {
    const urlObj = new URL(url);
    return youtubeDomains.includes(urlObj.hostname);
  } catch {
    return false;
  }
}

/**
 * Gera uma URL de embed do YouTube com parâmetros
 */
export function generateYouTubeEmbedUrl(videoId: string, options: Partial<YouTubeUrlInfo> = {}): string {
  const params = new URLSearchParams();
  
  if (options.startTime) {
    params.set('start', options.startTime.toString());
  }
  
  if (options.endTime) {
    params.set('end', options.endTime.toString());
  }
  
  if (options.autoplay) {
    params.set('autoplay', '1');
  }
  
  if (options.mute) {
    params.set('mute', '1');
  }
  
  // Sempre incluir rel=0 para não mostrar vídeos relacionados
  params.set('rel', '0');
  
  // Sempre incluir modestbranding=1 para remover logo do YouTube
  params.set('modestbranding', '1');
  
  // Sempre incluir showinfo=0 para remover informações do vídeo
  params.set('showinfo', '0');
  
  // Parâmetros para melhorar a experiência de fullscreen
  params.set('fs', '1'); // Habilitar botão de fullscreen
  params.set('playsinline', '0'); // Permitir reprodução em tela cheia
  params.set('enablejsapi', '1'); // Habilitar API JavaScript
  
  const queryString = params.toString();
  return `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Detecta automaticamente o tipo de conteúdo baseado na URL
 */
export function detectContentType(url: string): 'youtube' | 'dashboard' {
  return isValidYouTubeUrl(url) ? 'youtube' : 'dashboard';
}
