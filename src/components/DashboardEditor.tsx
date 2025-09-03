import { useState, useRef } from 'react';
import { useDashboards } from '../contexts/DashboardContext';
import { Dashboard, ContentType } from '../types/Dashboard';
import { detectContentType, extractYouTubeVideoId, extractYouTubeParams } from '../utils/youtubeUtils';
import '../styles/DashboardEditor.css';

export default function DashboardEditor() {
  const { 
    dashboards, 
    addDashboard, 
    updateDashboard, 
    removeDashboard, 
    reorderDashboards 
  } = useDashboards();
  
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null);
  const [newDashboard, setNewDashboard] = useState({
    title: '',
    url: '',
    duration: 60,
    contentType: 'dashboard' as ContentType,
    youtubeVideoId: '',
    youtubeStartTime: undefined as number | undefined,
    youtubeEndTime: undefined as number | undefined,
    youtubeAutoplay: true,
    youtubeMute: true
  });
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });
  const [urlError, setUrlError] = useState('');
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleUrlChange = (url: string) => {
    // Detectar automaticamente o tipo de conteúdo
    const contentType = detectContentType(url);
    
    if (contentType === 'youtube') {
      const videoId = extractYouTubeVideoId(url);
      const params = extractYouTubeParams(url);
      
      setNewDashboard(prev => ({
        ...prev,
        url,
        contentType: 'youtube',
        youtubeVideoId: videoId || '',
        youtubeStartTime: params.startTime,
        youtubeEndTime: params.endTime,
        youtubeAutoplay: params.autoplay ?? true,
        youtubeMute: params.mute ?? true
      }));
    } else {
      setNewDashboard(prev => ({
        ...prev,
        url,
        contentType: 'dashboard',
        youtubeVideoId: '',
        youtubeStartTime: undefined,
        youtubeEndTime: undefined,
        youtubeAutoplay: true,
        youtubeMute: true
      }));
    }
  };
  
  const showFeedback = (message: string, type: string) => {
    setFeedback({ show: true, message, type });
    setTimeout(() => {
      setFeedback({ show: false, message: '', type: '' });
    }, 3000);
  };
  
  const handleNewDashboardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'url') {
      setUrlError('');
      handleUrlChange(value);
      return;
    }
    
    if (name === 'contentType') {
      setNewDashboard(prev => ({
        ...prev,
        contentType: value as ContentType,
        // Resetar campos do YouTube se mudar para dashboard
        ...(value === 'dashboard' && {
          youtubeVideoId: '',
          youtubeStartTime: undefined,
          youtubeEndTime: undefined,
          youtubeAutoplay: true,
          youtubeMute: true
        })
      }));
      return;
    }
    
    if (name.startsWith('youtube')) {
      setNewDashboard(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                type === 'number' ? (value ? parseInt(value, 10) : undefined) : value
      }));
      return;
    }
    
    setNewDashboard(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (!editingDashboard) return;
    
    if (name === 'url') {
      setUrlError('');
      // Detectar automaticamente o tipo de conteúdo para edição
      const contentType = detectContentType(value);
      
      if (contentType === 'youtube') {
        const videoId = extractYouTubeVideoId(value);
        const params = extractYouTubeParams(value);
        
        setEditingDashboard({
          ...editingDashboard,
          url: value,
          contentType: 'youtube',
          youtubeVideoId: videoId || '',
          youtubeStartTime: params.startTime,
          youtubeEndTime: params.endTime,
          youtubeAutoplay: params.autoplay ?? true,
          youtubeMute: params.mute ?? true
        });
        return;
      } else {
        setEditingDashboard({
          ...editingDashboard,
          url: value,
          contentType: 'dashboard',
          youtubeVideoId: '',
          youtubeStartTime: undefined,
          youtubeEndTime: undefined,
          youtubeAutoplay: true,
          youtubeMute: true
        });
        return;
      }
    }
    
    if (name === 'contentType') {
      setEditingDashboard({
        ...editingDashboard,
        contentType: value as ContentType,
        // Resetar campos do YouTube se mudar para dashboard
        ...(value === 'dashboard' && {
          youtubeVideoId: '',
          youtubeStartTime: undefined,
          youtubeEndTime: undefined,
          youtubeAutoplay: true,
          youtubeMute: true
        })
      });
      return;
    }
    
    if (name.startsWith('youtube')) {
      setEditingDashboard({
        ...editingDashboard,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                type === 'number' ? (value ? parseInt(value, 10) : undefined) : value
      });
      return;
    }
    
    setEditingDashboard({
      ...editingDashboard,
      [name]: name === 'duration' ? parseInt(value, 10) || 0 : value
    });
  };
  
  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUrl(newDashboard.url)) {
      setUrlError('Por favor, insira uma URL válida (ex: https://exemplo.com)');
      return;
    }

    // Validar campos específicos do YouTube
    if (newDashboard.contentType === 'youtube' && !newDashboard.youtubeVideoId) {
      setUrlError('URL do YouTube inválida. Verifique se é um vídeo válido.');
      return;
    }
    
    addDashboard(newDashboard);
    setNewDashboard({ 
      title: '', 
      url: '', 
      duration: 60,
      contentType: 'dashboard',
      youtubeVideoId: '',
      youtubeStartTime: undefined,
      youtubeEndTime: undefined,
      youtubeAutoplay: true,
      youtubeMute: true
    });
    showFeedback('Dashboard adicionado com sucesso!', 'success');
  };
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingDashboard) return;
    
    if (!validateUrl(editingDashboard.url)) {
      setUrlError('Por favor, insira uma URL válida (ex: https://exemplo.com)');
      return;
    }

    // Validar campos específicos do YouTube
    if (editingDashboard.contentType === 'youtube' && !editingDashboard.youtubeVideoId) {
      setUrlError('URL do YouTube inválida. Verifique se é um vídeo válido.');
      return;
    }
    
    updateDashboard(editingDashboard.id, editingDashboard);
    setEditingDashboard(null);
    showFeedback('Dashboard atualizado com sucesso!', 'success');
  };
  
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverItem.current = index;
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.currentTarget.classList.add('drag-over');
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    const elements = document.querySelectorAll('.drag-over');
    elements.forEach(el => el.classList.remove('drag-over'));
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const dragIndex = dragItem.current;
    const dropIndex = dragOverItem.current;
    
    if (dragIndex === null || dropIndex === null || dragIndex === dropIndex) {
      return;
    }
    
    const newOrder = [...dashboards];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, removed);
    
    reorderDashboards(newOrder);
    showFeedback('Ordem dos dashboards atualizada!', 'success');
    
    dragItem.current = null;
    dragOverItem.current = null;
  };
  
  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja remover o dashboard "${title}"?`)) {
      removeDashboard(id);
      showFeedback('Dashboard removido!', 'warning');
    }
  };
  
  return (
    <div className="dashboard-editor">
      {/* Header */}
      <div className="editor-header">
        <div className="header-content">
          <h2 className="editor-title">
            <svg className="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Gerenciar Dashboards
          </h2>
          <p className="editor-subtitle">
            Adicione, edite e organize seus dashboards para exibição nas TVs
          </p>
        </div>
        <div className="header-actions">
          <span className="dashboard-count">
            {dashboards.length} dashboard{dashboards.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Mensagem de feedback */}
      {feedback.show && (
        <div className={`feedback-message ${feedback.type}`}>
          <div className="feedback-content">
            <span className="feedback-icon">
              {feedback.type === 'success' && '✓'}
              {feedback.type === 'warning' && '⚠'}
              {feedback.type === 'error' && '✗'}
            </span>
            <span className="feedback-text">{feedback.message}</span>
          </div>
        </div>
      )}
      
      {/* Lista de dashboards */}
      <div className="dashboards-section">
        <div className="section-header">
          <h3 className="section-title">
            <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Dashboards Configurados
          </h3>
          <span className="section-info">Arraste para reordenar</span>
        </div>
        
        {dashboards.length === 0 ? (
          <div className="empty-dashboards">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
            </div>
            <h3>Nenhum dashboard configurado</h3>
            <p>Adicione seu primeiro dashboard usando o formulário abaixo</p>
          </div>
        ) : (
          <div className="dashboards-grid">
            {dashboards.map((dashboard, index) => (
              <div 
                key={dashboard.id} 
                className="dashboard-card"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
              >
                <div className="card-header">
                  <div className="card-order">
                    <span className="order-number">{index + 1}</span>
                    <div className="drag-handle">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="9" cy="5" r="1" />
                        <circle cx="9" cy="12" r="1" />
                        <circle cx="9" cy="19" r="1" />
                        <circle cx="15" cy="5" r="1" />
                        <circle cx="15" cy="12" r="1" />
                        <circle cx="15" cy="19" r="1" />
                      </svg>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button 
                      onClick={() => setEditingDashboard(dashboard)}
                      className="btn btn-sm btn-secondary"
                      title="Editar dashboard"
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(dashboard.id, dashboard.title)}
                      className="btn btn-sm btn-danger"
                      title="Remover dashboard"
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remover
                    </button>
                  </div>
                </div>
                
                <div className="card-body">
                  <h4 className="dashboard-title">{dashboard.title}</h4>
                  <div className="dashboard-meta">
                    <div className="meta-item">
                      <span className="meta-label">Tipo:</span>
                      <span className={`meta-value content-type ${dashboard.contentType}`}>
                        {dashboard.contentType === 'youtube' ? (
                          <>
                            <svg className="type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                            </svg>
                            YouTube
                          </>
                        ) : (
                          <>
                            <svg className="type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Dashboard
                          </>
                        )}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Duração:</span>
                      <span className="meta-value">{dashboard.duration}s</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">URL:</span>
                      <span className="meta-value url-value" title={dashboard.url}>
                        {dashboard.url}
                      </span>
                    </div>
                    {dashboard.contentType === 'youtube' && dashboard.youtubeVideoId && (
                      <div className="meta-item">
                        <span className="meta-label">Vídeo ID:</span>
                        <span className="meta-value video-id">{dashboard.youtubeVideoId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Formulário para editar dashboard */}
      {editingDashboard && (
        <div className="edit-form-section">
          <div className="section-header">
            <h3 className="section-title">
              <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar Dashboard
            </h3>
          </div>
          
          <div className="form-container">
            <form onSubmit={handleEditSubmit} className="dashboard-form">
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="edit-title" className="form-label">
                    <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Título
                  </label>
                  <input 
                    id="edit-title"
                    name="title"
                    value={editingDashboard.title}
                    onChange={handleEditChange}
                    className="input"
                    required
                    placeholder="Nome do Dashboard"
                  />
                </div>
                
                <div className="form-field">
                  <label htmlFor="edit-contentType" className="form-label">
                    <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Tipo de Conteúdo
                  </label>
                  <select 
                    id="edit-contentType"
                    name="contentType"
                    value={editingDashboard.contentType}
                    onChange={handleEditChange}
                    className="input"
                    required
                  >
                    <option value="dashboard">Dashboard</option>
                    <option value="youtube">Vídeo do YouTube</option>
                  </select>
                </div>
                
                <div className="form-field">
                  <label htmlFor="edit-url" className="form-label">
                    <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    URL
                  </label>
                  <input 
                    id="edit-url"
                    name="url"
                    value={editingDashboard.url}
                    onChange={handleEditChange}
                    className={`input ${urlError ? 'error' : ''}`}
                    required
                    placeholder={editingDashboard.contentType === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://exemplo.com'}
                  />
                  {urlError && <span className="error-message">{urlError}</span>}
                  {editingDashboard.contentType === 'youtube' && (
                    <div className="input-help">
                      <svg className="help-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Cole a URL do vídeo do YouTube (ex: https://youtube.com/watch?v=VIDEO_ID)
                    </div>
                  )}
                </div>
                
                <div className="form-field">
                  <label htmlFor="edit-duration" className="form-label">
                    <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Duração (segundos)
                  </label>
                  <input 
                    id="edit-duration"
                    name="duration"
                    type="number"
                    min="1"
                    value={editingDashboard.duration}
                    onChange={handleEditChange}
                    className="input"
                    required
                  />
                </div>

                {/* Campos específicos do YouTube */}
                {editingDashboard.contentType === 'youtube' && (
                  <>
                    <div className="form-field">
                      <label htmlFor="edit-youtubeStartTime" className="form-label">
                        <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tempo de Início (segundos)
                      </label>
                      <input 
                        id="edit-youtubeStartTime"
                        name="youtubeStartTime"
                        type="number"
                        min="0"
                        value={editingDashboard.youtubeStartTime || ''}
                        onChange={handleEditChange}
                        className="input"
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="form-field">
                      <label htmlFor="edit-youtubeEndTime" className="form-label">
                        <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tempo de Fim (segundos)
                      </label>
                      <input 
                        id="edit-youtubeEndTime"
                        name="youtubeEndTime"
                        type="number"
                        min="0"
                        value={editingDashboard.youtubeEndTime || ''}
                        onChange={handleEditChange}
                        className="input"
                        placeholder="Deixe em branco para reproduzir até o fim"
                      />
                    </div>
                    
                    <div className="form-field">
                      <label className="form-label">
                        <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                        </svg>
                        Opções do YouTube
                      </label>
                      <div className="checkbox-group">
                        <label className="checkbox-item">
                          <input 
                            type="checkbox"
                            name="youtubeAutoplay"
                            checked={editingDashboard.youtubeAutoplay}
                            onChange={handleEditChange}
                          />
                          <span className="checkmark"></span>
                          Reproduzir automaticamente
                        </label>
                        <label className="checkbox-item">
                          <input 
                            type="checkbox"
                            name="youtubeMute"
                            checked={editingDashboard.youtubeMute}
                            onChange={handleEditChange}
                          />
                          <span className="checkmark"></span>
                          Iniciar mutado
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-success">
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar Alterações
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingDashboard(null)}
                  className="btn btn-secondary"
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Formulário para adicionar novo dashboard */}
      <div className="add-form-section">
        <div className="section-header">
          <h3 className="section-title">
            <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Adicionar Novo Dashboard
          </h3>
          <p className="section-subtitle">
            Preencha os campos abaixo para criar um novo dashboard
          </p>
        </div>
        
        <div className="form-container">
          <form onSubmit={handleSubmitNew} className="dashboard-form">
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="new-title" className="form-label">
                  <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Título
                </label>
                <input 
                  id="new-title"
                  name="title"
                  value={newDashboard.title}
                  onChange={handleNewDashboardChange}
                  className="input"
                  placeholder="Nome do Dashboard"
                  required
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="new-contentType" className="form-label">
                  <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Tipo de Conteúdo
                </label>
                <select 
                  id="new-contentType"
                  name="contentType"
                  value={newDashboard.contentType}
                  onChange={handleNewDashboardChange}
                  className="input"
                  required
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="youtube">Vídeo do YouTube</option>
                </select>
              </div>
              
              <div className="form-field">
                <label htmlFor="new-url" className="form-label">
                  <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  URL
                </label>
                <input 
                  id="new-url"
                  name="url"
                  value={newDashboard.url}
                  onChange={handleNewDashboardChange}
                  className={`input ${urlError ? 'error' : ''}`}
                  placeholder={newDashboard.contentType === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://exemplo.com'}
                  required
                />
                {urlError && <span className="error-message">{urlError}</span>}
                {newDashboard.contentType === 'youtube' && (
                  <div className="input-help">
                    <svg className="help-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Cole a URL do vídeo do YouTube (ex: https://youtube.com/watch?v=VIDEO_ID)
                  </div>
                )}
              </div>
              
              <div className="form-field">
                <label htmlFor="new-duration" className="form-label">
                  <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Duração (segundos)
                </label>
                <input 
                  id="new-duration"
                  name="duration"
                  type="number"
                  min="1"
                  value={newDashboard.duration}
                  onChange={handleNewDashboardChange}
                  className="input"
                  required
                />
              </div>

              {/* Campos específicos do YouTube */}
              {newDashboard.contentType === 'youtube' && (
                <>
                  <div className="form-field">
                    <label htmlFor="new-youtubeStartTime" className="form-label">
                      <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tempo de Início (segundos)
                    </label>
                    <input 
                      id="new-youtubeStartTime"
                      name="youtubeStartTime"
                      type="number"
                      min="0"
                      value={newDashboard.youtubeStartTime || ''}
                      onChange={handleNewDashboardChange}
                      className="input"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="form-field">
                    <label htmlFor="new-youtubeEndTime" className="form-label">
                      <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tempo de Fim (segundos)
                    </label>
                    <input 
                      id="new-youtubeEndTime"
                      name="youtubeEndTime"
                      type="number"
                      min="0"
                      value={newDashboard.youtubeEndTime || ''}
                      onChange={handleNewDashboardChange}
                      className="input"
                      placeholder="Deixe em branco para reproduzir até o fim"
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="form-label">
                      <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                      </svg>
                      Opções do YouTube
                    </label>
                    <div className="checkbox-group">
                      <label className="checkbox-item">
                        <input 
                          type="checkbox"
                          name="youtubeAutoplay"
                          checked={newDashboard.youtubeAutoplay}
                          onChange={handleNewDashboardChange}
                        />
                        <span className="checkmark"></span>
                        Reproduzir automaticamente
                      </label>
                      <label className="checkbox-item">
                        <input 
                          type="checkbox"
                          name="youtubeMute"
                          checked={newDashboard.youtubeMute}
                          onChange={handleNewDashboardChange}
                        />
                        <span className="checkmark"></span>
                        Iniciar mutado
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg">
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Adicionar Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}