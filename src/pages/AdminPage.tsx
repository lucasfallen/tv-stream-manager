import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDashboards } from '../contexts/DashboardContext';
import DashboardEditor from '../components/DashboardEditor';
import DashboardControls from '../components/DashboardControls';

export default function AdminPage() {
  const { 
    isEditMode, 
    setIsEditMode, 
    tvsList, 
    selectedTvId, 
    setSelectedTvId, 
    renameClient,
    socketConnected
  } = useDashboards();
  
  const [showTvLink, setShowTvLink] = useState(true);
  const [adminName, setAdminName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  
  useEffect(() => {
    const savedName = localStorage.getItem('adminName');
    if (savedName) {
      setAdminName(savedName);
      renameClient(savedName);
    } else {
      const defaultName = `Admin-${Math.random().toString(36).substring(2, 6)}`;
      setAdminName(defaultName);
      localStorage.setItem('adminName', defaultName);
      renameClient(defaultName);
    }
  }, [renameClient]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminName.trim()) {
      localStorage.setItem('adminName', adminName);
      renameClient(adminName);
      setIsEditingName(false);
    }
  };

  const handleTvSelect = (tvId: string) => {
    setSelectedTvId(tvId);
  };

  const handleSelectAllTvs = () => {
    setSelectedTvId(null);
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-start">
          <h1 className="text-2xl font-bold">Gerenciador de TVs</h1>
          <div>
            {isEditingName ? (
              <form onSubmit={handleNameSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
                  Salvar
                </button>
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                  onClick={() => setIsEditingName(false)}
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsEditingName(true)}>
                <span className="text-lg">Admin: <strong>{adminName}</strong></span>
                <span className="text-blue-500">✏️</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded ${socketConnected ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
            <div className={`w-3 h-3 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{socketConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
          {showTvLink && (
            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
              <p>Abra a TV neste link: <Link to="/" target="_blank" className="text-blue-500 underline">Abrir TV</Link></p>
              <button 
                className="text-gray-500 hover:text-black"
                onClick={() => setShowTvLink(false)}
                title="Fechar"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </header>
      
      <div className="space-y-6">
        <section className="p-4 bg-white rounded shadow">
          <h2 className="text-lg font-bold mb-4">TVs Conectadas</h2>
          {tvsList.length > 0 ? (
            <div className="space-y-2">
              <button 
                className={`w-full flex justify-between items-center p-4 rounded border ${!selectedTvId ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'}`}
                onClick={handleSelectAllTvs}
              >
                <div>
                  <span className="font-bold">Todas as TVs</span>
                  <p className="text-sm text-gray-500">Modo transmissão para {tvsList.length} TVs</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>{tvsList.length} conectadas</span>
                </div>
              </button>
              {tvsList.map(tv => (
                <button 
                  key={tv.id}
                  className={`w-full flex justify-between items-center p-4 rounded border ${selectedTvId === tv.id ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'}`}
                  onClick={() => handleTvSelect(tv.id)}
                >
                  <div>
                    <span className="font-bold">{tv.name}</span>
                    <p className="text-sm text-gray-500">
                      Dashboard: {tv.currentDashboardIndex + 1} • {tv.isPlaying ? 'Reproduzindo' : 'Pausado'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Online</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 italic">Nenhuma TV conectada. Abra uma nova janela com a URL da TV.</div>
          )}
        </section>
        
        <section className="p-4 bg-white rounded shadow">
          <div className="flex gap-4 mb-4">
            <button 
              className={`px-4 py-2 rounded ${!isEditMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setIsEditMode(false)}
            >
              Controle
            </button>
            <button 
              className={`px-4 py-2 rounded ${isEditMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setIsEditMode(true)}
            >
              Editor
            </button>
          </div>
          {selectedTvId ? (
            <div className="text-sm text-gray-700">
              Controle direcionado para: <strong>{tvsList.find(tv => tv.id === selectedTvId)?.name}</strong>
            </div>
          ) : (
            <div className="text-sm text-gray-700">
              Modo transmissão: os comandos serão enviados para todas as TVs conectadas.
            </div>
          )}
          {isEditMode ? <DashboardEditor /> : <DashboardControls showPreview={true} />}
        </section>
      </div>
    </div>
  );
}