import { useState, useRef } from 'react';
import { useDashboards } from '../contexts/DashboardContext';
import '../styles/DashboardEditor.css';

export default function DashboardEditor() {
  const { 
    dashboards, 
    addDashboard, 
    updateDashboard, 
    removeDashboard, 
    reorderDashboards 
  } = useDashboards();
  
  const [editingDashboard, setEditingDashboard] = useState(null);
  const [newDashboard, setNewDashboard] = useState({
    title: '',
    url: '',
    duration: 60
  });
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });
  const [urlError, setUrlError] = useState('');
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  
  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  const showFeedback = (message, type) => {
    setFeedback({ show: true, message, type });
    setTimeout(() => {
      setFeedback({ show: false, message: '', type: '' });
    }, 3000);
  };
  
  const handleNewDashboardChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'url') {
      setUrlError('');
    }
    
    setNewDashboard({
      ...newDashboard,
      [name]: name === 'duration' ? parseInt(value, 10) || 0 : value
    });
  };
  
  const handleSubmitNew = (e) => {
    e.preventDefault();
    
    if (!validateUrl(newDashboard.url)) {
      setUrlError('Por favor, insira uma URL válida (ex: https://exemplo.com)');
      return;
    }
    
    addDashboard(newDashboard);
    setNewDashboard({ title: '', url: '', duration: 60 });
    showFeedback('Dashboard adicionado com sucesso!', 'success');
  };
  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'url') {
      setUrlError('');
    }
    
    setEditingDashboard({
      ...editingDashboard,
      [name]: name === 'duration' ? parseInt(value, 10) || 0 : value
    });
  };
  
  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    if (!validateUrl(editingDashboard.url)) {
      setUrlError('Por favor, insira uma URL válida (ex: https://exemplo.com)');
      return;
    }
    
    updateDashboard(editingDashboard.id, editingDashboard);
    setEditingDashboard(null);
    showFeedback('Dashboard atualizado com sucesso!', 'success');
  };
  
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
  };
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
    dragOverItem.current = index;
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDragEnter = (e) => {
    e.target.classList.add('drag-over');
  };
  
  const handleDragLeave = (e) => {
    e.target.classList.remove('drag-over');
  };
  
  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    const elements = document.querySelectorAll('.drag-over');
    elements.forEach(el => el.classList.remove('drag-over'));
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    
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
  
  const handleDelete = (id, title) => {
    if (window.confirm(`Tem certeza que deseja remover o dashboard "${title}"?`)) {
      removeDashboard(id);
      showFeedback('Dashboard removido!', 'warning');
    }
  };
  
  return (
    <div className="dashboard-editor">
      <h2>Gerenciar Dashboards</h2>
      
      {/* Mensagem de feedback */}
      {feedback.show && (
        <div className={`feedback-message ${feedback.type}`}>
          {feedback.message}
        </div>
      )}
      
      {/* Lista de dashboards */}
      <div className="dashboards-list">
        <h3>Dashboards Configurados</h3>
        {dashboards.length === 0 ? (
          <p>Nenhum dashboard configurado. Adicione um abaixo.</p>
        ) : (
          <ul className="dashboard-items">
            {dashboards.map((dashboard, index) => (
              <li 
                key={dashboard.id} 
                className="dashboard-item"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
              >
                <div className="dashboard-info">
                  <h4>{dashboard.title}</h4>
                  <div className="dashboard-details">
                    <span>Duração: {dashboard.duration}s</span>
                    <span className="truncate-url">URL: {dashboard.url}</span>
                  </div>
                </div>
                <div className="dashboard-actions">
                  <button 
                    onClick={() => setEditingDashboard(dashboard)}
                    className="edit-btn"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(dashboard.id, dashboard.title)}
                    className="delete-btn"
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Formulário para editar dashboard */}
      {editingDashboard && (
        <div className="edit-form-container">
          <h3>Editar Dashboard</h3>
          <form onSubmit={handleEditSubmit} className="dashboard-form">
            <div className="form-field">
              <label htmlFor="edit-title">Título:</label>
              <input 
                id="edit-title"
                name="title"
                value={editingDashboard.title}
                onChange={handleEditChange}
                required
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="edit-url">URL:</label>
              <input 
                id="edit-url"
                name="url"
                value={editingDashboard.url}
                onChange={handleEditChange}
                required
              />
              {urlError && <span className="error-message">{urlError}</span>}
            </div>
            
            <div className="form-field">
              <label htmlFor="edit-duration">Duração (segundos):</label>
              <input 
                id="edit-duration"
                name="duration"
                type="number"
                min="1"
                value={editingDashboard.duration}
                onChange={handleEditChange}
                required
              />
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="save-btn">Salvar</button>
              <button 
                type="button" 
                onClick={() => setEditingDashboard(null)}
                className="cancel-btn"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Formulário para adicionar novo dashboard */}
      <div className="add-form-container">
        <h3>Adicionar Novo Dashboard</h3>
        <form onSubmit={handleSubmitNew} className="dashboard-form">
          <div className="form-field">
            <label htmlFor="new-title">Título:</label>
            <input 
              id="new-title"
              name="title"
              value={newDashboard.title}
              onChange={handleNewDashboardChange}
              placeholder="Nome do Dashboard"
              required
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="new-url">URL:</label>
            <input 
              id="new-url"
              name="url"
              value={newDashboard.url}
              onChange={handleNewDashboardChange}
              placeholder="https://..."
              required
            />
            {urlError && <span className="error-message">{urlError}</span>}
          </div>
          
          <div className="form-field">
            <label htmlFor="new-duration">Duração (segundos):</label>
            <input 
              id="new-duration"
              name="duration"
              type="number"
              min="1"
              value={newDashboard.duration}
              onChange={handleNewDashboardChange}
              required
            />
          </div>
          
          <button type="submit" className="add-btn">Adicionar Dashboard</button>
        </form>
      </div>
    </div>
  );
}