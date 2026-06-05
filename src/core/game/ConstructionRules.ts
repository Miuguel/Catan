import { Board } from "../board/Board";
import { Settlement } from "../board/Settlement";
import { ConstructionCost } from "./ConstructionCost";
import { GameState } from "./GameState";

export class ConstructionRules {
  constructor(
    private readonly board: Board,
    private readonly gameState: GameState,
  ) {}

  canBuildSettlement(
    vertexId: string,
    playerId: string,
    isInitialPlacement = false,
  ) {
    const player = this.gameState.getPlayerById(playerId);

    if (player === undefined || !player.canBuildSettlementPiece()) {
      return false;
    }

    if (!this.gameState.isCurrentPlayer(playerId)) {
      return false;
    }

    if (
      isInitialPlacement &&
      !this.gameState.canCurrentPlayerPlaceInitialSettlement()
    ) {
      return false;
    }

    if (
      !isInitialPlacement &&
      !this.gameState.canCurrentPlayerAfford(ConstructionCost.settlement)
    ) {
      return false;
    }

    if (!isInitialPlacement && !this.gameState.canTakeMainActions()) {
      return false;
    }

    const vertex = this.board.getVertex(vertexId);

    if (vertex === undefined || vertex.isOccupied()) {
      return false;
    }

    const respectsDistanceRule = vertex.adjacentVertexIds.every(
      (adjacentVertexId) => {
        const adjacentVertex = this.board.getVertex(adjacentVertexId);

        return adjacentVertex === undefined || !adjacentVertex.isOccupied();
      },
    );

    if (!respectsDistanceRule) {
      return false;
    }

    if (isInitialPlacement) {
      return true;
    }

    return vertex.connectedRoadIds.some((roadId) => {
      const road = this.board.getRoadById(roadId);

      return road !== undefined && road.ownerId === playerId;
    });
  }

  /**
   * Retorna uma mensagem explicando por que a aldeia não pode ser construída
   * no vértice (fora da fase inicial), ou null se a construção é permitida.
   */
  describeSettlementPlacementIssue(
    vertexId: string,
    playerId: string,
  ): string | null {
    const player = this.gameState.getPlayerById(playerId);

    if (player === undefined) {
      return "Jogador não encontrado.";
    }

    if (!player.canBuildSettlementPiece()) {
      return "Você não tem mais peças de aldeia disponíveis.";
    }

    if (!this.gameState.isCurrentPlayer(playerId)) {
      return "Aguarde: não é o seu turno.";
    }

    if (!this.gameState.canTakeMainActions()) {
      return "Você só pode construir na fase principal (após rolar os dados).";
    }

    if (!this.gameState.canCurrentPlayerAfford(ConstructionCost.settlement)) {
      return "Recursos insuficientes: a aldeia custa 1 tijolo, 1 madeira, 1 lã e 1 trigo.";
    }

    const vertex = this.board.getVertex(vertexId);

    if (vertex === undefined) {
      return "Clique em um vértice válido para construir a aldeia.";
    }

    if (vertex.isOccupied()) {
      return "Já existe uma construção neste vértice.";
    }

    const respectsDistanceRule = vertex.adjacentVertexIds.every(
      (adjacentVertexId) => {
        const adjacentVertex = this.board.getVertex(adjacentVertexId);

        return adjacentVertex === undefined || !adjacentVertex.isOccupied();
      },
    );

    if (!respectsDistanceRule) {
      return "Muito perto de outra construção: deixe ao menos 2 vértices de distância.";
    }

    const hasConnectingRoad = vertex.connectedRoadIds.some((roadId) => {
      const road = this.board.getRoadById(roadId);

      return road !== undefined && road.ownerId === playerId;
    });

    if (!hasConnectingRoad) {
      return "A aldeia precisa estar ligada a uma estrada sua. Construa uma estrada até este ponto primeiro.";
    }

    return null;
  }

