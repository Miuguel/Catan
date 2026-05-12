import { useCallback } from "react";
import styles from "../styles/HoverButton.module.css";

export interface HoverButtonProps {
  imageSrc: string;
  alt: string; /* Texto alternativo para acessibilidade */
  left: string; /* Posição horizontal */
  top: string; /* Posição vertical */
  width: string;
  height: string;
  
  /* Função de callback ao clicar no botão */
  onClick: () => void;
}

const HoverButton: React.FC<HoverButtonProps> = ({
  imageSrc,
  alt,
  left,
  top,
  width,
  height,
  onClick,
}) => {
  const handleMouseEnter = useCallback(() => {
    // Toca o som de hover
    window.__hoverSounds?.playHoverSound?.();
  }, []);

  const handleClick = useCallback(() => {
    // Toca o som de clique
    window.__clickSounds?.playClickSound?.();
    // Executa a função original
    onClick();
  }, [onClick]);

  return (
    <button
      className={styles.hoverButton}
      style={{ left, top, width, height }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      aria-label={alt}
      type="button"
    >
      <img
        src={imageSrc}
        alt={alt}
        className={styles.buttonImage}
        draggable={false}
      />
    </button>
  );
};

export default HoverButton;
