import { Board } from "../board/Board";
import { Tile } from "../board/Tile";
import { GameState } from "./GameState";
import type { ResourceInventory } from "./ResourceInventory";
import type { ResourceType } from "./ResourceType";

export class ResourceDistributionService {
  constructor(private readonly gameState: GameState) {}

  grantResourcesForVertex(vertexId: string, playerId: string) {
    const player = this.gameState.getPlayerById(playerId);

    if (player === undefined) {
      return [];
    }

    const grantedResources: string[] = [];

    this.gameState.board.tiles.forEach((tile) => {
      if (tile.isDesert || tile.hasRobber) {
        return;
      }

      if (!tile.vertexIds.includes(vertexId)) {
        return;
      }

      player.addResource(tile.type, 1);
      grantedResources.push(tile.type);
    });

    return grantedResources;
  }

  distributeForRoll(roll: number) {
    if (roll === 7) {
      this.gameState.setPhase("discard");
      return;
    }

    this.gameState.board.tiles
      .filter((tile) => tile.numberToken === roll && !tile.hasRobber)
      .forEach((tile) => this.distributeFromTile(tile));

    this.gameState.setPhase("main-actions");
  }

  private distributeFromTile(tile: Tile) {
    if (tile.isDesert) {
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

      reward[tile.type as ResourceType] = amount;
      player.addResources(reward);
    });
  }
}
