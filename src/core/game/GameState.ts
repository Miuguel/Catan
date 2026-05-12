import { Board } from "../board/Board";
import { Player } from "./Player";
import type { ResourceInventory } from "./ResourceInventory";
import type { TurnPhase } from "./TurnPhase";

const CONSTRUCTION_COST = {
  road: {
    brick: 1,
    lumber: 1,
    wool: 0,
    grain: 0,
    ore: 0,
  },
  settlement: {
    brick: 1,
    lumber: 1,
    wool: 1,
    grain: 1,
    ore: 0,
  },
  city: {
    brick: 0,
    lumber: 0,
    wool: 0,
    grain: 2,
    ore: 3,
  },
  developmentCard: {
    brick: 0,
    lumber: 0,
    wool: 1,
    grain: 1,
    ore: 1,
  },
} as const satisfies {
  road: Partial<ResourceInventory>;
  settlement: Partial<ResourceInventory>;
  city: Partial<ResourceInventory>;
  developmentCard: Partial<ResourceInventory>;
};

export type RobberyResult = {
  stolenFromPlayerId: string | null;
  resourceType: keyof ResourceInventory | null;
};

export class GameState {
  board: Board;
  players: Player[];
  currentPlayerIndex: number;
  phase: TurnPhase;
  turnNumber: number;
  winnerId: string | null;
  private initialPlacementRound: 1 | 2 | 0;
  private initialPlacementStep: "settlement" | "road" | null;
  private initialPlacementCursor: number;
  private initialPlacementSettlementCount: Record<string, number>;
  private initialPlacementRoadCount: Record<string, number>;
  private actionLog: string[];

  constructor(board: Board, players: Player[] = []) {
    this.board = board;
    this.players = players;
    this.currentPlayerIndex = 0;
    this.phase = "initial-placement";
    this.turnNumber = 1;
    this.winnerId = null;
    this.initialPlacementRound = 1;
    this.initialPlacementStep = "settlement";
    this.initialPlacementCursor = 0;
    this.initialPlacementSettlementCount = {};
    this.initialPlacementRoadCount = {};
    this.actionLog = ["Partida iniciada."];

    this.players.forEach((player) => {
      this.initialPlacementSettlementCount[player.id] = 0;
      this.initialPlacementRoadCount[player.id] = 0;
    });
  }

  get currentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  getPlayerById(playerId: string) {
    return this.players.find((player) => player.id === playerId);
  }

  addActionLog(message: string) {
    this.actionLog = [message, ...this.actionLog].slice(0, 12);
  }

  getActionLog() {
    return [...this.actionLog];
  }

  addPlayer(player: Player) {
    this.players.push(player);
    this.initialPlacementSettlementCount[player.id] = 0;
    this.initialPlacementRoadCount[player.id] = 0;
  }

  setPhase(phase: TurnPhase) {
    this.phase = phase;
  }

  isInitialPlacementActive() {
    return this.phase === "initial-placement";
  }

  getInitialPlacementStep() {
    return this.initialPlacementStep;
  }

  getInitialPlacementSettlementCount(playerId: string) {
    return this.initialPlacementSettlementCount[playerId] ?? 0;
  }

  canCurrentPlayerPlaceInitialSettlement() {
    const player = this.currentPlayer;

    if (
      !this.isInitialPlacementActive() ||
      this.initialPlacementStep !== "settlement" ||
      player === undefined
    ) {
      return false;
    }

    return (this.initialPlacementSettlementCount[player.id] ?? 0) < 2;
  }

  canCurrentPlayerPlaceInitialRoad() {
    const player = this.currentPlayer;

    if (
      !this.isInitialPlacementActive() ||
      this.initialPlacementStep !== "road" ||
      player === undefined
    ) {
      return false;
    }

    return (this.initialPlacementRoadCount[player.id] ?? 0) < 2;
  }

  registerInitialPlacementSettlement(playerId: string) {
    if (
      !this.isInitialPlacementActive() ||
      this.initialPlacementStep !== "settlement"
    ) {
      throw new Error("Initial placement settlement step is not active");
    }

    if (!this.isCurrentPlayer(playerId)) {
      throw new Error("Only the current player can place during initial setup");
    }

    this.initialPlacementSettlementCount[playerId] =
      (this.initialPlacementSettlementCount[playerId] ?? 0) + 1;
    this.initialPlacementStep = "road";
  }

  registerInitialPlacementRoad(playerId: string) {
    if (
      !this.isInitialPlacementActive() ||
      this.initialPlacementStep !== "road"
    ) {
      throw new Error("Initial placement road step is not active");
    }

    if (!this.isCurrentPlayer(playerId)) {
      throw new Error("Only the current player can place during initial setup");
    }

    this.initialPlacementRoadCount[playerId] =
      (this.initialPlacementRoadCount[playerId] ?? 0) + 1;

    this.advanceInitialPlacementTurn();
  }

  rollDice() {
    const roll = this.rollDie() + this.rollDie();

    this.phase = roll === 7 ? "discard" : "main-actions";

    return roll;
  }

  private rollDie() {
    return Math.floor(Math.random() * 6) + 1;
  }

  nextTurn() {
    if (this.players.length === 0) {
      return;
    }

    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.players.length;

    if (this.currentPlayerIndex === 0) {
      this.turnNumber += 1;
    }

    this.phase = "roll-dice";
  }

  setWinner(playerId: string) {
    this.winnerId = playerId;
  }