  canUpgradeSettlement(vertexId: string, playerId: string) {
    const player = this.gameState.getPlayerById(playerId);

    if (player === undefined || !player.canBuildCityPiece()) {
      return false;
    }

    if (!this.gameState.isCurrentPlayer(playerId)) {
      return false;
    }

    if (!this.gameState.canCurrentPlayerAfford(ConstructionCost.city)) {
      return false;
    }

    if (!this.gameState.canTakeMainActions()) {
      return false;
    }

    const settlement = this.board.getSettlementAtVertex(vertexId);

    return (
      settlement !== undefined &&
      settlement.ownerId === playerId &&
      settlement.level === "settlement"
    );
  }

  canBuildRoad(
    vertexAId: string,
    vertexBId: string,
    playerId: string,
    isInitialPlacement = false,
  ) {
    const player = this.gameState.getPlayerById(playerId);

    if (player === undefined || !player.canBuildRoadPiece()) {
      return false;
    }

    if (!this.gameState.isCurrentPlayer(playerId)) {
      return false;
    }

    if (
      !isInitialPlacement &&
      !this.gameState.hasFreeRoad() &&
      !this.gameState.canCurrentPlayerAfford(ConstructionCost.road)
    ) {
      return false;
    }

    if (!isInitialPlacement && !this.gameState.canTakeMainActions()) {
      return false;
    }

    const road = this.board.getRoadBetweenVertices(vertexAId, vertexBId);

    if (road === undefined || road.ownerId !== null) {
      return false;
    }

    if (isInitialPlacement) {
      const roadAnchorVertexId =
        this.gameState.getInitialPlacementRoadAnchorVertexId(playerId);

      return (
        roadAnchorVertexId !== null && road.connectsVertex(roadAnchorVertexId)
      );
    }

    const canBuild =
      this.canExtendRoadFromVertex(vertexAId, playerId) ||
      this.canExtendRoadFromVertex(vertexBId, playerId);

    return canBuild;
  }

  buildSettlement(
    vertexId: string,
    playerId: string,
    isInitialPlacement = false,
  ) {
    if (!this.canBuildSettlement(vertexId, playerId, isInitialPlacement)) {
      throw new Error("Cannot build settlement at the selected vertex");
    }

    const settlement = new Settlement(
      `settlement-${vertexId}`,
      playerId,
      vertexId,
    );
    if (!isInitialPlacement) {
      this.gameState.spendForSettlement();
    }

    this.gameState.getPlayerById(playerId)?.consumeSettlementPiece();
    this.board.placeSettlement(settlement);
    this.gameState.awardVictoryPoints(playerId, 1);

    return settlement;
  }

  buildRoad(
    vertexAId: string,
    vertexBId: string,
    playerId: string,
    isInitialPlacement = false,
  ) {
    if (
      !this.canBuildRoad(vertexAId, vertexBId, playerId, isInitialPlacement)
    ) {
      throw new Error("Cannot build road between the selected vertices");
    }

    const road = this.board.getRoadBetweenVertices(vertexAId, vertexBId);

    if (road === undefined) {
      throw new Error("Road not found between the selected vertices");
    }

    if (!isInitialPlacement) {
      if (this.gameState.hasFreeRoad()) {
        this.gameState.consumeFreeRoad();
      } else {
        this.gameState.spendForRoad();
      }
    }

    this.gameState.getPlayerById(playerId)?.consumeRoadPiece();
    road.ownerId = playerId;

    return road;
  }

  upgradeSettlement(vertexId: string, playerId: string) {
    if (!this.canUpgradeSettlement(vertexId, playerId)) {
      throw new Error("Cannot upgrade settlement at the selected vertex");
    }

    const settlement = this.board.getSettlementAtVertex(vertexId);

    if (settlement === undefined) {
      throw new Error("Settlement not found at the selected vertex");
    }

    this.gameState.spendForCity();
    this.gameState.getPlayerById(playerId)?.consumeCityPiece();
    this.gameState.getPlayerById(playerId)?.releaseSettlementPiece();
    settlement.upgradeToCity();
    this.gameState.awardVictoryPoints(playerId, 1);

    return settlement;
  }

  private canExtendRoadFromVertex(vertexId: string, playerId: string) {
    const settlement = this.board.getSettlementAtVertex(vertexId);

    if (settlement !== undefined && settlement.ownerId !== playerId) {
      return false;
    }

    return this.board.isVertexConnectedToPlayer(vertexId, playerId);
  }
}
