import { useEffect, useState } from 'react';
import DashboardViewer from '../components/DashboardViewer';
import { useDashboards } from '../contexts/DashboardContext';

const TvDisplayPage = () => {
  const { 
    dashboards, 
    //currentIndex,
    socketConnected,
    connectSocket
  } = useDashboards();
  const [tvName, setTvName] = useState<string>('');
  const [showNameForm, setShowNameForm] = useState<boolean>(true);

  useEffect(() => {
    const savedTvName = localStorage.getItem('tvName');
    if (savedTvName) {
      setTvName(savedTvName);
      setShowNameForm(false);
      connectSocket('tv', savedTvName);
    }
  }, [connectSocket]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tvName.trim()) {
      localStorage.setItem('tvName', tvName);
      setShowNameForm(false);
      connectSocket('tv', tvName);
    }
  };

  if (showNameForm) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg w-11/12 max-w-md">
          <h2 className="text-xl font-bold mb-4">Identificação da TV</h2>
          <p className="mb-6 text-gray-400">Digite um nome para identificar esta TV no painel de controle</p>
          <form onSubmit={handleNameSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={tvName}
              onChange={(e) => setTvName(e.target.value)}
              placeholder="Ex: TV Sala de Reuniões"
              className="p-3 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
            <button 
              type="submit" 
              className="p-3 rounded bg-green-600 hover:bg-green-500 text-white font-bold transition"
            >
              Confirmar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      {dashboards.length === 0 ? (
        <div className="text-center text-white bg-black bg-opacity-60 p-8 rounded-lg max-w-lg">
          <h2 className="text-2xl font-bold mb-4">Aguardando conteúdo</h2>
          <p className="mb-4">Configure dashboards no painel de administração.</p>
          <div className={`flex items-center justify-center gap-2 p-3 rounded ${socketConnected ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
            <div className={`w-3 h-3 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">{socketConnected ? 'Conectado ao servidor' : 'Desconectado do servidor'}</span>
          </div>
        </div>
      ) : (
        <DashboardViewer />
      )}
    </div>
  );
};

export default TvDisplayPage;