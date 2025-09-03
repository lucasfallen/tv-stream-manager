export type ContentType = 'dashboard' | 'youtube';

export interface Dashboard {
  id: string;
  title: string;
  url: string;
  duration: number;
  contentType: ContentType;
  // Campos específicos para YouTube
  youtubeVideoId?: string;
  youtubeStartTime?: number; // Tempo de início em segundos
  youtubeEndTime?: number;   // Tempo de fim em segundos
  youtubeAutoplay?: boolean; // Se deve autoplay
  youtubeMute?: boolean;     // Se deve iniciar mutado
}