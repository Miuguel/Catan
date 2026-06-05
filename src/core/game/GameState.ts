import { Board } from "../board/Board";
import { ConstructionCost } from "./ConstructionCost";
import { Player } from "./Player";
import type { ResourceInventory } from "./ResourceInventory";
import type { ResourceType } from "./ResourceType";
import type { TurnPhase } from "./TurnPhase";

export type RobberyResult = {
  stolenFromPlayerId: string | null;
  resourceType: keyof ResourceInventory | null;
};

export type SevenDiscardResult = {
  playerId: string;
  discardedResources: Partial<ResourceInventory>;
};

export class GameState {
  board: Board;
  players: Player[];
  currentPlayerIndex: number;
  phase: TurnPhase;
  turnNumber: number;
  winnerId: string | null;
  bank: ResourceInventory;
  hasRolledDiceThisTurn: boolean;
  hasPlayedDevelopmentCardThisTurn: boolean;
  private initialPlacementRound: 1 | 2 | 0;
  private initialPlacementStep: "settlement" | "road" | null;
  private initialPlacementCursor: number;
  private initialPlacementSettlementCount: Record<string, number>;
  private initialPlacementRoadCount: Record<string, number>;
  private initialPlacementRoadAnchorVertexId: string | null;
  private actionLog: string[];

  constructor(board: Board, players: Player[] = []) {
    this.board = board;
    this.players = players;
    this.currentPlayerIndex = 0;
    this.phase = "initial-placement";
    this.turnNumber = 1;
    this.winnerId = null;
    this.bank = {
      brick: 19,
      lumber: 19,
      wool: 19,
      grain: 19,
      ore: 19,
    };
    this.hasRolledDiceThisTurn = false;
    this.hasPlayedDevelopmentCardThisTurn = false;
    this.initialPlacementRound = 1;
    this.initialPlacementStep = "settlement";
    this.initialPlacementCursor = 0;
    this.initialPlacementSettlementCount = {};
    this.initialPlacementRoadCount = {};
    this.initialPlacementRoadAnchorVertexId = null;
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
    this.actionLog = [message, ...this.actionLog].slice(0, 100);
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

    return (
      (this.initialPlacementSettlementCount[player.id] ?? 0) < 2 &&
      player.canBuildSettlementPiece()
    );
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

    return (
      (this.initialPlacementRoadCount[player.id] ?? 0) < 2 &&
      player.canBuildRoadPiece()
    );
  }

  registerInitialPlacementSettlement(playerId: string, vertexId: string) {
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
    this.initialPlacementRoadAnchorVertexId = vertexId;
    this.initialPlacementStep = "road";
  }

  getInitialPlacementRoadAnchorVertexId(playerId: string) {
    if (
      !this.isInitialPlacementActive() ||
      this.initialPlacementStep !== "road" ||
      !this.isCurrentPlayer(playerId)
    ) {
      return null;
    }

    return this.initialPlacementRoadAnchorVertexId;
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
    this.initialPlacementRoadAnchorVertexId = null;

    this.advanceInitialPlacementTurn();
  }

  rollDice() {
    if (this.phase !== "roll-dice") {
      throw new Error("Os dados só podem ser rolados no início do turno.");
    }

    if (this.hasRolledDiceThisTurn) {
      throw new Error("Os dados já foram rolados neste turno.");
    }

    const die1 = this.rollDie();
    const die2 = this.rollDie();
    const total = die1 + die2;

    this.hasRolledDiceThisTurn = true;
    this.phase = total === 7 ? "discard" : "main-actions";

    return { die1, die2, total };
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
    this.hasRolledDiceThisTurn = false;
    this.hasPlayedDevelopmentCardThisTurn = false;
  }

  setWinner(playerId: string) {
    this.winnerId = playerId;

    const winner = this.getPlayerById(playerId);
    this.addActionLog(`${winner?.name ?? playerId} venceu a partida.`);
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
    this.depositResourcesToBank(cost);
  }

  canBankAfford(resources: Partial<ResourceInventory>) {
    return (Object.keys(resources) as ResourceType[]).every((resourceType) => {
      const amount = resources[resourceType] ?? 0;

      return this.bank[resourceType] >= amount;
    });
  }

