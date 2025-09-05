import { useState, useEffect } from 'react';
import { Device, DeviceType, DeviceSpecs, DeviceUpdateData } from '../types/Device';
import '../styles/DeviceEditor.css';

interface DeviceEditorProps {
  device: Device;
  isOpen: boolean;
  onClose: () => void;
  onSave: (deviceId: string, data: DeviceUpdateData) => void;
}

const DEVICE_TYPES: { value: DeviceType; label: string; icon: string }[] = [
  { value: 'tv', label: 'TV', icon: '📺' },
  { value: 'pc', label: 'PC/Desktop', icon: '🖥️' },
  { value: 'tablet', label: 'Tablet', icon: '📱' },
  { value: 'mobile', label: 'Celular', icon: '📱' },
  { value: 'other', label: 'Outro', icon: '🔧' }
];

export default function DeviceEditor({ device, isOpen, onClose, onSave }: DeviceEditorProps) {
  const [formData, setFormData] = useState<DeviceUpdateData>({
    name: device.name,
    type: device.type,
    specs: { ...device.specs },
    notes: device.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: device.name,
        type: device.type,
        specs: { ...device.specs },
        notes: device.notes || ''
      });
      setErrors({});
    }
  }, [device, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSpecsChange = (field: keyof DeviceSpecs, value: string) => {
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [field]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.type) {
      newErrors.type = 'Tipo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(device.id, formData);
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      name: device.name,
      type: device.type,
      specs: { ...device.specs },
      notes: device.notes || ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="device-editor-overlay">
      <div className="device-editor-modal">
        <div className="device-editor-header">
          <h2>Editar Dispositivo</h2>
          <button 
            onClick={handleCancel}
            className="close-btn"
            title="Fechar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="device-editor-form">
          {/* Informações Básicas */}
          <div className="form-section">
            <h3>Informações Básicas</h3>
            
            <div className="form-group">
              <label htmlFor="device-name">Nome do Dispositivo *</label>
              <input
                id="device-name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`input ${errors.name ? 'error' : ''}`}
                placeholder="Ex: TV Sala, PC Escritório, Tablet Cozinha"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="device-type">Tipo de Dispositivo *</label>
              <select
                id="device-type"
                value={formData.type || ''}
                onChange={(e) => handleInputChange('type', e.target.value as DeviceType)}
                className={`input ${errors.type ? 'error' : ''}`}
              >
                <option value="">Selecione o tipo</option>
                {DEVICE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
              {errors.type && <span className="error-message">{errors.type}</span>}
            </div>
          </div>

          {/* Especificações Técnicas */}
          <div className="form-section">
            <h3>Especificações Técnicas</h3>
            
            <div className="specs-grid">
              <div className="form-group">
                <label htmlFor="screen-size">Tamanho da Tela</label>
                <input
                  id="screen-size"
                  type="text"
                  value={formData.specs?.screenSize || ''}
                  onChange={(e) => handleSpecsChange('screenSize', e.target.value)}
                  className="input"
                  placeholder="Ex: 55 inch, 13.3 inch, 6.1 inch"
                />
              </div>

              <div className="form-group">
                <label htmlFor="resolution">Resolução</label>
                <input
                  id="resolution"
                  type="text"
                  value={formData.specs?.resolution || ''}
                  onChange={(e) => handleSpecsChange('resolution', e.target.value)}
                  className="input"
                  placeholder="Ex: 1920x1080, 2560x1440, 1170x2532"
                />
              </div>

              <div className="form-group">
                <label htmlFor="os">Sistema Operacional</label>
                <input
                  id="os"
                  type="text"
                  value={formData.specs?.operatingSystem || ''}
                  onChange={(e) => handleSpecsChange('operatingSystem', e.target.value)}
                  className="input"
                  placeholder="Ex: Android, iOS, Windows, macOS"
                />
              </div>

              <div className="form-group">
                <label htmlFor="browser">Navegador</label>
                <input
                  id="browser"
                  type="text"
                  value={formData.specs?.browser || ''}
                  onChange={(e) => handleSpecsChange('browser', e.target.value)}
                  className="input"
                  placeholder="Ex: Chrome, Safari, Firefox, Edge"
                />
              </div>

              <div className="form-group">
                <label htmlFor="processor">Processador</label>
                <input
                  id="processor"
                  type="text"
                  value={formData.specs?.processor || ''}
                  onChange={(e) => handleSpecsChange('processor', e.target.value)}
                  className="input"
                  placeholder="Ex: Intel i5, Apple M1, Snapdragon 888"
                />
              </div>

              <div className="form-group">
                <label htmlFor="memory">Memória</label>
                <input
                  id="memory"
                  type="text"
                  value={formData.specs?.memory || ''}
                  onChange={(e) => handleSpecsChange('memory', e.target.value)}
                  className="input"
                  placeholder="Ex: 8GB RAM, 16GB RAM"
                />
              </div>

              <div className="form-group">
                <label htmlFor="storage">Armazenamento</label>
                <input
                  id="storage"
                  type="text"
                  value={formData.specs?.storage || ''}
                  onChange={(e) => handleSpecsChange('storage', e.target.value)}
                  className="input"
                  placeholder="Ex: 256GB SSD, 512GB SSD"
                />
              </div>

              <div className="form-group">
                <label htmlFor="network">Rede</label>
                <input
                  id="network"
                  type="text"
                  value={formData.specs?.network || ''}
                  onChange={(e) => handleSpecsChange('network', e.target.value)}
                  className="input"
                  placeholder="Ex: WiFi 6, Ethernet, 5G"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="form-section">
            <h3>Observações</h3>
            <div className="form-group">
              <label htmlFor="notes">Notas e Observações</label>
              <textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="input"
                rows={3}
                placeholder="Adicione observações sobre o dispositivo, localização, configurações especiais, etc."
              />
            </div>
          </div>

          {/* Ações */}
          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
