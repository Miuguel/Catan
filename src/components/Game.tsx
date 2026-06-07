import React, { useState, useRef, useEffect } from "react";
import type { FC } from "react";
import "../styles/game.css";
import { Board } from "../core/board/Board";
import { BotController } from "../core/game/BotController";
import { ConstructionRules } from "../core/game/ConstructionRules";
import { GameState } from "../core/game/GameState";
import { Player } from "../core/game/Player";
import { ResourceDistributionService } from "../core/game/ResourceDistributionService";
import { getResourceColor } from "../core/game/ResourceNames";
import type { ResourceInventory } from "../core/game/ResourceInventory";
import type { ResourceType } from "../core/game/ResourceType";
import { shouldBotAcceptTrade } from "../core/game/TradeService";
import { BoardRenderer } from "../render/BoardRenderer";
import { GameInputController, type DiceRollResult } from "../input/GameInputController";
import { TradeModal } from "./TradeModal";
import type { TradeResult } from "./TradeModal";
import { DiceRoller } from "./DiceRoller";
import { DevelopmentCardsModal } from "./DevelopmentCardsModal";
import type {
  CardHandEntry,
  DevCardPlayResult,
} from "./DevelopmentCardsModal";
import { DiscardModal } from "./DiscardModal";
import type { DiscardResult } from "./DiscardModal";
import { RobberVictimModal } from "./RobberVictimModal";
import type { RobberVictimOption } from "./RobberVictimModal";
import { cloneResourceInventory } from "../core/game/ResourceInventory";
import {
  DEVELOPMENT_CARD_NAMES,
  PLAYABLE_CARD_TYPES,
} from "../core/game/DevelopmentCard";
import type { DevelopmentCardType } from "../core/game/DevelopmentCard";
import { getResourceName } from "../core/game/ResourceNames";
import VictoryScreen from "./VictoryScreen";

const DEV_CARD_SYMBOLS: Record<DevelopmentCardType, string> = {
  knight: "⚔️",
  "victory-point": "🏆",
  monopoly: "💰",
  "year-of-plenty": "🌾",
  "road-building": "🛣️",
};

interface PlayerConfig {
  name: string;
  avatarSrc: string;
  kind: "human" | "bot";
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

const RESOURCE_LABELS: Record<keyof ResourceInventory, string> = {
  brick: "Tijolo",
  lumber: "Madeira",
  wool: "La",
  grain: "Trigo",
  ore: "Minerio",
};

const PLAYER_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#a855f7",
  "#ec4899",
];

