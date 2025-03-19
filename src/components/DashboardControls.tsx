import { useDashboards } from '../contexts/DashboardContext';
import '../styles/DashboardControls.css';

interface DashboardControlsProps {
  showPreview?: boolean;
}

export default function DashboardControls({ showPreview = false }: DashboardControlsProps) {
  const { 
    dashboards,
    currentIndex,
    goToDashboard,
    nextDashboard,
    previousDashboard,
    isPlaying,
    setIsPlaying,
    currentDashboard
  } = useDashboards();
  
  return (
    <div className={`dashboard-controls ${showPreview ? 'with-preview' : ''}`}>
      <div className="controls-container">
        <div className="navigation-controls">
          <button onClick={previousDashboard} className="nav-btn">
            ⬅️ Anterior
          </button>
          
          <select 
            value={currentIndex}
            onChange={(e) => goToDashboard(Number(e.target.value))}
            className="dashboard-select"
          >
            {dashboards.map((dashboard, index) => (
              <option key={dashboard.id} value={index}>
                {dashboard.title}
              </option>
            ))}
          </select>
          
          <button onClick={nextDashboard} className="nav-btn">
            Próximo ➡️
          </button>
        </div>
        
        <div className="playback-controls">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`play-btn ${isPlaying ? 'playing' : ''}`}
          >
            {isPlaying ? '⏸️ Pausar' : '▶️ Iniciar'} Rotação
          </button>
        </div>
      </div>
      
      {currentDashboard && (
        <div className="current-info">
          <h3>{currentDashboard.title}</h3>
          <div className="time-indicator">
            {isPlaying 
              ? `Alternando em ${currentDashboard.duration} segundos` 
              : 'Rotação pausada'}
          </div>
          
          {showPreview && (
            <div className="dashboard-preview">
              <h4>Prévia:</h4>
              <iframe 
                src={currentDashboard.url} 
                title={`Prévia de ${currentDashboard.title}`}
                className="preview-frame"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}