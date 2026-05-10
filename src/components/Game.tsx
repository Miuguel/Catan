import { useEffect, useRef } from "react";
import "../styles/game.css";
import { Board } from "../core/board/Board";
import { ConstructionRules } from "../core/game/ConstructionRules";
import { GameState } from "../core/game/GameState";
import { Player } from "../core/game/Player";
import { ResourceDistributionService } from "../core/game/ResourceDistributionService";
import { BoardRenderer } from "../render/BoardRenderer";
import { GameInputController } from "../input/GameInputController";

interface GameProps {
  playerName: string;
  onBack: () => void;
}

const Game: React.FC<GameProps> = ({ playerName, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameInitialized = useRef(false);

  useEffect(() => {
    if (gameInitialized.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    gameInitialized.current = true;

    function resizeCanvas() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    resizeCanvas();

    const board = new Board();
    const boardRenderer = new BoardRenderer(ctx, board);

    const player1 = new Player("player-1", playerName || "Jogador 1");
    const player2 = new Player("player-2", "Jogador 2");

    const gameState = new GameState(board, [player1, player2]);
    const constructionRules = new ConstructionRules(board, gameState);
    const resourceDistributionService = new ResourceDistributionService(gameState);
    const inputController = new GameInputController(
      canvas,
      board,
      gameState,
      constructionRules,
      resourceDistributionService
    );

    // Criar HUD
    const hud = document.createElement("div");
    hud.className = "game-ui";
    hud.innerHTML = `
      <div class="top-bar">
        <div class="top-bar__brand">
          <div class="top-bar__logo">C</div>
          <div class="top-bar__title-wrap">
            <div class="top-bar__eyebrow">Catan Clone</div>
            <div class="top-bar__title">Partida Casual</div>
          </div>
        </div>
        <div class="top-bar__center">
          <div class="phase-pill" id="phaseBadge"></div>
          <div class="turn-pill" id="currentPlayerText"></div>
          <div class="vp-pill" id="victoryPointsText"></div>
        </div>
        <button id="rollButton" class="top-bar__roll">Rolar Dados</button>
      </div>

      <div class="resource-rack" id="resourceText"></div>

      <div class="action-bar">
        <button id="settlementButton">Aldeia</button>
        <button id="roadButton">Estrada</button>
        <button id="cityButton">Cidade</button>
        <button id="discardButton">Resolver 7</button>
        <button id="passButton">Passar Turno</button>
      </div>

      <div id="statusText" class="status-toast"></div>
      <div id="winnerBanner" class="winner-banner"></div>
    `;

    document.body.appendChild(hud);

    const rollButton = hud.querySelector<HTMLButtonElement>("#rollButton");
    const settlementButton =
      hud.querySelector<HTMLButtonElement>("#settlementButton");
    const roadButton = hud.querySelector<HTMLButtonElement>("#roadButton");
    const cityButton = hud.querySelector<HTMLButtonElement>("#cityButton");
    const discardButton = hud.querySelector<HTMLButtonElement>("#discardButton");
    const passButton = hud.querySelector<HTMLButtonElement>("#passButton");
    const phaseBadge = hud.querySelector<HTMLDivElement>("#phaseBadge");
    const currentPlayerText =
      hud.querySelector<HTMLDivElement>("#currentPlayerText");
    const victoryPointsText =
      hud.querySelector<HTMLDivElement>("#victoryPointsText");
    const resourceText = hud.querySelector<HTMLDivElement>("#resourceText");
    const statusText = hud.querySelector<HTMLDivElement>("#statusText");
    const winnerBanner = hud.querySelector<HTMLDivElement>("#winnerBanner");

    if (
      rollButton === null ||
      settlementButton === null ||
      roadButton === null ||
      cityButton === null ||
      discardButton === null ||
      passButton === null ||
      phaseBadge === null ||
      currentPlayerText === null ||
      victoryPointsText === null ||
      resourceText === null ||
      statusText === null ||
      winnerBanner === null
    ) {
      throw new Error("HUD elements not found");
    }

    const hudRefs = {
      rollButton,
      settlementButton,
      roadButton,
      cityButton,
      discardButton,
      passButton,
      phaseBadge,
      currentPlayerText,
      victoryPointsText,
      resourceText,
      statusText,
      winnerBanner,
    };

    hudRefs.rollButton.addEventListener("click", () => inputController.rollDice());
    hudRefs.settlementButton.addEventListener("click", () =>
      inputController.setMode("build-settlement"),
    );
    hudRefs.roadButton.addEventListener("click", () =>
      inputController.setMode("build-road"),
    );
    hudRefs.cityButton.addEventListener("click", () =>
      inputController.setMode("upgrade-settlement"),
    );
    hudRefs.discardButton.addEventListener("click", () =>
      inputController.resolveDiscard(),
    );
    hudRefs.passButton.addEventListener("click", () => inputController.passTurn());

    const handleResize = () => resizeCanvas();
    window.addEventListener("resize", handleResize);

    function renderHud() {
      const currentPlayer = gameState.getCurrentPlayer();
      const winner = gameState.getWinner();
      const isInitialPlacement = gameState.isInitialPlacementActive();
      const initialStep = gameState.getInitialPlacementStep();

      hudRefs.phaseBadge.textContent = isInitialPlacement
        ? `setup · ${initialStep ?? "-"}`
        : gameState.phase.replace("-", " ");
      hudRefs.currentPlayerText.textContent = currentPlayer
        ? `Turno de ${currentPlayer.name}`
        : "Sem jogador";
      hudRefs.victoryPointsText.textContent = currentPlayer
        ? `VP ${currentPlayer.victoryPoints}`
        : "VP -";
      hudRefs.resourceText.textContent = currentPlayer
        ? `Brick ${currentPlayer.resources.brick}  Lumber ${currentPlayer.resources.lumber}  Wool ${currentPlayer.resources.wool}  Grain ${currentPlayer.resources.grain}  Ore ${currentPlayer.resources.ore}`
        : "-";
      hudRefs.statusText.textContent = winner
        ? `${winner.name} venceu a partida!`
        : inputController.getStatusMessage();

      hudRefs.winnerBanner.textContent = winner
        ? `${winner.name} venceu com ${winner.victoryPoints} VP`
        : "";

      const gameOver = gameState.isFinished();

      hudRefs.rollButton.disabled = gameOver || gameState.phase !== "roll-dice";
      hudRefs.settlementButton.disabled = isInitialPlacement
        ? initialStep !== "settlement"
        : gameOver || gameState.phase !== "main-actions";
      hudRefs.roadButton.disabled = isInitialPlacement
        ? initialStep !== "road"
        : gameOver || gameState.phase !== "main-actions";
      hudRefs.cityButton.disabled =
        gameOver || isInitialPlacement || gameState.phase !== "main-actions";
      hudRefs.discardButton.disabled = gameOver || gameState.phase !== "discard";
      hudRefs.passButton.disabled =
        gameOver || isInitialPlacement || gameState.phase !== "main-actions";
    }

    let animationId: number;

    function gameLoop() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      boardRenderer.render(inputController.getRenderState());
      renderHud();
      animationId = requestAnimationFrame(gameLoop);
    }

    gameLoop();

    
  }, [playerName, onBack]);

  return <canvas id="game" ref={canvasRef} />;
};

export default Game;
