import { io, Socket } from 'socket.io-client';
import { Dashboard } from '../types/Dashboard';

// URL do servidor WebSocket (assume o mesmo host em produção)
const SOCKET_URL = typeof window !== 'undefined' 
  ? (window.location.protocol === 'https:' ? 'https://' : 'http://') + window.location.hostname + ':3001'
  : 'http://localhost:3001';

// Interface para cliente TV
export interface TvClient {
  id: string;
  name: string;
  currentDashboardIndex: number;
  isPlaying: boolean;
  isConnected: boolean;
  totalDashboards: number;
}

// Interface para cliente Admin
export interface AdminClient {
  id: string;
  name: string;
}

class SocketService {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private clientType: 'tv' | 'admin' | null = null;
  private clientName: string = '';

  // Conectar ao servidor WebSocket
  connect(clientType: 'tv' | 'admin', name: string): void {
    // Evitar reconectar se já estiver conectado com o mesmo tipo e nome
    if (this.connected && 
        this.socket && 
        this.clientType === clientType && 
        this.clientName === name) {
      console.log(`Já conectado como ${clientType}: ${name}`);
      return;
    }
    
    this.clientType = clientType;
    this.clientName = name;
    
    if (this.socket) {
      // Se já existe um socket mas estamos reconectando com outro tipo/nome
      // Desconectar o socket existente primeiro
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.socket = io(SOCKET_URL);
    
    // Configurar eventos básicos
    this.socket.on('connect', () => {
      console.log(`Socket conectado como ${clientType}: ${name}`);
      this.connected = true;
      
      // Registrar o tipo de cliente após a conexão
      this.socket?.emit('register-client', { clientType, name });
    });
    
    this.socket.on('disconnect', () => {
      console.log('Socket desconectado');
      this.connected = false;
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Erro de conexão com o socket:', error);
      this.connected = false;
    });
  }

  // Desconectar do servidor WebSocket
  disconnect(): void {
    if (this.socket) {
      // Remover todos os listeners antes de desconectar
      this.socket.off('connect');
      this.socket.off('disconnect');
      this.socket.off('connect_error');
      this.socket.off('dashboard-update');
      this.socket.off('current-dashboard-change');
      this.socket.off('playback-status-change');
      this.socket.off('tvs-list');
      this.socket.off('tv-connected');
      this.socket.off('tv-disconnected');
      this.socket.off('tv-status-updated');
      this.socket.off('tv-updated');
      
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.clientType = null;
      this.clientName = '';
    }
  }

  // Remover um ouvinte específico
  off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Verificar se o socket está conectado
  isConnected(): boolean {
    return this.connected && !!this.socket;
  }

  // Retornar informações do cliente atual
  getClientInfo(): { type: 'tv' | 'admin' | null, name: string } {
    return {
      type: this.clientType,
      name: this.clientName
    };
  }

  // ======= MÉTODOS PARA ENVIO DE COMANDOS (ADMIN) =======

  // Enviar atualização de dashboards para uma TV específica
  emitDashboardUpdateTo(targetTvId: string, dashboards: Dashboard[]): void {
    if (this.socket && this.connected && this.clientType === 'admin') {
      this.socket.emit('dashboard-update-to', { targetTvId, dashboards });
    }
  }

  // Enviar atualização de dashboards para todas as TVs
  emitDashboardUpdateAll(dashboards: Dashboard[]): void {
    if (this.socket && this.connected && this.clientType === 'admin') {
      this.socket.emit('dashboard-update-all', dashboards);
    }
  }

  // Trocar o dashboard atual para TV específica
  emitCurrentDashboardChangeTo(targetTvId: string, index: number): void {
    if (this.socket && this.connected && this.clientType === 'admin') {
      this.socket.emit('current-dashboard-change-to', { targetTvId, index });
    }
  }

  // Trocar o dashboard atual para todas as TVs
  emitCurrentDashboardChangeAll(index: number): void {
    if (this.socket && this.connected && this.clientType === 'admin') {
      this.socket.emit('current-dashboard-change-all', index);
    }
  }

  // Alterar status de reprodução para TV específica
  emitPlaybackStatusChangeTo(targetTvId: string, isPlaying: boolean): void {
    if (this.socket && this.connected && this.clientType === 'admin') {
      this.socket.emit('playback-status-change-to', { targetTvId, isPlaying });
    }
  }

  // Alterar status de reprodução para todas as TVs
  emitPlaybackStatusChangeAll(isPlaying: boolean): void {
    if (this.socket && this.connected && this.clientType === 'admin') {
      this.socket.emit('playback-status-change-all', isPlaying);
    }
  }

  // Atualizar nome do cliente (TV ou Admin)
  emitClientNameUpdate(name: string): void {
    if (this.socket && this.connected) {
      this.clientName = name;
      this.socket.emit('client-name-update', { name });
    }
  }

  // ======= MÉTODOS PARA ENVIO DE STATUS (TV) =======

  // Enviar atualização de status da TV
  emitTvStatusUpdate(status: { currentDashboardIndex: number, isPlaying: boolean }): void {
    if (this.socket && this.connected && this.clientType === 'tv') {
      this.socket.emit('tv-status-update', status);
    }
  }

  // ======= MÉTODOS PARA ESCUTAR EVENTOS (TV) =======

  // Escutar atualizações de dashboards
  onDashboardUpdate(callback: (dashboards: Dashboard[]) => void): void {
    if (this.socket) {
      this.socket.on('dashboard-update', callback);
    }
  }

  // Escutar mudanças no dashboard atual
  onCurrentDashboardChange(callback: (index: number) => void): void {
    if (this.socket) {
      this.socket.on('current-dashboard-change', callback);
    }
  }

  // Escutar mudanças no status de reprodução
  onPlaybackStatusChange(callback: (isPlaying: boolean) => void): void {
    if (this.socket) {
      this.socket.on('playback-status-change', callback);
    }
  }

  // ======= MÉTODOS PARA ESCUTAR EVENTOS (ADMIN) =======

  // Receber lista de TVs conectadas
  onTvsList(callback: (tvs: TvClient[]) => void): void {
    if (this.socket) {
      this.socket.on('tvs-list', callback);
    }
  }

  // Quando uma nova TV se conecta
  onTvConnected(callback: (tv: TvClient) => void): void {
    if (this.socket) {
      this.socket.on('tv-connected', callback);
    }
  }

  // Quando uma TV se desconecta
  onTvDisconnected(callback: (tv: { id: string }) => void): void {
    if (this.socket) {
      this.socket.on('tv-disconnected', callback);
    }
  }

  // Quando o status de uma TV é atualizado
  onTvStatusUpdated(callback: (status: TvClient) => void): void {
    if (this.socket) {
      this.socket.on('tv-status-updated', callback);
    }
  }

  // Quando uma TV é atualizada (ex: nome)
  onTvUpdated(callback: (tv: { id: string, name: string }) => void): void {
    if (this.socket) {
      this.socket.on('tv-updated', callback);
    }
  }

  // Método genérico para emitir eventos
  emit(event: string, data: any): void {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    } else {
      console.error(`Não foi possível emitir o evento "${event}". Socket desconectado.`);
    }
  }
}

// Criar uma instância única do serviço de Socket
const socketService = new SocketService();

export default socketService;