import { Tile } from "../board/Tile";
import { GameState } from "./GameState";
import type { ResourceInventory } from "./ResourceInventory";

export type ResourceDistribution = {
  playerId: string;
  resources: Partial<ResourceInventory>;
};

export class ResourceDistributionService {
  constructor(private readonly gameState: GameState) {}

  grantResourcesForVertex(vertexId: string, playerId: string) {
    const player = this.gameState.getPlayerById(playerId);

    if (player === undefined) {
      return [];
    }

    const grantedResources: string[] = [];

    this.gameState.board.tiles.forEach((tile) => {
      const resourceType = tile.type;

      if (resourceType === "desert" || tile.hasRobber) {
        return;
      }

      if (!tile.vertexIds.includes(vertexId)) {
        return;
      }

      player.addResource(resourceType, 1);
      grantedResources.push(resourceType);
    });

    return grantedResources;
  }

  distributeForRoll(roll: number): ResourceDistribution[] {
    const distributions: ResourceDistribution[] = [];

    if (roll === 7) {
      this.gameState.setPhase("discard");
      return distributions;
    }

    this.gameState.board.tiles
      .filter((tile) => tile.numberToken === roll && !tile.hasRobber)
      .forEach((tile) => this.distributeFromTile(tile, distributions));

    this.gameState.setPhase("main-actions");
    return distributions;
  }

  private distributeFromTile(
    tile: Tile,
    distributions: ResourceDistribution[],
  ) {
    const resourceType = tile.type;

    if (resourceType === "desert") {
      return;
    }

    tile.vertexIds.forEach((vertexId) => {
      const settlement = this.gameState.board.getSettlementAtVertex(vertexId);

      if (settlement === undefined) {
        return;
      }

      const player = this.gameState.getPlayerById(settlement.ownerId);

      if (player === undefined) {
        return;
      }

      const amount = settlement.level === "city" ? 2 : 1;
      const reward: Partial<ResourceInventory> = {};

      reward[resourceType] = amount;
      player.addResources(reward);

      const existing = distributions.find(
        (d) => d.playerId === settlement.ownerId,
      );
      if (existing) {
        existing.resources[resourceType] =
          (existing.resources[resourceType] ?? 0) + amount;
      } else {
        distributions.push({
          playerId: settlement.ownerId,
          resources: reward,
        });
      }
    });
  }
}
