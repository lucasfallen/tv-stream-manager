import { useState, useEffect } from 'react';
import { useDashboards } from '../contexts/DashboardContext';
import DashboardViewer from '../components/DashboardViewer';
import '../styles/TvDisplayPage.css';

export default function TvDisplayPage() {
  const { 
    dashboards
  } = useDashboards();
  
  const [showNameForm, setShowNameForm] = useState(true);
  const [tvName, setTvName] = useState('');

  useEffect(() => {
    // Verificar se já existe um nome salvo
    const savedName = localStorage.getItem('tvName');
    if (savedName) {
      setTvName(savedName);
      setShowNameForm(false);
    }
  }, []);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tvName.trim()) return;

    try {
      // Simular delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Salvar nome da TV
      localStorage.setItem('tvName', tvName.trim());
      setShowNameForm(false);
    } catch (error) {
      console.error('Erro ao configurar TV:', error);
    }
  };

  // Página de configuração da TV - apenas quando necessário
  if (showNameForm) {
    return (
      <div className="tv-setup-minimal">
        <div className="setup-content">
          <div className="setup-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1>Configuração da TV</h1>
          <p>Identifique esta TV para gerenciamento remoto</p>
          
          <form onSubmit={handleNameSubmit} className="setup-form">
            <input
              type="text"
              value={tvName}
              onChange={(e) => setTvName(e.target.value)}
              className="setup-input"
              placeholder="Nome da TV"
              required
              autoFocus
            />
            <button type="submit" className="setup-button">
              Configurar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Página principal da TV - apenas o conteúdo
  if (dashboards.length === 0) {
    return (
      <div className="tv-waiting-minimal">
        <div className="waiting-content">
          <div className="waiting-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2>Aguardando Configuração</h2>
          <p>Nenhum dashboard foi configurado ainda.</p>
        </div>
      </div>
    );
  }

  // Exibir apenas o conteúdo em tela cheia
  return (
    <div className="tv-content-fullscreen">
      <DashboardViewer />
    </div>
  );
}