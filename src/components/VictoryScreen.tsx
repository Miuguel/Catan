import React from "react";
import "../styles/victory-screen.css";

interface VictoryScreenProps {
  playerName: string;
  playerAvatarSrc: string;
  victoryPoints: number;
  onReturnToMenu: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({
  playerName,
  playerAvatarSrc,
  victoryPoints,
  onReturnToMenu,
}) => {
  return (
    <div className="victory-screen-overlay">
      <div className="victory-screen">
        {/* Efeito de confete de fundo */}
        <div className="victory-confetti"></div>

        {/* Conteúdo principal */}
        <div className="victory-content">
          {/* Título de vitória */}
          <div className="victory-title">
            <h1>VITÓRIA!</h1>
          </div>

          {/* Avatar do vencedor */}
          <div className="victory-avatar-container">
            <img
              src={playerAvatarSrc}
              alt={playerName}
              className="victory-avatar"
            />
            <div className="victory-glow"></div>
          </div>

          {/* Nome do vencedor */}
          <div className="victory-player-info">
            <h2 className="victory-player-name">{playerName}</h2>
            <p className="victory-subtitle">É o novo Mestre de Catã!</p>
          </div>

          {/* Pontuação final */}
          <div className="victory-score">
            <div className="score-label">Pontuação Final</div>
            <div className="score-value">{victoryPoints}</div>
          </div>

          {/* Botão de retorno */}
          <button
            className="victory-button"
            onClick={onReturnToMenu}
            onMouseEnter={() => window.__hoverSounds?.playHoverSound?.()}
            onMouseDown={() => window.__clickSounds?.playClickSound?.()}
          >
            Voltar ao Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default VictoryScreen;