  withdrawResourcesFromBank(resources: Partial<ResourceInventory>) {
    if (!this.canBankAfford(resources)) {
      return false;
    }

    (Object.keys(resources) as ResourceType[]).forEach((resourceType) => {
      this.bank[resourceType] -= resources[resourceType] ?? 0;
    });

    return true;
  }

  depositResourcesToBank(resources: Partial<ResourceInventory>) {
    (Object.keys(resources) as ResourceType[]).forEach((resourceType) => {
      this.bank[resourceType] += resources[resourceType] ?? 0;
    });
  }

  exchangeWithBank(
    playerId: string,
    offeredResource: ResourceType,
    requestedResource: ResourceType,
    rate = 4,
  ) {
    if (offeredResource === requestedResource) {
      throw new Error("Escolha recursos diferentes para trocar com o banco.");
    }

    if (!Number.isInteger(rate) || rate <= 0) {
      throw new Error("A taxa de troca com o banco deve ser positiva.");
    }

    const player = this.getPlayerById(playerId);

    if (player === undefined) {
      throw new Error(`Player ${playerId} not found`);
    }

    const offeredResources: Partial<ResourceInventory> = {
      [offeredResource]: rate,
    };
    const requestedResources: Partial<ResourceInventory> = {
      [requestedResource]: 1,
    };

    if (!player.canAfford(offeredResources)) {
      throw new Error("O jogador não possui recursos suficientes para a troca.");
    }

    if (!this.canBankAfford(requestedResources)) {
      throw new Error("O banco não possui o recurso solicitado.");
    }

    if (!this.withdrawResourcesFromBank(requestedResources)) {
      throw new Error("Falha ao retirar recurso do banco.");
    }

    player.spendResources(offeredResources);
    this.depositResourcesToBank(offeredResources);
    player.addResources(requestedResources);
  }

  canCurrentPlayerBuildRoad() {
    return (
      this.currentPlayer?.canBuildRoadPiece() === true &&
      this.canCurrentPlayerAfford(ConstructionCost.road)
    );
  }

  canCurrentPlayerBuildSettlement() {
    return (
      this.currentPlayer?.canBuildSettlementPiece() === true &&
      this.canCurrentPlayerAfford(ConstructionCost.settlement)
    );
  }

  canCurrentPlayerUpgradeSettlement() {
    return (
      this.currentPlayer?.canBuildCityPiece() === true &&
      this.canCurrentPlayerAfford(ConstructionCost.city)
    );
  }

  canCurrentPlayerBuyDevelopmentCard() {
    return this.canCurrentPlayerAfford(ConstructionCost.developmentCard);
  }

  spendForRoad() {
    this.spendCurrentPlayerResources(ConstructionCost.road);
  }

  spendForSettlement() {
    this.spendCurrentPlayerResources(ConstructionCost.settlement);
  }

  spendForCity() {
    this.spendCurrentPlayerResources(ConstructionCost.city);
  }

  spendForDevelopmentCard() {
    this.spendCurrentPlayerResources(ConstructionCost.developmentCard);
  }

  canPlayDevelopmentCardThisTurn() {
    return !this.hasPlayedDevelopmentCardThisTurn;
  }

  markDevelopmentCardPlayed() {
    if (this.hasPlayedDevelopmentCardThisTurn) {
      throw new Error("Uma carta de desenvolvimento já foi usada neste turno.");
    }

    this.hasPlayedDevelopmentCardThisTurn = true;
  }

  canTakeMainActions() {
    return this.phase === "main-actions";
  }

  resolveSevenDiscard(): SevenDiscardResult[] {
    const discardResults: SevenDiscardResult[] = [];

    this.players.forEach((player) => {
      const totalResources = player.getTotalResources();

      if (totalResources > 7) {
        const discardedResources = player.discardResources(
          Math.floor(totalResources / 2),
        );

        this.depositResourcesToBank(discardedResources);
        discardResults.push({
          playerId: player.id,
          discardedResources,
        });
      }
    });

    this.phase = "robber";
    return discardResults;
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
      this.hasRolledDiceThisTurn = false;
      this.hasPlayedDevelopmentCardThisTurn = false;
    }
  }
}