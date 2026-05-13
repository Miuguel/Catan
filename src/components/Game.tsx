import { useEffect, useRef } from "react";
import "../styles/game.css";
import { Board } from "../core/board/Board";
import { ConstructionRules } from "../core/game/ConstructionRules";
import { GameState } from "../core/game/GameState";
import { Player } from "../core/game/Player";
import { ResourceDistributionService } from "../core/game/ResourceDistributionService";
import { getResourceColor } from "../core/game/ResourceNames";
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
    const resourceDistributionService = new ResourceDistributionService(
      gameState,
    );
    const inputController = new GameInputController(
      canvas,
      board,
      gameState,
      constructionRules,
      resourceDistributionService,
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

      <div class="construction-costs">
        <div class="construction-cost-item">
          <div class="construction-cost-label">Aldeia</div>
          <div class="construction-cost-resources">
            <span class="cost-resource">
              <span class="cost-color" style="background-color: ${getResourceColor("brick")}"></span>
              1
            </span>
            <span class="cost-resource">
              <span class="cost-color" style="background-color: ${getResourceColor("lumber")}"></span>
              1
            </span>
            <span class="cost-resource">
              <span class="cost-color" style="background-color: ${getResourceColor("wool")}"></span>
              1
            </span>
            <span class="cost-resource">
              <span class="cost-color" style="background-color: ${getResourceColor("grain")}"></span>
              1
            </span>
          </div>
        </div>
        <div class="construction-cost-item">
          <div class="construction-cost-label">Estrada</div>
          <div class="construction-cost-resources">
            <span class="cost-resource">
              <span class="cost-color" style="background-color: ${getResourceColor("brick")}"></span>
              1
            </span>
            <span class="cost-resource">
              <span class="cost-color" style="background-color: ${getResourceColor("lumber")}"></span>
              1
            </span>
          </div>
        </div>
        <div class="construction-cost-item">
          <div class="construction-cost-label">Cidade</div>
          <div class="construction-cost-resources">
            <span class="cost-resource">
              <span class="cost-color" style="background-color: ${getResourceColor("grain")}"></span>
              2
            </span>
            <span class="cost-resource">
              <span class="cost-color" style="background-color: ${getResourceColor("ore")}"></span>
              3
            </span>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <button id="settlementButton">Aldeia</button>
        <button id="roadButton">Estrada</button>
        <button id="cityButton">Cidade</button>
        <button id="discardButton">Resolver 7</button>
        <button id="passButton">Passar Turno</button>
      </div>

      <div id="statusText" class="status-toast"></div>
      <div class="game-log">
        <div class="game-log__title">Histórico</div>
        <div id="gameLogList" class="game-log__list"></div>
      </div>
      <div id="winnerBanner" class="winner-banner"></div>
    `;

    document.body.appendChild(hud);

    const rollButton = hud.querySelector<HTMLButtonElement>("#rollButton");
    const settlementButton =
      hud.querySelector<HTMLButtonElement>("#settlementButton");
    const roadButton = hud.querySelector<HTMLButtonElement>("#roadButton");
    const cityButton = hud.querySelector<HTMLButtonElement>("#cityButton");
    const discardButton =
      hud.querySelector<HTMLButtonElement>("#discardButton");
    const passButton = hud.querySelector<HTMLButtonElement>("#passButton");
    const phaseBadge = hud.querySelector<HTMLDivElement>("#phaseBadge");
    const currentPlayerText =
      hud.querySelector<HTMLDivElement>("#currentPlayerText");
    const victoryPointsText =
      hud.querySelector<HTMLDivElement>("#victoryPointsText");
    const resourceText = hud.querySelector<HTMLDivElement>("#resourceText");
    const statusText = hud.querySelector<HTMLDivElement>("#statusText");
    const gameLogList = hud.querySelector<HTMLDivElement>("#gameLogList");
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
      gameLogList === null ||
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
      gameLogList,
      winnerBanner,
    };

    const handleRoll = () => inputController.rollDice();
    const handleSettlement = () => inputController.setMode("build-settlement");
    const handleRoad = () => inputController.setMode("build-road");
    const handleCity = () => inputController.setMode("upgrade-settlement");
    const handleDiscard = () => inputController.resolveDiscard();
    const handlePass = () => inputController.passTurn();

    hudRefs.rollButton.addEventListener("click", handleRoll);
    hudRefs.settlementButton.addEventListener("click", handleSettlement);
    hudRefs.roadButton.addEventListener("click", handleRoad);
    hudRefs.cityButton.addEventListener("click", handleCity);
    hudRefs.discardButton.addEventListener("click", handleDiscard);
    hudRefs.passButton.addEventListener("click", handlePass);

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
        ? `Pontuação ${currentPlayer.victoryPoints}`
        : "Pontuação: ";
      hudRefs.resourceText.innerHTML = currentPlayer
        ? `
          <span class="resource-item">
            <span class="resource-color" style="background-color: ${getResourceColor("brick")}"></span>
            Tijolo ${currentPlayer.resources.brick}
          </span>
          <span class="resource-item">
            <span class="resource-color" style="background-color: ${getResourceColor("lumber")}"></span>
            Madeira ${currentPlayer.resources.lumber}
          </span>
          <span class="resource-item">
            <span class="resource-color" style="background-color: ${getResourceColor("wool")}"></span>
            Lã ${currentPlayer.resources.wool}
          </span>
          <span class="resource-item">
            <span class="resource-color" style="background-color: ${getResourceColor("grain")}"></span>
            Trigo ${currentPlayer.resources.grain}
          </span>
          <span class="resource-item">
            <span class="resource-color" style="background-color: ${getResourceColor("ore")}"></span>
            Minério ${currentPlayer.resources.ore}
          </span>
        `
        : "-";
      hudRefs.statusText.textContent = winner
        ? `${winner.name} venceu a partida!`
        : inputController.getStatusMessage();
      hudRefs.gameLogList.replaceChildren(
        ...gameState.getActionLog().map((action) => {
          const item = document.createElement("div");
          item.className = "game-log__item";
          item.textContent = action;

          return item;
        }),
      );

      hudRefs.winnerBanner.textContent = winner
        ? `${winner.name} venceu com ${winner.victoryPoints} Pontuação`
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
      hudRefs.discardButton.disabled =
        gameOver || gameState.phase !== "discard";
      hudRefs.passButton.disabled =
        gameOver || isInitialPlacement || gameState.phase !== "main-actions";
    }

    let animationId = 0;

    function gameLoop() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      boardRenderer.render(inputController.getRenderState());
      renderHud();
      animationId = requestAnimationFrame(gameLoop);
    }

    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      hudRefs.rollButton.removeEventListener("click", handleRoll);
      hudRefs.settlementButton.removeEventListener("click", handleSettlement);
      hudRefs.roadButton.removeEventListener("click", handleRoad);
      hudRefs.cityButton.removeEventListener("click", handleCity);
      hudRefs.discardButton.removeEventListener("click", handleDiscard);
      hudRefs.passButton.removeEventListener("click", handlePass);
      inputController.dispose();
      hud.remove();
      gameInitialized.current = false;
    };
  }, [playerName, onBack]);

  return <canvas id="game" ref={canvasRef} />;
};

export default Game;
