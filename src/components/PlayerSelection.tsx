import { useState, useCallback } from "react";
import KeyboardSound from "./KeyboardSound";
import AvatarArrowSound from "./AvatarArrowSound";
import styles from "../styles/PlayerSelection.module.css";

interface PlayerSelectionProps {
  onBack: () => void;
  onConfirm: (player1Name: string, player2Name: string) => void;
}

interface AvatarOption {
  id: string;
  src: string;
  alt: string;
}

interface PlayerData {
  name: string;
  avatarIndex: number;
}


const PlayerSelection: React.FC<PlayerSelectionProps> = ({ onBack, onConfirm }) => {
  const [currentPlayerNumber, setCurrentPlayerNumber] = useState<number>(1);
  const [player1, setPlayer1] = useState<PlayerData>({ name: "", avatarIndex: 0 });
  const [player2, setPlayer2] = useState<PlayerData>({ name: "", avatarIndex: 0 });

  const avatars: AvatarOption[] = [
    { id: "avatar1", src: "/assets/images/avatars/avatar1.png", alt: "Cavaleiro" },
    { id: "avatar2", src: "/assets/images/avatars/avatar2.png", alt: "Mercador" },
    { id: "avatar3", src: "/assets/images/avatars/avatar3.png", alt: "Fazendeira" },
    { id: "avatar4", src: "/assets/images/avatars/avatar4.png", alt: "Pirata" },
    { id: "avatar5", src: "/assets/images/avatars/avatar5.png", alt: "Monge" },
    { id: "avatar6", src: "/assets/images/avatars/avatar6.png", alt: "Rainha" },
    { id: "avatar7", src: "/assets/images/avatars/avatar7.png", alt: "Ferreiro" },
    { id: "avatar8", src: "/assets/images/avatars/avatar8.png", alt: "Exploradora" },
    { id: "avatar9", src: "/assets/images/avatars/avatar9.png", alt: "Arqueiro" },
    { id: "avatar10", src: "/assets/images/avatars/avatar10.png", alt: "Alquimista" },
  ];

  // Dados do jogador atualmente em seleção
  const currentPlayer = currentPlayerNumber === 1 ? player1 : player2;
  const setCurrentPlayer = currentPlayerNumber === 1 ? setPlayer1 : setPlayer2;

  const getIndex = (offset: number): number => {
    return (currentPlayer.avatarIndex + offset + avatars.length) % avatars.length;
  };

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPlayer({ ...currentPlayer, name: e.target.value });
  }, [currentPlayer, setCurrentPlayer]);

  const handlePrevAvatar = useCallback(() => {
    window.__avatarSounds?.playAvatarArrowSound?.();
    setCurrentPlayer({
      ...currentPlayer,
      avatarIndex: currentPlayer.avatarIndex === 0 ? avatars.length - 1 : currentPlayer.avatarIndex - 1,
    });
  }, [currentPlayer, setCurrentPlayer, avatars.length]);

  const handleNextAvatar = useCallback(() => {
    window.__avatarSounds?.playAvatarArrowSound?.();
    setCurrentPlayer({
      ...currentPlayer,
      avatarIndex: currentPlayer.avatarIndex === avatars.length - 1 ? 0 : currentPlayer.avatarIndex + 1,
    });
  }, [currentPlayer, setCurrentPlayer, avatars.length]);

  // Ao clicar em confirmar
  const handleConfirm = useCallback(() => {
    window.__clickSounds?.playClickSound?.();
    // Se faltou inserir nome válido, alertar
    if (!currentPlayer.name.trim()) {
      alert(`Por favor, insira um nome para o Jogador ${currentPlayerNumber}.`);
      return;
    }

    if (currentPlayerNumber === 1) {
      // Ir para o segundo jogador
      setCurrentPlayerNumber(2);
    } else {
      // Validar que Jogador 2 tem nome diferente
      if (currentPlayer.name.trim().toLowerCase() === player1.name.trim().toLowerCase()) {
        alert("O Jogador 2 não pode ter o mesmo nome do Jogador 1!");
        return;
      }
      
      // Validar que Jogador 2 tem avatar diferente
      if (currentPlayer.avatarIndex === player1.avatarIndex) {
        alert("O Jogador 2 não pode escolher o mesmo avatar do Jogador 1!");
        return;
      }

      // Confirmar ambos os jogadores
      onConfirm(player1.name.trim(), player2.name.trim());
    }
  }, [currentPlayer, currentPlayerNumber, player1, player2, onConfirm]);

  const handleBack = useCallback(() => {
    window.__clickSounds?.playClickSound?.();
    if (currentPlayerNumber === 1) {
      onBack();
    } else {
      // Voltar para o primeiro jogador
      setCurrentPlayerNumber(1);
    }
  }, [currentPlayerNumber, onBack]);

  const currentAvatar = avatars[currentPlayer.avatarIndex];

  // Verificar se o nome atual é igual ao do outro jogador
  const isDuplicateName = currentPlayerNumber === 2 && 
    currentPlayer.name.trim().toLowerCase() === player1.name.trim().toLowerCase();

  // Verificar se o avatar atual é igual ao do outro jogador
  const isDuplicateAvatar = currentPlayerNumber === 2 && currentPlayer.avatarIndex === player1.avatarIndex;

  // Posições visíveis: -2, -1, 0, +1, +2
  const visibleSlots = [
    { offset: -2, avatar: avatars[getIndex(-2)], posClass: styles.posFarLeft },
    { offset: -1, avatar: avatars[getIndex(-1)], posClass: styles.posNearLeft },
    { offset: 0, avatar: avatars[getIndex(0)], posClass: styles.posCenter },
    { offset: 1, avatar: avatars[getIndex(1)], posClass: styles.posNearRight },
    { offset: 2, avatar: avatars[getIndex(2)], posClass: styles.posFarRight },
  ];

  return (
    <div className={styles.backdrop}>
      <div className={styles.panel}>
        {/* Cabeçalho */}

        <div className={styles.header}>
          <div className={styles.headerOrnament} />
          <h1 className={styles.title}>Escolha seu Personagem</h1>
          <div className={styles.headerOrnament} />
        </div>

        

        {/* Campo de nome */}
        <div className={styles.nameSection}>
          <label htmlFor="playerName" className={styles.label}>
            Nome do Aventureiro - <u><strong>Jogador {currentPlayerNumber}</strong></u>
          </label>
          <input
            id="playerName"
            type="text"
            value={currentPlayer.name}
            onChange={handleNameChange}
            placeholder="Digite seu nome..."
            className={styles.nameInput}
            maxLength={20}
            autoComplete="off"
          />
          {isDuplicateName && (
            <div style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "4px", fontWeight: "500" }}>
              ❌ Este nome já foi escolhido!
            </div>
          )}
        </div>

        {/* Carrossel 3D de avatares */}
        <div className={styles.avatarSection}>
          <h2 className={styles.subtitle}>Escolha seu Avatar</h2>

          <div className={styles.carouselWrapper}>
            {/* Seta esquerda */}
            <button
              type="button"
              className={`${styles.arrowBtn} ${styles.arrowLeft}`}
              onClick={handlePrevAvatar}
              onMouseEnter={() => window.__hoverSounds?.playHoverSound?.()}
              aria-label="Avatar anterior"
            >
              <svg
                className={styles.arrowIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Trilha 3D */}
            <div className={styles.carouselTrack}>
              {visibleSlots.map((slot) => {
                // Se for Jogador 2 e este avatar é o mesmo do Jogador 1, marcar como indisponível
                const isUnavailable = currentPlayerNumber === 2 && slot.avatar.id === avatars[player1.avatarIndex].id;
                
                return (
                  <div
                    key={slot.avatar.id}
                    className={`${styles.avatarSlot} ${slot.posClass} ${isUnavailable ? styles.avatarUnavailable : ""}`}
                  >
                    {slot.offset === 0 ? (
                      <div className={styles.avatarFrame}>
                        <img
                          src={slot.avatar.src}
                          alt={slot.avatar.alt}
                          className={styles.avatarImgMain}
                          draggable={false}
                          style={isUnavailable ? { opacity: 0.4 } : {}}
                        />
                        {isUnavailable && slot.offset === 0 && (
                          <div style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            color: "#ff6b6b",
                            fontSize: "12px",
                            fontWeight: "bold",
                            textAlign: "center",
                            pointerEvents: "none",
                            zIndex: 10,
                          }}>
                            Já escolhido!
                          </div>
                        )}
                      </div>
                    ) : (
                      <img
                        src={slot.avatar.src}
                        alt={slot.avatar.alt}
                        className={styles.avatarImgSide}
                        draggable={false}
                        style={isUnavailable ? { opacity: 0.4 } : {}}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Seta direita */}
            <button
              type="button"
              className={`${styles.arrowBtn} ${styles.arrowRight}`}
              onClick={handleNextAvatar}
              onMouseEnter={() => window.__hoverSounds?.playHoverSound?.()}
              aria-label="Próximo avatar"
            >
              <svg
                className={styles.arrowIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Nome e contador */}
          <div className={styles.avatarInfo}>
            <span className={styles.avatarName}>{currentAvatar.alt}</span>
            <span className={styles.avatarCounter}>
              {currentPlayer.avatarIndex + 1} / {avatars.length}
            </span>
          </div>
        </div>

        {/* Botões de ação */}
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleConfirm}
            onMouseEnter={() => window.__hoverSounds?.playHoverSound?.()}
          >
            {currentPlayerNumber === 1 ? "Próximo Jogador" : "Iniciar Jogo"}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={handleBack}
            onMouseEnter={() => window.__hoverSounds?.playHoverSound?.()}
          >
            {currentPlayerNumber === 1 ? "Voltar" : "Voltar ao Jogador 1"}
          </button>
        </div>
      </div>
      <KeyboardSound src="/assets/audio/keyboard.mp3" volume={0.5} />
      <AvatarArrowSound src="/assets/audio/slice_avatars.wav" volume={0.5} />
    </div>
  );
};

export default PlayerSelection;
