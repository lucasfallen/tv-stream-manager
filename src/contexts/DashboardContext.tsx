import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Dashboard } from '../types/Dashboard';
import socketService, { TvClient } from '../services/SocketService';

// Gera um ID aleatório
const generateId = () => Math.random().toString(36).substring(2, 9);

// Interface do contexto
interface DashboardContextType {
  dashboards: Dashboard[];
  currentIndex: number;
  currentDashboard: Dashboard | undefined;
  isPlaying: boolean;
  isEditMode: boolean;
  isAdmin: boolean;
  tvsList: TvClient[];
  selectedTvId: string | null;
  socketConnected: boolean;
  setIsPlaying: (playing: boolean) => void;
  setIsEditMode: (editing: boolean) => void;
  setSelectedTvId: (tvId: string | null) => void;
  addDashboard: (dashboard: Omit<Dashboard, 'id'>) => void;
  updateDashboard: (id: string, updatedDashboard: Partial<Dashboard>) => void;
  removeDashboard: (id: string) => void;
  reorderDashboards: (newOrder: Dashboard[]) => void;
  nextDashboard: () => void;
  previousDashboard: () => void;
  goToDashboard: (index: number) => void;
  renameClient: (name: string) => void;
  connectSocket: (clientType: 'tv' | 'admin', name: string) => void;
}

// Props do provider
interface DashboardProviderProps {
  children: ReactNode;
}

