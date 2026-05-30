import React, { useState } from 'react';
import '../styles/trade-modal.css';

interface PlayerOption {
  name: string;
  avatarSrc: string;
}

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayerName: string;
  otherPlayers: PlayerOption[];
}

const RESOURCES = ['Tijolo', 'Madeira', 'Lã', 'Trigo', 'Minério'];
const RESOURCE_ICONS = {
  'Tijolo': '🧱',
  'Madeira': '🪵',
  'Lã': '🐑',
  'Trigo': '🌾',
  'Minério': '⛏️'
};
const RESOURCE_NAMES = {
  'Tijolo': 'Ovelha',
  'Madeira': 'Trigo',
  'Lã': 'Minério',
  'Trigo': 'Madeira',
  'Minério': 'Tijolo'
};

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  currentPlayerName,
  otherPlayers
}) => {
  const [activeTab, setActiveTab] = useState<'player' | 'bank'>('player');
  const [selectedPlayer, setSelectedPlayer] = useState(otherPlayers.length > 0 ? otherPlayers[0].name : '');
  const [offering, setOffering] = useState<Record<string, number>>({
    'Tijolo': 0,
    'Madeira': 0,
    'Lã': 0,
    'Trigo': 0,
    'Minério': 0
  });
  const [requesting, setRequesting] = useState<Record<string, number>>({
    'Tijolo': 0,
    'Madeira': 0,
    'Lã': 0,
    'Trigo': 0,
    'Minério': 0
  });

  const handleOfferingChange = (resource: string, value: number) => {
    setOffering(prev => ({
      ...prev,
      [resource]: Math.max(0, value)
    }));
  };

  const handleRequestingChange = (resource: string, value: number) => {
    setRequesting(prev => ({
      ...prev,
      [resource]: Math.max(0, value)
    }));
  };

  const getOfferingText = () => {
    return RESOURCES
      .filter(r => offering[r] > 0)
      .map(r => `${offering[r]} ${r}`)
      .join(', ') || 'Nada';
  };

  const getRequestingText = () => {
    return RESOURCES
      .filter(r => requesting[r] > 0)
      .map(r => `${requesting[r]} ${r}`)
      .join(', ') || 'Nada';
  };

  const handleSubmit = () => {
    console.log('Trade submitted:', {
      type: activeTab,
      partner: activeTab === 'player' ? selectedPlayer : 'Banco',
      offering,
      requesting
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="trade-modal-overlay">
      <div className="trade-modal">
        <div className="trade-modal__header">
          <h2>CENTRAL DE NEGOCIAÇÃO</h2>
          <button className="trade-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="trade-modal__tabs">
          <button
            className={`trade-modal__tab ${activeTab === 'player' ? 'active' : ''}`}
            onClick={() => setActiveTab('player')}
          >
            JOGADOR
          </button>
          <button
            className={`trade-modal__tab ${activeTab === 'bank' ? 'active' : ''}`}
            onClick={() => setActiveTab('bank')}
          >
            BANCO
          </button>
        </div>

        {activeTab === 'player' && (
          <div className="trade-modal__player-selector">
            <label>Com quem deseja negociar?</label>
            <div className="trade-modal__player-options">
              {otherPlayers.map(player => (
                <button
                  key={player.name}
                  className={`trade-modal__player-option ${selectedPlayer === player.name ? 'active' : ''}`}
                  onClick={() => setSelectedPlayer(player.name)}
                >
                  <img src={player.avatarSrc} alt={player.name} className="trade-modal__player-avatar" />
                  <span className="trade-modal__player-name">{player.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="trade-modal__content">
          <div className="trade-modal__section">
            <h3>O QUE VOCÊ OFERECE</h3>
            <div className="trade-modal__resources">
              {RESOURCES.map(resource => (
                <div key={resource} className="trade-modal__resource-card">
                  <span className="trade-modal__resource-icon-large">
                    {RESOURCE_ICONS[resource as keyof typeof RESOURCE_ICONS]}
                  </span>
                  <span style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', minWidth: '70px' }}>
                    {resource}
                  </span>
                  <div className="trade-modal__resource-controls-vertical">
                    <button
                      onClick={() => handleOfferingChange(resource, offering[resource] - 1)}
                      className="trade-modal__btn-minus"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={offering[resource]}
                      onChange={(e) => handleOfferingChange(resource, parseInt(e.target.value) || 0)}
                      className="trade-modal__input"
                      min="0"
                    />
                    <button
                      onClick={() => handleOfferingChange(resource, offering[resource] + 1)}
                      className="trade-modal__btn-plus"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="trade-modal__section">
            <h3>O QUE VOCÊ PEDE</h3>
            <div className="trade-modal__resources">
              {RESOURCES.map(resource => (
                <div key={resource} className="trade-modal__resource-card">
                  <span className="trade-modal__resource-icon-large">
                    {RESOURCE_ICONS[resource as keyof typeof RESOURCE_ICONS]}
                  </span>
                  <span style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', minWidth: '70px' }}>
                    {resource}
                  </span>
                  <div className="trade-modal__resource-controls-vertical">
                    <button
                      onClick={() => handleRequestingChange(resource, requesting[resource] - 1)}
                      className="trade-modal__btn-minus"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={requesting[resource]}
                      onChange={(e) => handleRequestingChange(resource, parseInt(e.target.value) || 0)}
                      className="trade-modal__input"
                      min="0"
                    />
                    <button
                      onClick={() => handleRequestingChange(resource, requesting[resource] + 1)}
                      className="trade-modal__btn-plus"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="trade-modal__summary">
          <div className="trade-modal__summary-item">
            <strong>Você oferece:</strong>
            <p>{getOfferingText()}</p>
          </div>
          <div className="trade-modal__summary-item">
            <strong>Você pede:</strong>
            <p>{getRequestingText()}</p>
          </div>
        </div>

        <div className="trade-modal__actions">
          <button className="trade-modal__btn-submit" onClick={handleSubmit}>
            ✓ ENVIAR OFERTA
          </button>
          <button className="trade-modal__btn-cancel" onClick={onClose}>
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
};