// Chips coloridos por recurso (para o painel de debug).
function resourceChips(resources: Partial<ResourceInventory>) {
  return (
    Object.entries(RESOURCE_LABELS) as Array<[keyof ResourceInventory, string]>
  )
    .map(
      ([resourceType, label]) => `
        <span class="dbg-chip" title="${label}">
          <span class="dbg-chip__dot" style="background:${getResourceColor(resourceType)}"></span>${resources[resourceType] ?? 0}
        </span>`,
    )
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Os rótulos do TradeModal usam acentos; mapeamos para o tipo interno.
const TRADE_LABEL_TO_RESOURCE: Record<string, ResourceType> = {
  Tijolo: "brick",
  Madeira: "lumber",
  Lã: "wool",
  Trigo: "grain",
  Minério: "ore",
};

function labelRecordToInventory(
  record: Record<string, number>,
): Partial<ResourceInventory> {
  const inventory: Partial<ResourceInventory> = {};

  Object.entries(record).forEach(([label, amount]) => {
    const resourceType = TRADE_LABEL_TO_RESOURCE[label];

    if (resourceType !== undefined && amount > 0) {
      inventory[resourceType] = amount;
    }
  });

  return inventory;
}

function formatTradeList(resources: Partial<ResourceInventory>) {
  return (
    Object.entries(RESOURCE_LABELS) as Array<[keyof ResourceInventory, string]>
  )
    .filter(([resourceType]) => (resources[resourceType] ?? 0) > 0)
    .map(([resourceType, label]) => `${resources[resourceType]} ${label}`)
    .join(", ");
}

const Game: FC<GameProps> = ({ players, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameInitialized = useRef(false);
  const gameContextRef = useRef<{
    gameState: GameState;
    players: Player[];
  } | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [currentPlayerName, setCurrentPlayerName] = useState('');
  const [otherPlayers, setOtherPlayers] = useState<Array<{name: string; avatarSrc: string}>>([
  ]);
  const [bankRates, setBankRates] = useState<Record<string, number>>({
    Tijolo: 4, Madeira: 4, "Lã": 4, Trigo: 4, "Minério": 4,
  });
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [diceResult, setDiceResult] = useState<DiceRollResult | null>(null);
  const inputControllerRef = useRef<GameInputController | null>(null);
  const [isCardsModalOpen, setIsCardsModalOpen] = useState(false);
  const [cardModalData, setCardModalData] = useState<{
    entries: CardHandEntry[];
    victoryPointCards: number;
    canPlayThisTurn: boolean;
    deckCount: number;
  }>({ entries: [], victoryPointCards: 0, canPlayThisTurn: true, deckCount: 0 });
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [discardData, setDiscardData] = useState<{
    playerId: string;
    playerName: string;
    required: number;
    available: ResourceInventory;
  }>({
    playerId: "",
    playerName: "",
    required: 0,
    available: { brick: 0, lumber: 0, wool: 0, grain: 0, ore: 0 },
  });
  const discardActiveRef = useRef(false);
  const [isVictimModalOpen, setIsVictimModalOpen] = useState(false);
  const [victimOptions, setVictimOptions] = useState<RobberVictimOption[]>([]);
  const [victoryData, setVictoryData] = useState<{
    playerName: string;
    playerAvatarSrc: string;
    victoryPoints: number;
  } | null>(null);
  const avatarMapRef = useRef<Record<string, string>>({});

  const handleBankTrade = (
    offering: Record<string, number>,
    requesting: Record<string, number>,
  ): TradeResult => {
    const context = gameContextRef.current;

    if (context === null) {
      return { ok: false, message: "Jogo não inicializado." };
    }

    const { gameState } = context;

    if (gameState.phase !== "main-actions") {
      return { ok: false, message: "Só é possível negociar na fase principal." };
    }

    const current = gameState.currentPlayer;

    if (current === undefined) {
      return { ok: false, message: "Nenhum jogador ativo." };
    }

    const offered = labelRecordToInventory(offering);
    const requested = labelRecordToInventory(requesting);

    try {
      gameState.tradeWithBankBundle(current.id, offered, requested);
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Falha na troca.",
      };
    }

    gameState.addActionLog(
      `${current.name} trocou ${formatTradeList(offered)} por ${formatTradeList(requested)} com o banco.`,
    );

    return { ok: true, message: "Troca com o banco realizada!" };
  };

  const handlePlayerTrade = (
    targetName: string,
    offering: Record<string, number>,
    requesting: Record<string, number>,
  ): TradeResult => {
    const context = gameContextRef.current;

    if (context === null) {
      return { ok: false, message: "Jogo não inicializado." };
    }

    const { gameState, players } = context;

    if (gameState.phase !== "main-actions") {
      return { ok: false, message: "Só é possível negociar na fase principal." };
    }

    const current = gameState.currentPlayer;

    if (current === undefined) {
      return { ok: false, message: "Nenhum jogador ativo." };
    }

    const target = players.find(
      (player) => player.id !== current.id && player.name === targetName,
    );

    if (target === undefined) {
      return { ok: false, message: "Selecione um jogador válido." };
    }

    const offered = labelRecordToInventory(offering);
    const requested = labelRecordToInventory(requesting);

    if (Object.keys(offered).length === 0) {
      return { ok: false, message: "Você precisa oferecer pelo menos um recurso." };
    }

    if (Object.keys(requested).length === 0) {
      return { ok: false, message: "Você precisa pedir pelo menos um recurso." };
    }

    if (!current.canAfford(offered)) {
      return { ok: false, message: "Você não possui os recursos oferecidos." };
    }

    // O bot recebe o que é oferecido e entrega o que é pedido.
    if (target.kind === "bot" && !shouldBotAcceptTrade(target, offered, requested)) {
      gameState.addActionLog(
        `${target.name} recusou a proposta de ${current.name}.`,
      );
      return { ok: false, message: `${target.name} recusou a proposta.` };
    }

    try {
      gameState.tradeBetweenPlayers(current.id, target.id, offered, requested);
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Falha na troca.",
      };
    }

    gameState.addActionLog(
      `${current.name} deu ${formatTradeList(offered)} e recebeu ${formatTradeList(requested)} de ${target.name}.`,
    );

    return { ok: true, message: `${target.name} aceitou a troca!` };
  };

  const openCardsModal = () => {
    const context = gameContextRef.current;

    if (context === null) {
      return;
    }

    const { gameState } = context;
    const current = gameState.currentPlayer;

    if (current === undefined) {
      return;
    }

    const counts = current.getDevelopmentCardCounts();
    const entries: CardHandEntry[] = PLAYABLE_CARD_TYPES.map((type) => ({
      type,
      name: DEVELOPMENT_CARD_NAMES[type],
      total: counts[type],
      playable: current.developmentCards.filter(
        (card) =>
          card.type === type && card.purchasedTurn < gameState.turnNumber,
      ).length,
    })).filter((entry) => entry.total > 0);

    setCardModalData({
      entries,
      victoryPointCards: current.countVictoryPointCards(),
      canPlayThisTurn: gameState.canPlayDevelopmentCardThisTurn(),
      deckCount: gameState.getDevelopmentDeckCount(),
    });
    setIsCardsModalOpen(true);
  };

  const handlePlayKnight = (): DevCardPlayResult => {
    const context = gameContextRef.current;

    if (context === null) {
      return { ok: false, message: "Jogo não inicializado." };
    }

    const { gameState } = context;
    const current = gameState.currentPlayer;

    if (current === undefined) {
      return { ok: false, message: "Nenhum jogador ativo." };
    }

    try {
      gameState.playKnight(current.id);
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Falha ao jogar.",
      };
    }

    gameState.addActionLog(`${current.name} jogou um Cavaleiro.`);
    inputControllerRef.current?.setStatusMessage(
      "Cavaleiro jogado. Clique em um hexágono para mover o ladrão.",
    );
    return { ok: true, message: "Cavaleiro jogado. Mova o ladrão." };
  };

  const handlePlayMonopoly = (resource: ResourceType): DevCardPlayResult => {
    const context = gameContextRef.current;

    if (context === null) {
      return { ok: false, message: "Jogo não inicializado." };
    }

    const { gameState } = context;
    const current = gameState.currentPlayer;

    if (current === undefined) {
      return { ok: false, message: "Nenhum jogador ativo." };
    }

    let total: number;

    try {
      total = gameState.playMonopoly(current.id, resource);
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Falha ao jogar.",
      };
    }

    gameState.addActionLog(
      `${current.name} jogou Monopólio de ${getResourceName(resource)} e coletou ${total}.`,
    );
    inputControllerRef.current?.setStatusMessage(
      `Monopólio: você coletou ${total} de ${getResourceName(resource)}.`,
    );
    return { ok: true, message: `Você coletou ${total} de ${getResourceName(resource)}.` };
  };

  const handlePlayYearOfPlenty = (
    resources: Record<ResourceType, number>,
  ): DevCardPlayResult => {
    const context = gameContextRef.current;

    if (context === null) {
      return { ok: false, message: "Jogo não inicializado." };
    }

    const { gameState } = context;
    const current = gameState.currentPlayer;

    if (current === undefined) {
      return { ok: false, message: "Nenhum jogador ativo." };
    }

    try {
      gameState.playYearOfPlenty(current.id, resources);
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Falha ao jogar.",
      };
    }

    gameState.addActionLog(`${current.name} jogou Ano de Fartura.`);
    inputControllerRef.current?.setStatusMessage(
      "Ano de Fartura: recursos recebidos do banco.",
    );
    return { ok: true, message: "Recursos recebidos do banco." };
  };

  const handlePlayRoadBuilding = (): DevCardPlayResult => {
    const context = gameContextRef.current;

    if (context === null) {
      return { ok: false, message: "Jogo não inicializado." };
    }

    const { gameState } = context;
    const current = gameState.currentPlayer;

    if (current === undefined) {
      return { ok: false, message: "Nenhum jogador ativo." };
    }

    try {
      gameState.playRoadBuilding(current.id);
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Falha ao jogar.",
      };
    }

    gameState.addActionLog(`${current.name} jogou Construção de Estradas.`);
    inputControllerRef.current?.startRoadBuildingMode();
    return {
      ok: true,
      message: "Construa até 2 estradas grátis no tabuleiro.",
    };
  };

  const handleConfirmDiscard = (
    resources: Record<ResourceType, number>,
  ): DiscardResult => {
    const context = gameContextRef.current;

    if (context === null) {
      return { ok: false, message: "Jogo não inicializado." };
    }

    const { gameState } = context;

    try {
      gameState.discardForPlayer(discardData.playerId, resources);
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Falha ao descartar.",
      };
    }

    gameState.addActionLog(
      `${discardData.playerName} descartou ${formatTradeList(resources)}.`,
    );
    gameState.finalizeDiscardPhaseIfReady();

    discardActiveRef.current = false;
    setIsDiscardModalOpen(false);
    return { ok: true, message: "Descartado." };
  };

  const handlePickVictim = (victimId: string) => {
    setIsVictimModalOpen(false);
    setVictimOptions([]);
    inputControllerRef.current?.chooseRobberVictim(victimId);
  };

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
      ? players.map((p, i) => new Player(`player-${i + 1}`, p.name || `Jogador ${i + 1}`, p.kind))
      : [new Player("player-1", "Jogador 1"), new Player("player-2", "Jogador 2")];

    // Mapa de id -> avatarSrc para uso no painel
    const avatarMap: Record<string, string> = {};
    players.forEach((p, i) => { avatarMap[`player-${i + 1}`] = p.avatarSrc; });
    avatarMapRef.current = avatarMap;

    const gameState = new GameState(board, gamePlayers);
    gameContextRef.current = { gameState, players: gamePlayers };
    const constructionRules = new ConstructionRules(board, gameState);
    const resourceDistributionService = new ResourceDistributionService(gameState);
    const botController = new BotController(
      board,
      gameState,
      constructionRules,
      resourceDistributionService,
    );
    const inputController = new GameInputController(
      canvas,
      board,
      gameState,
      constructionRules,
      resourceDistributionService,
    );

    inputController.setOnDiceRoll((result: DiceRollResult) => {
      setIsRollingDice(true);
      setDiceResult(result);
    });

    inputController.setOnRobberVictimChoice((victimIds: string[]) => {
      const options: RobberVictimOption[] = victimIds.map((id) => {
        const victim = gameState.getPlayerById(id);
        return {
          id,
          name: victim?.name ?? id,
          resourceCount: victim?.getTotalResources() ?? 0,
          avatarSrc: avatarMap[id],
        };
      });
      setVictimOptions(options);
      setIsVictimModalOpen(true);
    });

    inputControllerRef.current = inputController;

    const hud = document.createElement("div");
    hud.className = "game-ui";
    hud.innerHTML = `
      <div class="top-bar">
        <div class="top-bar__brand">
          <div class="top-bar__logo">C</div>
          <div class="top-bar__title-wrap">
            <div class="top-bar__eyebrow">Catan</div>
            <div class="top-bar__title">Partida</div>
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
        <button id="buyCardButton">Comprar Carta</button>
        <button id="cardsButton">Usar Carta</button>
        <button id="discardButton">Descartar</button>
        <button id="passButton">Passar Turno</button>
        <button id="tradeButton">Negociar</button>
        <button id="menuButton">↩ Menu</button>
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
      <details class="debug-panel" open>
        <summary class="debug-panel__title">Debug</summary>
        <div id="debugPanelContent" class="debug-panel__content"></div>
      </details>
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
    const menuButton = hud.querySelector<HTMLButtonElement>("#menuButton");
    const buyCardButton = hud.querySelector<HTMLButtonElement>("#buyCardButton");
    const cardsButton = hud.querySelector<HTMLButtonElement>("#cardsButton");
    const devCardsList = hud.querySelector<HTMLDivElement>("#devCardsList");
    const phaseBadge = hud.querySelector<HTMLDivElement>("#phaseBadge");
    const currentPlayerText = hud.querySelector<HTMLDivElement>("#currentPlayerText");
    const victoryPointsText = hud.querySelector<HTMLDivElement>("#victoryPointsText");
    const resourceText = hud.querySelector<HTMLDivElement>("#resourceText");
    const statusText = hud.querySelector<HTMLDivElement>("#statusText");
    const gameLogList = hud.querySelector<HTMLDivElement>("#gameLogList");
    const debugPanelContent = hud.querySelector<HTMLDivElement>("#debugPanelContent");
    const winnerBanner = hud.querySelector<HTMLDivElement>("#winnerBanner");
    const playersList = hud.querySelector<HTMLDivElement>("#playersList");

    if (
      rollButton === null || settlementButton === null || roadButton === null ||
      cityButton === null || discardButton === null || passButton === null ||
      phaseBadge === null || currentPlayerText === null || victoryPointsText === null ||
      resourceText === null || statusText === null || gameLogList === null ||
      debugPanelContent === null || winnerBanner === null ||
      playersList === null || tradeButton === null || menuButton === null ||
      buyCardButton === null || cardsButton === null || devCardsList === null
    ) {
      throw new Error("HUD elements not found");
    }

    const hudRefs = {
      rollButton, settlementButton, roadButton, cityButton, discardButton,
      passButton, tradeButton, menuButton, buyCardButton, cardsButton, devCardsList,
      phaseBadge, currentPlayerText, victoryPointsText,
      resourceText, statusText, gameLogList, debugPanelContent, winnerBanner,
      playersList,
    };

    const handleRoll = () => inputController.rollDice();
    const handleSettlement = () => inputController.setMode("build-settlement");
    const handleRoad = () => inputController.setMode("build-road");
    const handleCity = () => inputController.setMode("upgrade-settlement");
    const handleDiscard = () => syncDiscardModal();
    const handlePass = () => inputController.passTurn();
    const handleBuyCard = () => inputController.buyDevelopmentCard();
    const handleOpenCards = () => openCardsModal();
    const handleTrade = () => {
      const current = gameState.currentPlayer;
      setCurrentPlayerName(current.name);
      const others = gamePlayers
        .filter(p => p.id !== current.id)
        .map(p => ({
          name: p.name,
          avatarSrc: avatarMap[p.id] || '/avatar-placeholder.png'
        }));
      setOtherPlayers(others);

      const rates = gameState.getBankTradeRates(current.id);
      const ratesByLabel: Record<string, number> = {};
      (Object.entries(TRADE_LABEL_TO_RESOURCE) as Array<[string, ResourceType]>)
        .forEach(([label, resourceType]) => {
          ratesByLabel[label] = rates[resourceType];
        });
      setBankRates(ratesByLabel);

      setIsTradeModalOpen(true);
    };
    const handleMenu = () => {
      if (window.confirm("Voltar ao menu? A partida atual será perdida.")) {
        onBack();
      }
    };

    hudRefs.buyCardButton.addEventListener("click", handleBuyCard);
    hudRefs.cardsButton.addEventListener("click", handleOpenCards);
    hudRefs.menuButton.addEventListener("click", handleMenu);
    hudRefs.rollButton.addEventListener("click", handleRoll);
    hudRefs.settlementButton.addEventListener("click", handleSettlement);
    hudRefs.roadButton.addEventListener("click", handleRoad);
    hudRefs.cityButton.addEventListener("click", handleCity);
    hudRefs.discardButton.addEventListener("click", handleDiscard);
    hudRefs.passButton.addEventListener("click", handlePass);
    hudRefs.tradeButton.addEventListener("click", handleTrade);

    const handleResize = () => resizeCanvas();
    window.addEventListener("resize", handleResize);

    function renderDebugPanel() {
      const currentPlayer = gameState.getCurrentPlayer();
      const renderState = inputController.getRenderState();
      const robberTile = renderState.robberTile;
      const settlementCount = board.settlements.filter(
        (settlement) => settlement.level === "settlement",
      ).length;
      const cityCount = board.settlements.filter(
        (settlement) => settlement.level === "city",
      ).length;
      const ownedRoadCount = board.roads.filter((road) => road.isOwned()).length;
      const allResourcesInPlayers = gameState.players.reduce(
        (total, player) => total + player.getTotalResources(),
        0,
      );
      const holderName = (id: string | null) =>
        id ? gameState.getPlayerById(id)?.name ?? "-" : "-";

      const playerCards = gameState.players
        .map((player, index) => {
          const color = PLAYER_COLORS[index % PLAYER_COLORS.length];
          const isActive = currentPlayer?.id === player.id;
          const roads = board.roads.filter((r) => r.ownerId === player.id).length;
          const towns = board.settlements.filter(
            (s) => s.ownerId === player.id && s.level === "settlement",
          ).length;
          const cities = board.settlements.filter(
            (s) => s.ownerId === player.id && s.level === "city",
          ).length;
          const lr = gameState.longestRoadHolderId === player.id;
          const la = gameState.largestArmyHolderId === player.id;

          return `
            <div class="dbg-player ${isActive ? "dbg-player--active" : ""}" style="--pc:${color}">
              <div class="dbg-player__head">
                <span class="dbg-player__name">${escapeHtml(player.name)}</span>
                <span class="dbg-player__badges">
                  <span class="dbg-badge ${player.kind === "bot" ? "dbg-badge--bot" : "dbg-badge--hum"}">${player.kind === "bot" ? "BOT" : "HUM"}</span>
                  ${isActive ? '<span class="dbg-badge dbg-badge--turn">VEZ</span>' : ""}
                  ${lr ? '<span class="dbg-badge" title="Maior Estrada">🛣️</span>' : ""}
                  ${la ? '<span class="dbg-badge" title="Maior Exército">⚔️</span>' : ""}
                </span>
                <span class="dbg-player__vp">${player.victoryPoints} PV</span>
              </div>
              <div class="dbg-chips">${resourceChips(player.resources)}</div>
              <div class="dbg-player__meta">
                <span>mapa E${roads} A${towns} C${cities}</span>
                <span>estoque E${player.pieces.roads} A${player.pieces.settlements} C${player.pieces.cities}</span>
                <span>cartas ${player.developmentCards.length} · cav ${player.playedKnights}</span>
              </div>
            </div>`;
        })
        .join("");

      hudRefs.debugPanelContent.innerHTML = `
        <div class="dbg-section">
          <div class="dbg-section__title">Turno</div>
          <div class="dbg-grid">
            <span>Fase</span><strong>${escapeHtml(gameState.phase)}</strong>
            <span>Rodada</span><strong>${gameState.turnNumber}</strong>
            <span>Jogador</span><strong>${escapeHtml(currentPlayer?.name ?? "-")}</strong>
            <span>Modo</span><strong>${escapeHtml(inputController.getMode())}</strong>
            <span>Rolou?</span><strong>${gameState.hasRolledDiceThisTurn ? "sim" : "não"}</strong>
            <span>Carta usada?</span><strong>${gameState.hasPlayedDevelopmentCardThisTurn ? "sim" : "não"}</strong>
            <span>Setup</span><strong>${gameState.isInitialPlacementActive() ? gameState.getInitialPlacementStep() ?? "-" : "fim"}</strong>
            <span>Estr. grátis</span><strong>${gameState.freeRoadsRemaining}</strong>
            <span>Ladrão</span><strong>${robberTile ? `${robberTile.q}:${robberTile.r} ${robberTile.type}` : "-"}</strong>
          </div>
        </div>

        <div class="dbg-section">
          <div class="dbg-section__title">Banco · baralho ${gameState.getDevelopmentDeckCount()}</div>
          <div class="dbg-chips">${resourceChips(gameState.bank)}</div>
        </div>

        <div class="dbg-section">
          <div class="dbg-section__title">Bônus</div>
          <div class="dbg-grid">
            <span>🛣️ Maior Estrada</span><strong>${escapeHtml(holderName(gameState.longestRoadHolderId))}</strong>
            <span>⚔️ Maior Exército</span><strong>${escapeHtml(holderName(gameState.largestArmyHolderId))}</strong>
          </div>
        </div>

        <div class="dbg-section">
          <div class="dbg-section__title">Jogadores</div>
          <div class="dbg-players">${playerCards}</div>
        </div>

        <div class="dbg-section">
          <div class="dbg-section__title">Tabuleiro</div>
          <div class="dbg-grid">
            <span>Hex / vért / arest</span><strong>${board.tiles.length} / ${board.vertices.length} / ${board.roads.length}</strong>
            <span>Construções</span><strong>E ${ownedRoadCount} · A ${settlementCount} · C ${cityCount}</strong>
            <span>Portos</span><strong>${board.harbors.length}</strong>
            <span>Recursos c/ jogadores</span><strong>${allResourcesInPlayers}</strong>
          </div>
        </div>

        <div class="dbg-section">
          <div class="dbg-section__title">Seleção / hover</div>
          <div class="dbg-grid dbg-grid--mono">
            <span>sel vértice</span><strong>${escapeHtml(renderState.selectedVertexId ?? "-")}</strong>
            <span>sel aresta</span><strong>${escapeHtml(renderState.selectedRoadId ?? "-")}</strong>
            <span>hover vértice</span><strong>${escapeHtml(renderState.hoveredVertexId ?? "-")}</strong>
            <span>hover aresta</span><strong>${escapeHtml(renderState.hoveredRoadId ?? "-")}</strong>
            <span>hover hex</span><strong>${escapeHtml(renderState.hoveredTileKey ?? "-")}</strong>
          </div>
        </div>

        <div class="dbg-section">
          <div class="dbg-section__title">Status interno</div>
          <div class="dbg-status">${escapeHtml(inputController.getStatusMessage())}</div>
        </div>
      `;
    }

    function renderHud() {
      const currentPlayer = gameState.getCurrentPlayer();
      const winner = gameState.getWinner();
      const isInitialPlacement = gameState.isInitialPlacementActive();
      const initialStep = gameState.getInitialPlacementStep();
      const isBotTurn = currentPlayer?.kind === "bot";

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
          <span class="piece-stock">
            Peças: Estradas ${currentPlayer.pieces.roads} · Aldeias ${currentPlayer.pieces.settlements} · Cidades ${currentPlayer.pieces.cities}
          </span>
        `
        : "-";
      hudRefs.statusText.textContent = winner
        ? `${winner.name} venceu a partida!`
        : isBotTurn
          ? `${currentPlayer.name} está jogando automaticamente.`
          : inputController.getStatusMessage();
      hudRefs.gameLogList.replaceChildren(
        ...gameState.getActionLog().map((action) => {
          const item = document.createElement("div");
          item.className = "game-log__item";
          item.textContent = action;
          return item;
        }),
      );
      renderDebugPanel();

      hudRefs.winnerBanner.textContent = winner
        ? `${winner.name} venceu com ${winner.victoryPoints} Pontuação`
        : "";

      // Mostrar tela de vitória quando o jogo terminar
      if (winner && !victoryData) {
        setVictoryData({
          playerName: winner.name,
          playerAvatarSrc: avatarMap[winner.id] ?? "/assets/images/avatars/avatar1.png",
          victoryPoints: winner.victoryPoints,
        });
      }

      // Painel lateral de jogadores — adaptável para N jogadores
      const currentPlayerId = currentPlayer?.id ?? "";
      hudRefs.playersList.innerHTML = gameState.players.map((p, i) => {
        const isActive = p.id === currentPlayerId;
        const avatarSrc = avatarMap[p.id] ?? "/assets/images/avatars/avatar1.png";
        const color = PLAYER_COLORS[i % PLAYER_COLORS.length];
        const playerName = escapeHtml(p.name);
        const playerNameUpper = escapeHtml(p.name.toUpperCase());
        const badges = [
          gameState.longestRoadHolderId === p.id ? "🛣️" : "",
          gameState.largestArmyHolderId === p.id ? "⚔️" : "",
        ].join("");

        return `
          <div class="player-card ${isActive ? "player-card--active" : ""}" style="--player-color:${color}">
            <div class="player-card__avatar-wrap" style="border-color:${color}">
              <img class="player-card__avatar" src="${avatarSrc}" alt="${playerName}" />
            </div>
            <div class="player-card__info">
              <span class="player-card__name" style="color:${isActive ? color : "#f1f5f9"}">${playerNameUpper} ${badges}</span>
              <span class="player-card__kind">${p.kind === "bot" ? "BOT" : "HUMANO"}</span>
              <span class="player-card__vp">${p.victoryPoints}</span>
              <span class="player-card__pieces">E ${p.pieces.roads} · A ${p.pieces.settlements} · C ${p.pieces.cities}</span>
            </div>
            ${isActive ? "<span class='player-card__star'>&#9733;</span>" : ""}
          </div>`;
      }).join("");

      const gameOver = gameState.isFinished();
      hudRefs.rollButton.disabled =
        gameOver || isBotTurn || gameState.phase !== "roll-dice";
      hudRefs.settlementButton.disabled = isInitialPlacement
        ? initialStep !== "settlement" ||
          !gameState.canCurrentPlayerPlaceInitialSettlement() ||
          isBotTurn
        : gameOver ||
          isBotTurn ||
          gameState.phase !== "main-actions" ||
          !gameState.canCurrentPlayerBuildSettlement();
      hudRefs.roadButton.disabled = isInitialPlacement
        ? initialStep !== "road" ||
          !gameState.canCurrentPlayerPlaceInitialRoad() ||
          isBotTurn
        : gameOver ||
          isBotTurn ||
          gameState.phase !== "main-actions" ||
          !gameState.canCurrentPlayerBuildRoad();
      hudRefs.cityButton.disabled =
        gameOver ||
        isBotTurn ||
        isInitialPlacement ||
        gameState.phase !== "main-actions" ||
        !gameState.canCurrentPlayerUpgradeSettlement();
      const humanMustDiscard = gameState
        .getPendingDiscardPlayerIds()
        .some((id) => gameState.getPlayerById(id)?.kind === "human");
      hudRefs.discardButton.disabled = gameOver || !humanMustDiscard;
      hudRefs.passButton.disabled =
        gameOver ||
        isBotTurn ||
        isInitialPlacement ||
        gameState.phase !== "main-actions";
      hudRefs.tradeButton.disabled =
        gameOver ||
        isBotTurn ||
        isInitialPlacement ||
        gameState.phase !== "main-actions";
      hudRefs.buyCardButton.disabled =
        gameOver ||
        isBotTurn ||
        isInitialPlacement ||
        currentPlayer === undefined ||
        !gameState.canBuyDevelopmentCard(currentPlayer.id);
      hudRefs.cardsButton.disabled =
        gameOver ||
        isBotTurn ||
        isInitialPlacement ||
        currentPlayer === undefined ||
        currentPlayer.developmentCards.length === 0 ||
        (gameState.phase !== "main-actions" && gameState.phase !== "roll-dice");

      // Painel de cartas: mostra as do jogador humano; oculta as de bots.
      if (currentPlayer === undefined) {
        hudRefs.devCardsList.innerHTML = "";
      } else if (currentPlayer.kind === "bot") {
        hudRefs.devCardsList.innerHTML = Array.from(
          { length: Math.max(currentPlayer.developmentCards.length, 1) },
          () =>
            `<div class="dev-card dev-card--unknown"><span class="dev-card__symbol">?</span></div>`,
        ).join("");
      } else if (currentPlayer.developmentCards.length === 0) {
        hudRefs.devCardsList.innerHTML =
          `<div class="dev-card dev-card--unknown"><span class="dev-card__symbol">—</span></div>`;
      } else {
        const counts = currentPlayer.getDevelopmentCardCounts();
        hudRefs.devCardsList.innerHTML = (
          Object.entries(counts) as Array<[keyof typeof counts, number]>
        )
          .filter(([, amount]) => amount > 0)
          .map(
            ([type, amount]) =>
              `<div class="dev-card" style="position:relative" title="${escapeHtml(DEVELOPMENT_CARD_NAMES[type])}"><span class="dev-card__symbol">${DEV_CARD_SYMBOLS[type]}</span>${amount > 1 ? `<span style="position:absolute;bottom:4px;right:6px;font-size:12px;font-weight:800;color:#fcd34d;">×${amount}</span>` : ""}</div>`,
          )
          .join("");
      }
    }

    let animationId = 0;

    // Abre o modal de descarte quando um humano precisa descartar (saiu 7).
    function syncDiscardModal() {
      if (discardActiveRef.current) {
        return;
      }

      const pendingHuman = gameState
        .getPendingDiscardPlayerIds()
        .map((id) => gameState.getPlayerById(id))
        .find((player) => player !== undefined && player.kind === "human");

      if (pendingHuman === undefined) {
        return;
      }

      discardActiveRef.current = true;
      setDiscardData({
        playerId: pendingHuman.id,
        playerName: pendingHuman.name,
        required: gameState.getRequiredDiscardCount(pendingHuman.id),
        available: cloneResourceInventory(pendingHuman.resources),
      });
      setIsDiscardModalOpen(true);
    }

    function gameLoop(t: number) {

      // 1. Fundo de mar animado
      oceanRenderer.drawOcean(t);

      // 2. Tabuleiro
      boardRenderer.render(inputController.getRenderState());

      botController.tick();
      syncDiscardModal();
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
      hudRefs.menuButton.removeEventListener("click", handleMenu);
      hudRefs.buyCardButton.removeEventListener("click", handleBuyCard);
      hudRefs.cardsButton.removeEventListener("click", handleOpenCards);
      botController.dispose();
      inputController.dispose();
      hud.remove();
      gameContextRef.current = null;
      gameInitialized.current = false;
    };
  }, [players, onBack]);

  const handleDiceRollingComplete = () => {
    setIsRollingDice(false);
  };

  return (
    <>
      <canvas id="game" ref={canvasRef} />
      {diceResult && (
        <DiceRoller
          isRolling={isRollingDice}
          die1={diceResult.die1}
          die2={diceResult.die2}
          total={diceResult.total}
          onRollingComplete={handleDiceRollingComplete}
        />
      )}
      <TradeModal
        key={isTradeModalOpen ? "trade-open" : "trade-closed"}
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        currentPlayerName={currentPlayerName}
        otherPlayers={otherPlayers}
        bankRates={bankRates}
        onBankTrade={handleBankTrade}
        onPlayerTrade={handlePlayerTrade}
      />
      <DevelopmentCardsModal
        key={isCardsModalOpen ? "cards-open" : "cards-closed"}
        isOpen={isCardsModalOpen}
        onClose={() => setIsCardsModalOpen(false)}
        entries={cardModalData.entries}
        victoryPointCards={cardModalData.victoryPointCards}
        canPlayThisTurn={cardModalData.canPlayThisTurn}
        deckCount={cardModalData.deckCount}
        onPlayKnight={handlePlayKnight}
        onPlayMonopoly={handlePlayMonopoly}
        onPlayYearOfPlenty={handlePlayYearOfPlenty}
        onPlayRoadBuilding={handlePlayRoadBuilding}
      />
      <DiscardModal
        key={isDiscardModalOpen ? "discard-open" : "discard-closed"}
        isOpen={isDiscardModalOpen}
        playerName={discardData.playerName}
        required={discardData.required}
        available={discardData.available}
        onConfirm={handleConfirmDiscard}
      />
      <RobberVictimModal
        key={isVictimModalOpen ? "victim-open" : "victim-closed"}
        isOpen={isVictimModalOpen}
        victims={victimOptions}
        onPick={handlePickVictim}
      />
      {victoryData && (
        <VictoryScreen
          playerName={victoryData.playerName}
          playerAvatarSrc={victoryData.playerAvatarSrc}
          victoryPoints={victoryData.victoryPoints}
          onReturnToMenu={onBack}
        />
      )}
    </>
  )
};

export default Game;
