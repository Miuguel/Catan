import { useState, useCallback } from "react";
import { Menu, PlayerSelection, Game, BackgroundMusic } from "./components";
import HoverSound from "./components/HoverSound";
import ClickSound from "./components/ClickSound";

type Screen = "menu" | "playerSelection" | "game";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("menu");
  const [playerName, setPlayerName] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  const goToMenu = useCallback(() => setCurrentScreen("menu"), []);
  const goToPlayerSelection = useCallback(() => setCurrentScreen("playerSelection"), []);

  const handleConfirmPlayer = useCallback((name: string) => {
    setPlayerName(name);
    setCurrentScreen("game");
  }, []);

  const toggleSound = useCallback(() => {
    window.__clickSounds?.playClickSound?.();
    setSoundEnabled((prev) => !prev);
  }, []);

  // Telas que devem exibir a música de fundo
  const showBackgroundMusic = currentScreen === "menu" || currentScreen === "playerSelection";

  return (
    <>
      {showBackgroundMusic && (
        <BackgroundMusic
          src="/assets/audio/menu_music.mp3"
          volume={0.3}
          loop={true}
          autoPlay={true}
          muted={!soundEnabled}
        />
      )}

      {showBackgroundMusic && (
        <button
          type="button"
          onClick={toggleSound}
          onMouseEnter={() => window.__hoverSounds?.playHoverSound?.()}
          aria-label={soundEnabled ? "Desativar áudio" : "Ativar áudio"}
          style={{
            position: "fixed",
            right: 20,
            top: 20,
            zIndex: 9999,
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.28)",
            background: "rgba(0, 0, 0, 0.55)",
            color: "#fff",
            fontSize: 24,
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          }}
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>
      )}

      {currentScreen === "menu" && <Menu onPlay={goToPlayerSelection} />} 
      {currentScreen === "playerSelection" && (
        <PlayerSelection onBack={goToMenu} onConfirm={handleConfirmPlayer} />
      )}
      {currentScreen === "game" && (
        <Game playerName={playerName} onBack={goToMenu} />
      )}

      {/* Som de hover global para todos os botões */}
      <HoverSound src="/assets/audio/button_hover.mp3" volume={0.5} />
      {/* Som de clique global para todos os botões */}
      <ClickSound src="/assets/audio/button_click.mp3" volume={0.5} />
    </>
  );
}

export default App;
