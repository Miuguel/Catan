import { useState, useCallback } from "react";
import KeyboardSound from "./KeyboardSound";
import styles from "../styles/PlayerSelection.module.css";

interface PlayerSelectionProps {
  onBack: () => void;
  onConfirm: (playerName: string) => void;
}

interface AvatarOption {
  id: string;
  src: string;
  alt: string;
}


const PlayerSelection: React.FC<PlayerSelectionProps> = ({ onBack, onConfirm }) => {
  const [playerName, setPlayerName] = useState<string>("");
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState<number>(0);

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

  const getIndex = (offset: number): number => {
    return (currentAvatarIndex + offset + avatars.length) % avatars.length;
  };

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
  }, []);

  const handlePrevAvatar = useCallback(() => {
    setCurrentAvatarIndex((prev) =>
      prev === 0 ? avatars.length - 1 : prev - 1
    );
  }, [avatars.length]);

  const handleNextAvatar = useCallback(() => {
    setCurrentAvatarIndex((prev) =>
      prev === avatars.length - 1 ? 0 : prev + 1
    );
  }, [avatars.length]);

  const handleConfirm = useCallback(() => {
    if (!playerName.trim()) {
      alert("Por favor, insira um nome para seu personagem.");
      return;
    }
    onConfirm(playerName.trim());
  }, [playerName, onConfirm]);

  const currentAvatar = avatars[currentAvatarIndex];

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
            Nome do Aventureiro
          </label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={handleNameChange}
            placeholder="Digite seu nome..."
            className={styles.nameInput}
            maxLength={20}
            autoComplete="off"
          />
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
              {visibleSlots.map((slot) => (
                <div
                  key={slot.avatar.id}
                  className={`${styles.avatarSlot} ${slot.posClass}`}
                >
                  {slot.offset === 0 ? (
                    <div className={styles.avatarFrame}>
                      <img
                        src={slot.avatar.src}
                        alt={slot.avatar.alt}
                        className={styles.avatarImgMain}
                        draggable={false}
                      />
                    </div>
                  ) : (
                    <img
                      src={slot.avatar.src}
                      alt={slot.avatar.alt}
                      className={styles.avatarImgSide}
                      draggable={false}
                    />
                  )}
                </div>
              ))}
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
              {currentAvatarIndex + 1} / {avatars.length}
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
            Confirmar
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onBack}
            onMouseEnter={() => window.__hoverSounds?.playHoverSound?.()}
          >
            Voltar
          </button>
        </div>
      </div>
      <KeyboardSound src="/assets/audio/keyboard.mp3" volume={0.5} />
    </div>
  );
};

export default PlayerSelection;