const initialDashboards: Dashboard[] = [
  {
    id: generateId(),
    title: "Acompanhamento de Operações",
    url: "https://d2msppbxywc01b.cloudfront.net/", 
    duration: 120
  }
];

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [dashboards, setDashboards] = useState<Dashboard[]>(() => {
    // Tenta recuperar do localStorage ou usa os valores iniciais
    const saved = localStorage.getItem('dashboards');
    return saved ? JSON.parse(saved) : initialDashboards;
  });
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tvsList, setTvsList] = useState<TvClient[]>([]);
  const [selectedTvId, setSelectedTvId] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  
  // Função para verificar a conexão do socket
  useEffect(() => {
    const checkConnection = () => {
      setSocketConnected(socketService.isConnected());
    };
    
    // Verificar inicialmente e a cada 3 segundos
    checkConnection();
    const interval = setInterval(checkConnection, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Função para conectar ao socket
  const connectSocket = useCallback((clientType: 'tv' | 'admin', name: string) => {
    socketService.connect(clientType, name);
  }, []);
  
  // Função para enviar status atual para o servidor (se for TV)
  const sendStatusUpdate = useCallback(() => {
    if (!isAdmin && socketService.isConnected()) {
      socketService.emitTvStatusUpdate({
        currentDashboardIndex: currentIndex,
        isPlaying
      });
    }
  }, [currentIndex, isPlaying, isAdmin]);
  
  // Conectar ao serviço de WebSocket quando o componente montar
  useEffect(() => {
    // Verificar se estamos na rota de admin
    const isAdminRoute = window.location.pathname.includes('/admin');
    setIsAdmin(isAdminRoute);
    
    // Só conecta automaticamente se não houver conexão previamente estabelecida
    if (!socketService.isConnected()) {
      const clientName = isAdminRoute 
        ? localStorage.getItem('adminName') || `Admin-${Math.random().toString(36).substring(2, 6)}`
        : localStorage.getItem('tvName') || `TV-${Math.random().toString(36).substring(2, 6)}`;
      
      if (isAdminRoute && !localStorage.getItem('adminName')) {
        localStorage.setItem('adminName', clientName);
      }
      
      socketService.connect(
        isAdminRoute ? 'admin' : 'tv',
        clientName
      );
    }
    
    const setupListeners = () => {
      if (isAdminRoute) {
        // Configurar ouvintes específicos para admins
        socketService.onTvsList((tvs) => {
          console.log('Lista de TVs recebida:', tvs);
          setTvsList(tvs);
          
          if (!selectedTvId && tvs.length > 0) {
            setSelectedTvId(tvs[0].id);
          }
        });
        
        socketService.onTvConnected((tv) => {
          console.log('TV conectada:', tv);
          setTvsList(prev => [...prev, { 
            ...tv, 
            currentDashboardIndex: 0, 
            isPlaying: true 
          }]);
          
          if (!selectedTvId) {
            setSelectedTvId(tv.id);
          }
        });
        
        socketService.onTvDisconnected((tv) => {
          console.log('TV desconectada:', tv);
          setTvsList(prev => prev.filter(t => t.id !== tv.id));
          
          if (selectedTvId === tv.id) {
            setSelectedTvId(prev => {
              const remainingTvs = tvsList.filter(t => t.id !== tv.id);
              return remainingTvs.length > 0 ? remainingTvs[0].id : null;
            });
          }
        });
        
        socketService.onTvStatusUpdated((status) => {
          console.log('Status de TV atualizado:', status);
          setTvsList(prev => prev.map(tv => 
            tv.id === status.id 
              ? { 
                  ...tv, 
                  currentDashboardIndex: status.currentDashboardIndex, 
                  isPlaying: status.isPlaying 
                } 
              : tv
          ));
        });
        
        socketService.onTvUpdated((update) => {
          console.log('TV atualizada:', update);
          setTvsList(prev => prev.map(tv => 
            tv.id === update.id ? { ...tv, name: update.name } : tv
          ));
        });
      } else {
        // Configurar ouvintes específicos para TVs
        socketService.onDashboardUpdate((updatedDashboards) => {
          console.log('Recebido atualização de dashboards via socket', updatedDashboards);
          setDashboards(updatedDashboards);
        });
        
        socketService.onCurrentDashboardChange((index) => {
          console.log('Recebido atualização de índice atual via socket', index);
          setCurrentIndex(index);
        });
        
        socketService.onPlaybackStatusChange((status) => {
          console.log('Recebido atualização de status de reprodução via socket', status);
          setIsPlaying(status);
        });
        
        // Enviar o status inicial após a conexão
        setTimeout(() => {
          sendStatusUpdate();
        }, 1000);
      }
    };
    
    setupListeners();
    
    return () => {
      // Não desconectar ao desmontar, apenas remover listeners
      socketService.off('dashboard-update');
      socketService.off('current-dashboard-change');
      socketService.off('playback-status-change');
      socketService.off('tvs-list');
      socketService.off('tv-connected');
      socketService.off('tv-disconnected');
      socketService.off('tv-status-updated');
      socketService.off('tv-updated');
    };
  }, [isAdmin, selectedTvId, tvsList, sendStatusUpdate]); // Dependências corretas
  
  // Salva dashboards quando mudam
  useEffect(() => {
    localStorage.setItem('dashboards', JSON.stringify(dashboards));
    
    // Se for o admin, emitir a atualização para TVs
    if (isAdmin && socketService.isConnected()) {
      if (selectedTvId) {
        // Enviar para a TV selecionada
        socketService.emitDashboardUpdateTo(selectedTvId, dashboards);
      } else {
        // Enviar para todas as TVs
        socketService.emitDashboardUpdateAll(dashboards);
      }
    }
  }, [dashboards, isAdmin, selectedTvId]);
  
  // Enviar atualizações de status da TV para os admins
  useEffect(() => {
    if (!isAdmin && socketService.isConnected()) {
      sendStatusUpdate();
    }
  }, [currentIndex, isPlaying, isAdmin, sendStatusUpdate]);
  
  // Funções para gerenciar dashboards
  const addDashboard = useCallback((dashboard: Omit<Dashboard, 'id'>) => {
    const newDashboard = {
      ...dashboard,
      id: generateId(),
    };
    setDashboards(prev => [...prev, newDashboard]);
  }, []);
  
  const updateDashboard = useCallback((id: string, updatedDashboard: Partial<Dashboard>) => {
    setDashboards(prev => prev.map(d => 
      d.id === id ? { ...d, ...updatedDashboard } : d
    ));
  }, []);
  
  const removeDashboard = useCallback((id: string) => {
    setDashboards(prev => prev.filter(d => d.id !== id));
  }, []);
  
  const reorderDashboards = useCallback((newOrder: Dashboard[]) => {
    setDashboards(newOrder);
  }, []);
  
  // Navegação
  const nextDashboard = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === dashboards.length - 1 ? 0 : prevIndex + 1;
      
      // Se for o admin, emitir a mudança para TVs
      if (isAdmin && socketService.isConnected()) {
        if (selectedTvId) {
          // Enviar para a TV selecionada
          socketService.emitCurrentDashboardChangeTo(selectedTvId, newIndex);
        } else {
          // Enviar para todas as TVs
          socketService.emitCurrentDashboardChangeAll(newIndex);
        }
      }
      
      return newIndex;
    });
  }, [dashboards.length, isAdmin, selectedTvId]);
  
  const previousDashboard = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? dashboards.length - 1 : prevIndex - 1;
      
      // Se for o admin, emitir a mudança para TVs
      if (isAdmin && socketService.isConnected()) {
        if (selectedTvId) {
          // Enviar para a TV selecionada
          socketService.emitCurrentDashboardChangeTo(selectedTvId, newIndex);
        } else {
          // Enviar para todas as TVs
          socketService.emitCurrentDashboardChangeAll(newIndex);
        }
      }
      
      return newIndex;
    });
  }, [dashboards.length, isAdmin, selectedTvId]);
  
  const goToDashboard = useCallback((index: number) => {
    setCurrentIndex(index);
    
    // Se for o admin, emitir a mudança para TVs
    if (isAdmin && socketService.isConnected()) {
      if (selectedTvId) {
        // Enviar para a TV selecionada
        socketService.emitCurrentDashboardChangeTo(selectedTvId, index);
      } else {
        // Enviar para todas as TVs
        socketService.emitCurrentDashboardChangeAll(index);
      }
    }
  }, [isAdmin, selectedTvId]);
  
  // Efeito para notificar TVs quando o status de reprodução muda
  useEffect(() => {
    if (isAdmin && socketService.isConnected()) {
      if (selectedTvId) {
        // Enviar para a TV selecionada
        socketService.emitPlaybackStatusChangeTo(selectedTvId, isPlaying);
      } else {
        // Enviar para todas as TVs
        socketService.emitPlaybackStatusChangeAll(isPlaying);
      }
    }
  }, [isPlaying, isAdmin, selectedTvId]);
  
  // Função para renomear o cliente atual
  const renameClient = useCallback((name: string) => {
    if (isAdmin) {
      localStorage.setItem('adminName', name);
    } else {
      localStorage.setItem('tvName', name);
    }
    socketService.emitClientNameUpdate(name);
  }, [isAdmin]);
  
  // Valor do contexto
  const contextValue: DashboardContextType = {
    dashboards,
    currentIndex,
    currentDashboard: dashboards[currentIndex],
    isPlaying,
    isEditMode,
    isAdmin,
    tvsList,
    selectedTvId,
    socketConnected,
    setIsPlaying,
    setIsEditMode,
    setSelectedTvId,
    addDashboard,
    updateDashboard,
    removeDashboard,
    reorderDashboards,
    nextDashboard,
    previousDashboard,
    goToDashboard,
    renameClient,
    connectSocket
  };
  
  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboards = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboards deve ser usado dentro de um DashboardProvider');
  }
  return context;
};