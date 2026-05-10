import { useState, useCallback } from "react";
import { Menu, PlayerSelection, Game } from "./components";

type Screen = "menu" | "playerSelection" | "game";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("menu");
  const [playerName, setPlayerName] = useState<string>("");

  const goToMenu = useCallback(() => setCurrentScreen("menu"), []);
  const goToPlayerSelection = useCallback(() => setCurrentScreen("playerSelection"), []);

  const handleConfirmPlayer = useCallback((name: string) => {
    setPlayerName(name);
    setCurrentScreen("game");
  }, []);

  return (
    <>
      {currentScreen === "menu" && <Menu onPlay={goToPlayerSelection} />} 
      {currentScreen === "playerSelection" && (
        <PlayerSelection onBack={goToMenu} onConfirm={handleConfirmPlayer} />
      )}
      {currentScreen === "game" && (
        <Game playerName={playerName} onBack={goToMenu} />
      )}
    </>
  );
}

export default App;
