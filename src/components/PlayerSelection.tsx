import { useState, useCallback } from "react";
import KeyboardSound from "./KeyboardSound";
import AvatarArrowSound from "./AvatarArrowSound";
import styles from "../styles/PlayerSelection.module.css";

export interface PlayerConfig {
  name: string;
  avatarSrc: string;
  kind: "human" | "bot";
}

interface PlayerSelectionProps {
  onBack: () => void;
  onConfirm: (players: PlayerConfig[]) => void;
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

const BOT_NAMES = ["Bot Helena", "Bot Marco", "Bot Sofia"];

const AVATARS: AvatarOption[] = [
  {
    id: "avatar1",
    src: "/assets/images/avatars/avatar1.png",
    alt: "Cavaleiro",
  },
  {
    id: "avatar2",
    src: "/assets/images/avatars/avatar2.png",
    alt: "Mercador",
  },
  {
    id: "avatar3",
    src: "/assets/images/avatars/avatar3.png",
    alt: "Fazendeira",
  },
  { id: "avatar4", src: "/assets/images/avatars/avatar4.png", alt: "Pirata" },
  { id: "avatar5", src: "/assets/images/avatars/avatar5.png", alt: "Monge" },
  { id: "avatar6", src: "/assets/images/avatars/avatar6.png", alt: "Rainha" },
  {
    id: "avatar7",
    src: "/assets/images/avatars/avatar7.png",
    alt: "Ferreiro",
  },
  {
    id: "avatar8",
    src: "/assets/images/avatars/avatar8.png",
    alt: "Exploradora",
  },
  {
    id: "avatar9",
    src: "/assets/images/avatars/avatar9.png",
    alt: "Arqueiro",
  },
  {
    id: "avatar10",
    src: "/assets/images/avatars/avatar10.png",
    alt: "Alquimista",
  },
];

const PlayerSelection: React.FC<PlayerSelectionProps> = ({
  onBack,
  onConfirm,
}) => {
  const [humanPlayer, setHumanPlayer] = useState<PlayerData>({
    name: "",
    avatarIndex: 0,
  });
  const [botCount, setBotCount] = useState<2 | 3>(2);

  const getIndex = (offset: number): number => {
    return (humanPlayer.avatarIndex + offset + AVATARS.length) % AVATARS.length;
  };

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setHumanPlayer((currentPlayer) => ({
        ...currentPlayer,
        name: e.target.value,
      }));
    },
    [],
  );

  const handlePrevAvatar = useCallback(() => {
    window.__avatarSounds?.playAvatarArrowSound?.();
    setHumanPlayer((currentPlayer) => ({
      ...currentPlayer,
      avatarIndex:
        currentPlayer.avatarIndex === 0
          ? AVATARS.length - 1
          : currentPlayer.avatarIndex - 1,
    }));
  }, []);

  const handleNextAvatar = useCallback(() => {
    window.__avatarSounds?.playAvatarArrowSound?.();
    setHumanPlayer((currentPlayer) => ({
      ...currentPlayer,
      avatarIndex:
        currentPlayer.avatarIndex === AVATARS.length - 1
          ? 0
          : currentPlayer.avatarIndex + 1,
    }));
  }, []);

  // Ao clicar em confirmar
  const handleConfirm = useCallback(() => {
    window.__clickSounds?.playClickSound?.();
    // Se faltou inserir nome válido, alertar
    if (!humanPlayer.name.trim()) {
      alert("Por favor, insira um nome para o jogador humano.");
      return;
    }

    const botPlayers: PlayerConfig[] = Array.from(
      { length: botCount },
      (_, index) => ({
        name: BOT_NAMES[index] ?? `Bot ${index + 1}`,
        avatarSrc: AVATARS[(humanPlayer.avatarIndex + index + 1) % AVATARS.length].src,
        kind: "bot",
      }),
    );

    onConfirm([
      {
        name: humanPlayer.name.trim(),
        avatarSrc: AVATARS[humanPlayer.avatarIndex].src,
        kind: "human",
      },
      ...botPlayers,
    ]);
  }, [botCount, humanPlayer, onConfirm]);

  const handleBack = useCallback(() => {
    window.__clickSounds?.playClickSound?.();
    onBack();
  }, [onBack]);

  const currentAvatar = AVATARS[humanPlayer.avatarIndex];

  // Posições visíveis: -2, -1, 0, +1, +2
  const visibleSlots = [
    { offset: -2, avatar: AVATARS[getIndex(-2)], posClass: styles.posFarLeft },
    { offset: -1, avatar: AVATARS[getIndex(-1)], posClass: styles.posNearLeft },
    { offset: 0, avatar: AVATARS[getIndex(0)], posClass: styles.posCenter },
    { offset: 1, avatar: AVATARS[getIndex(1)], posClass: styles.posNearRight },
    { offset: 2, avatar: AVATARS[getIndex(2)], posClass: styles.posFarRight },
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
            value={humanPlayer.name}
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
              {visibleSlots.map((slot) => {
                return (
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
              {humanPlayer.avatarIndex + 1} / {AVATARS.length}
            </span>
          </div>
        </div>

        <div className={styles.botSection}>
          <span className={styles.label}>Adversários</span>
          <div className={styles.botOptions}>
            <button
              type="button"
              className={`${styles.botOption} ${botCount === 2 ? styles.botOptionActive : ""}`}
              onClick={() => setBotCount(2)}
              onMouseEnter={() => window.__hoverSounds?.playHoverSound?.()}
            >
              2 bots
            </button>
            <button
              type="button"
              className={`${styles.botOption} ${botCount === 3 ? styles.botOptionActive : ""}`}
              onClick={() => setBotCount(3)}
              onMouseEnter={() => window.__hoverSounds?.playHoverSound?.()}
            >
              3 bots
            </button>
          </div>
          <div className={styles.botPreview}>
            {Array.from({ length: botCount }, (_, index) => (
              <span key={BOT_NAMES[index]}>{BOT_NAMES[index]}</span>
            ))}
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
            Iniciar Jogo
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={handleBack}
            onMouseEnter={() => window.__hoverSounds?.playHoverSound?.()}
          >
            Voltar
          </button>
        </div>
      </div>
      <KeyboardSound src="/assets/audio/keyboard.mp3" volume={0.5} />
      <AvatarArrowSound src="/assets/audio/slice_avatars.wav" volume={0.5} />
    </div>
  );
};

export default PlayerSelection;