  awardVictoryPoints(playerId: string, points: number) {
    const player = this.getPlayerById(playerId);

    if (player === undefined) {
      throw new Error(`Player ${playerId} not found`);
    }

    player.addVictoryPoints(points);

    if (player.victoryPoints >= 10 && this.currentPlayer?.id === playerId) {
      this.setWinner(playerId);
    }
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  canCurrentPlayerAfford(cost: Partial<ResourceInventory>) {
    const player = this.currentPlayer;

    if (player === undefined) {
      return false;
    }

    return player.canAfford(cost);
  }

  spendCurrentPlayerResources(cost: Partial<ResourceInventory>) {
    const player = this.currentPlayer;

    if (player === undefined) {
      throw new Error("There is no current player");
    }

    player.spendResources(cost);
  }

  canCurrentPlayerBuildRoad() {
    return this.canCurrentPlayerAfford(CONSTRUCTION_COST.road);
  }

  canCurrentPlayerBuildSettlement() {
    return this.canCurrentPlayerAfford(CONSTRUCTION_COST.settlement);
  }

  canCurrentPlayerUpgradeSettlement() {
    return this.canCurrentPlayerAfford(CONSTRUCTION_COST.city);
  }

  canCurrentPlayerBuyDevelopmentCard() {
    return this.canCurrentPlayerAfford(CONSTRUCTION_COST.developmentCard);
  }

  spendForRoad() {
    this.spendCurrentPlayerResources(CONSTRUCTION_COST.road);
  }

  spendForSettlement() {
    this.spendCurrentPlayerResources(CONSTRUCTION_COST.settlement);
  }

  spendForCity() {
    this.spendCurrentPlayerResources(CONSTRUCTION_COST.city);
  }

  spendForDevelopmentCard() {
    this.spendCurrentPlayerResources(CONSTRUCTION_COST.developmentCard);
  }

  canTakeMainActions() {
    return this.phase === "main-actions";
  }

  resolveSevenDiscard() {
    this.players.forEach((player) => {
      const totalResources = player.getTotalResources();

      if (totalResources > 7) {
        player.discardResources(Math.floor(totalResources / 2));
      }
    });

    this.phase = "robber";
  }

  moveRobber(q: number, r: number): RobberyResult {
    const tile = this.board.getTileAtHex(q, r);
    const currentPlayer = this.currentPlayer;

    if (tile === undefined || currentPlayer === undefined) {
      throw new Error("Tile not found");
    }

    const currentRobberTile = this.board.tiles.find(
      (currentTile) => currentTile.hasRobber,
    );

    if (
      currentRobberTile !== undefined &&
      currentRobberTile.q === q &&
      currentRobberTile.r === r
    ) {
      throw new Error("Escolha um hexágono diferente para mover o ladrão");
    }

    this.board.tiles.forEach((currentTile) => {
      currentTile.hasRobber = false;
    });

    tile.hasRobber = true;

    const candidateVictimIds = Array.from(
      new Set(
        tile.vertexIds
          .map(
            (vertexId) =>
              this.board.getSettlementAtVertex(vertexId)?.ownerId ?? null,
          )
          .filter(
            (ownerId): ownerId is string =>
              ownerId !== null && ownerId !== currentPlayer.id,
          ),
      ),
    );

    const candidateVictims = candidateVictimIds
      .map((playerId) => this.getPlayerById(playerId))
      .filter((player): player is Player => player !== undefined)
      .filter((player) => player.getTotalResources() > 0);

    let stolenFromPlayerId: string | null = null;
    let resourceType: keyof ResourceInventory | null = null;

    if (candidateVictims.length > 0) {
      const randomVictimIndex = Math.floor(
        Math.random() * candidateVictims.length,
      );
      const victim = candidateVictims[randomVictimIndex];
      const stolenResource = victim.takeRandomResource();

      if (stolenResource !== null) {
        currentPlayer.addResource(stolenResource, 1);
        stolenFromPlayerId = victim.id;
        resourceType = stolenResource;
      }
    }

    this.phase = "main-actions";

    return {
      stolenFromPlayerId,
      resourceType,
    };
  }

  isCurrentPlayer(playerId: string) {
    return this.currentPlayer?.id === playerId;
  }

  isFinished() {
    return this.winnerId !== null;
  }

  getWinner() {
    if (this.winnerId === null) {
      return null;
    }

    return this.getPlayerById(this.winnerId) ?? null;
  }

  private advanceInitialPlacementTurn() {
    if (this.players.length === 0) {
      return;
    }

    if (this.initialPlacementRound === 1) {
      if (this.initialPlacementCursor < this.players.length - 1) {
        this.initialPlacementCursor += 1;
        this.currentPlayerIndex = this.initialPlacementCursor;
        this.initialPlacementStep = "settlement";
        return;
      }

      this.initialPlacementRound = 2;
      this.currentPlayerIndex = this.initialPlacementCursor;
      this.initialPlacementStep = "settlement";
      return;
    }

    if (this.initialPlacementRound === 2) {
      if (this.initialPlacementCursor > 0) {
        this.initialPlacementCursor -= 1;
        this.currentPlayerIndex = this.initialPlacementCursor;
        this.initialPlacementStep = "settlement";
        return;
      }

      this.initialPlacementRound = 0;
      this.initialPlacementStep = null;
      this.phase = "roll-dice";
      this.currentPlayerIndex = 0;
    }
  }
}
