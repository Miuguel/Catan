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
      this.gameState.spendForRoad();
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
