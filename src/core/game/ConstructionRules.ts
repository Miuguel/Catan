import { Board } from "../board/Board";
import { Settlement } from "../board/Settlement";
import { GameState } from "./GameState";

const CONSTRUCTION_COST = {
  road: {
    brick: 1,
    lumber: 1,
  },
  settlement: {
    brick: 1,
    lumber: 1,
    wool: 1,
    grain: 1,
  },
  city: {
    grain: 2,
    ore: 3,
  },
} as const;

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
    if (!isInitialPlacement && !this.gameState.isCurrentPlayer(playerId)) {
      return false;
    }

    if (
      !isInitialPlacement &&
      !this.gameState.canCurrentPlayerAfford(CONSTRUCTION_COST.settlement)
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
    if (!this.gameState.isCurrentPlayer(playerId)) {
      return false;
    }

    if (!this.gameState.canCurrentPlayerAfford(CONSTRUCTION_COST.city)) {
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
    if (!isInitialPlacement && !this.gameState.isCurrentPlayer(playerId)) {
      return false;
    }

    if (
      !isInitialPlacement &&
      !this.gameState.canCurrentPlayerAfford(CONSTRUCTION_COST.road)
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
      return true;
    }

    return (
      this.board.isVertexConnectedToPlayer(vertexAId, playerId) ||
      this.board.isVertexConnectedToPlayer(vertexBId, playerId)
    );
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
    this.board.placeSettlement(settlement);

    if (!isInitialPlacement) {
      this.gameState.spendForSettlement();
    }

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

    road.ownerId = playerId;

    if (!isInitialPlacement) {
      this.gameState.spendForRoad();
    }

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

    settlement.upgradeToCity();

    this.gameState.spendForCity();
    this.gameState.awardVictoryPoints(playerId, 1);

    return settlement;
  }
}
