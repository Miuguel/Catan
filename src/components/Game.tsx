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

interface PlayerConfig {
  name: string;
  avatarSrc: string;
}

interface GameProps {
  players: PlayerConfig[];
  onBack: () => void;
}

function createOceanRenderer(ctx: CanvasRenderingContext2D) {
  const oceanImg = new Image();
  oceanImg.src = "/ocean_texture.png";


  function drawOcean(t: number) {
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;

    if (oceanImg.complete && oceanImg.naturalWidth > 0) {
      const tileSize = Math.max(W, H) * 0.55;
      const driftX = (Math.sin(t * 0.00025) * 0.04 * W) % tileSize;
      const driftY = (Math.cos(t * 0.00018) * 0.03 * H) % tileSize;
      ctx.save();
      const pat = ctx.createPattern(oceanImg, "repeat");
      if (pat) {
        const mat = new DOMMatrix();
        mat.scaleSelf(tileSize / oceanImg.width, tileSize / oceanImg.height);
        mat.translateSelf(driftX / (tileSize / oceanImg.width), driftY / (tileSize / oceanImg.height));
        pat.setTransform(mat);
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, W, H);
      } else {
        ctx.fillStyle = "#1a6fa8";
        ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
    } else {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#0d4f8c");
      grad.addColorStop(0.5, "#1a7abf");
      grad.addColorStop(1, "#0d4f8c");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

  }

  return { drawOcean};
}

const Game: React.FC<GameProps> = ({ players, onBack }) => {
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
    const oceanRenderer = createOceanRenderer(ctx);

    // Cria jogadores dinamicamente (adaptável para N jogadores)
    const gamePlayers = players.length > 0
      ? players.map((p, i) => new Player(`player-${i + 1}`, p.name || `Jogador ${i + 1}`))
      : [new Player("player-1", "Jogador 1"), new Player("player-2", "Jogador 2")];

    // Mapa de id -> avatarSrc para uso no painel
    const avatarMap: Record<string, string> = {};
    players.forEach((p, i) => { avatarMap[`player-${i + 1}`] = p.avatarSrc; });

    const gameState = new GameState(board, gamePlayers);
    const constructionRules = new ConstructionRules(board, gameState);
    const resourceDistributionService = new ResourceDistributionService(gameState);
    const inputController = new GameInputController(
      canvas,
      board,
      gameState,
      constructionRules,
      resourceDistributionService,
    );

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
        <button id="tradeButton">Negociar</button>
      </div>

      <div class="dev-cards-panel">
        <div class="dev-cards-panel__title">Suas Cartas de Desenvolvimento</div>
        <div class="dev-cards-panel__list" id="devCardsList">
          <div class="dev-card dev-card--unknown"><span class="dev-card__symbol">?</span></div>
          <div class="dev-card dev-card--unknown"><span class="dev-card__symbol">?</span></div>
          <div class="dev-card dev-card--unknown"><span class="dev-card__symbol">?</span></div>
        </div>
      </div>

      <div id="statusText" class="status-toast"></div>
      <div class="game-log">
        <div class="game-log__title">Histórico</div>
        <div id="gameLogList" class="game-log__list"></div>
      </div>
      <div id="winnerBanner" class="winner-banner"></div>

      <div class="players-panel">
        <div class="players-panel__title">JOGADORES</div>
        <div id="playersList" class="players-panel__list"></div>
      </div>
    `;

    document.body.appendChild(hud);

    const rollButton = hud.querySelector<HTMLButtonElement>("#rollButton");
    const settlementButton = hud.querySelector<HTMLButtonElement>("#settlementButton");
    const roadButton = hud.querySelector<HTMLButtonElement>("#roadButton");
    const cityButton = hud.querySelector<HTMLButtonElement>("#cityButton");
    const discardButton = hud.querySelector<HTMLButtonElement>("#discardButton");
    const passButton = hud.querySelector<HTMLButtonElement>("#passButton");
    const tradeButton = hud.querySelector<HTMLButtonElement>("#tradeButton");
    const phaseBadge = hud.querySelector<HTMLDivElement>("#phaseBadge");
    const currentPlayerText = hud.querySelector<HTMLDivElement>("#currentPlayerText");
    const victoryPointsText = hud.querySelector<HTMLDivElement>("#victoryPointsText");
    const resourceText = hud.querySelector<HTMLDivElement>("#resourceText");
    const statusText = hud.querySelector<HTMLDivElement>("#statusText");
    const gameLogList = hud.querySelector<HTMLDivElement>("#gameLogList");
    const winnerBanner = hud.querySelector<HTMLDivElement>("#winnerBanner");
    const playersList = hud.querySelector<HTMLDivElement>("#playersList");

    if (
      rollButton === null || settlementButton === null || roadButton === null ||
      cityButton === null || discardButton === null || passButton === null ||
      phaseBadge === null || currentPlayerText === null || victoryPointsText === null ||
      resourceText === null || statusText === null || gameLogList === null || winnerBanner === null || playersList === null || tradeButton === null
    ) {
      throw new Error("HUD elements not found");
    }

    const hudRefs = {
      rollButton, settlementButton, roadButton, cityButton, discardButton,
      passButton, tradeButton, phaseBadge, currentPlayerText, victoryPointsText,
      resourceText, statusText, gameLogList, winnerBanner, playersList,
    };

    const handleRoll = () => inputController.rollDice();
    const handleSettlement = () => inputController.setMode("build-settlement");
    const handleRoad = () => inputController.setMode("build-road");
    const handleCity = () => inputController.setMode("upgrade-settlement");
    const handleDiscard = () => inputController.resolveDiscard();
    const handlePass = () => inputController.passTurn();
    const handleTrade = () => { /* Negociação a implementar */ };

    hudRefs.rollButton.addEventListener("click", handleRoll);
    hudRefs.settlementButton.addEventListener("click", handleSettlement);
    hudRefs.roadButton.addEventListener("click", handleRoad);
    hudRefs.cityButton.addEventListener("click", handleCity);
    hudRefs.discardButton.addEventListener("click", handleDiscard);
    hudRefs.passButton.addEventListener("click", handlePass);
    hudRefs.tradeButton.addEventListener("click", handleTrade);

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

      // Painel lateral de jogadores — adaptável para N jogadores
      const PLAYER_COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#22c55e", "#a855f7", "#ec4899"];
      const currentPlayerId = currentPlayer?.id ?? "";
      hudRefs.playersList.innerHTML = gameState.players.map((p, i) => {
        const isActive = p.id === currentPlayerId;
        const avatarSrc = avatarMap[p.id] ?? "/assets/images/avatars/avatar1.png";
        const color = PLAYER_COLORS[i % PLAYER_COLORS.length];
        return `
          <div class="player-card ${isActive ? "player-card--active" : ""}" style="--player-color:${color}">
            <div class="player-card__avatar-wrap" style="border-color:${color}">
              <img class="player-card__avatar" src="${avatarSrc}" alt="${p.name}" />
            </div>
            <div class="player-card__info">
              <span class="player-card__name" style="color:${isActive ? color : "#f1f5f9"}">${p.name.toUpperCase()}</span>
              <span class="player-card__vp">${p.victoryPoints}</span>
            </div>
            ${isActive ? "<span class='player-card__star'>&#9733;</span>" : ""}
          </div>`;
      }).join("");

      const gameOver = gameState.isFinished();
      hudRefs.rollButton.disabled = gameOver || gameState.phase !== "roll-dice";
      hudRefs.settlementButton.disabled = isInitialPlacement
        ? initialStep !== "settlement"
        : gameOver || gameState.phase !== "main-actions";
      hudRefs.roadButton.disabled = isInitialPlacement
        ? initialStep !== "road"
        : gameOver || gameState.phase !== "main-actions";
      hudRefs.cityButton.disabled = gameOver || isInitialPlacement || gameState.phase !== "main-actions";
      hudRefs.discardButton.disabled = gameOver || gameState.phase !== "discard";
      hudRefs.passButton.disabled = gameOver || isInitialPlacement || gameState.phase !== "main-actions";
      hudRefs.tradeButton.disabled = gameOver || isInitialPlacement || gameState.phase !== "main-actions";
    }

    let animationId = 0;

    function gameLoop(t: number) {

      // 1. Fundo de mar animado
      oceanRenderer.drawOcean(t);

      // 2. Tabuleiro
      boardRenderer.render(inputController.getRenderState());

      renderHud();
      animationId = requestAnimationFrame(gameLoop);
    }

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      hudRefs.rollButton.removeEventListener("click", handleRoll);
      hudRefs.settlementButton.removeEventListener("click", handleSettlement);
      hudRefs.roadButton.removeEventListener("click", handleRoad);
      hudRefs.cityButton.removeEventListener("click", handleCity);
      hudRefs.discardButton.removeEventListener("click", handleDiscard);
      hudRefs.passButton.removeEventListener("click", handlePass);
      hudRefs.tradeButton.removeEventListener("click", handleTrade);
      inputController.dispose();
      hud.remove();
      gameInitialized.current = false;
    };
  }, [players, onBack]);

  return <canvas id="game" ref={canvasRef} />;
};

export default Game;
