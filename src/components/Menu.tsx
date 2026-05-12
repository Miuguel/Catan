import { useCallback } from "react";
import HoverButton from "./HoverButton";
import styles from "../styles/Menu.module.css";

/**
 * Configuração de cada botão do menu.
 */
interface MenuButtonConfig {
  id: string;
  imageSrc: string;
  alt: string;
  left: string;
  top: string;
  width: string;
  height: string;
  onClick: () => void;
}


interface MenuProps {
  onPlay: () => void;
}


const Menu: React.FC<MenuProps> = ({ onPlay }) => {
  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handlePlay = useCallback((): void => {
    onPlay();
  }, [onPlay]);

  const handleOptions = useCallback((): void => {
    console.log("[Menu] Botão 'Opções' clicado — abrir configurações.");
  }, []);

  const handleExit = useCallback((): void => {
    alert("Jogo encerrado. Obrigado por jogar!");
    console.log("[Menu] Botão 'Sair' clicado — jogo encerrado.");
  }, []);

  // ─── Configuração dos Botões ────────────────────────────────────────────────
  const buttons: MenuButtonConfig[] = [
    {
      id: "play",
      imageSrc: "/assets/images/buttons/jogar_button.png",
      alt: "Jogar",
      left: "14.6%",
      top: "39%",
      width: "19.5%",
      height: "10%",
      onClick: handlePlay,
    },
    {
      id: "options",
      imageSrc: "/assets/images/buttons/options_button.png",
      alt: "Opções",
      left: "14.6%",
      top: "54%",
      width: "19.5%",
      height: "10%",
      onClick: handleOptions,
    },
    {
      id: "exit",
      imageSrc: "/assets/images/buttons/sair_button.png",
      alt: "Sair",
      left: "14.6%",
      top: "69%",
      width: "19.5%",
      height: "10%",
      onClick: handleExit,
    },
  ];

  return (
    <div className={styles.menuContainer}>
      <div className={styles.menuInner}>
        {/* Imagem de fundo do menu */}
        <img
          src="/assets/images/menu.png"
          alt="Fundo do menu"
          className={styles.backgroundImage}
          draggable={false}
        />

        {/* Botões do menu */}
        {buttons.map((btn) => (
          <HoverButton
            key={btn.id}
            imageSrc={btn.imageSrc}
            alt={btn.alt}
            left={btn.left}
            top={btn.top}
            width={btn.width}
            height={btn.height}
            onClick={btn.onClick}
          />
        ))}
      </div>
    </div>
  );
};

export default Menu;
