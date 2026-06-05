import { Tile } from "../board/Tile";
import type { TileType } from "../board/Tile";
import { GameState } from "./GameState";
import { getResourceName } from "./ResourceNames";
import type { ResourceInventory } from "./ResourceInventory";
import type { ResourceType } from "./ResourceType";

export type ResourceDistribution = {
  playerId: string;
  resources: Partial<ResourceInventory>;
};

type PendingResourceDistribution = {
  playerId: string;
  resourceType: ResourceType;
  amount: number;
};

export class ResourceDistributionService {
  constructor(private readonly gameState: GameState) {}

  grantResourcesForVertex(vertexId: string, playerId: string) {
    const player = this.gameState.getPlayerById(playerId);

    if (player === undefined) {
      return [];
    }

    const grantedResources: ResourceType[] = [];

    this.gameState.board.tiles.forEach((tile) => {
      const resourceType = tile.type;

      if (!this.isResourceTile(resourceType) || tile.hasRobber) {
        return;
      }

      if (!tile.vertexIds.includes(vertexId)) {
        return;
      }

      if (this.gameState.withdrawResourcesFromBank({ [resourceType]: 1 })) {
        player.addResource(resourceType, 1);
        grantedResources.push(resourceType);
      }
    });

    return grantedResources;
  }

  distributeForRoll(roll: number): ResourceDistribution[] {
    const distributions: ResourceDistribution[] = [];

    if (roll === 7) {
      this.gameState.setPhase("discard");
      return distributions;
    }

    const pendingDistributions = this.gameState.board.tiles
      .filter((tile) => tile.numberToken === roll && !tile.hasRobber)
      .flatMap((tile) => this.getPendingDistributionsFromTile(tile));

    const blockedResourceTypes =
      this.getBlockedResourceTypes(pendingDistributions);

    blockedResourceTypes.forEach((resourceType) => {
      this.gameState.addActionLog(
        `Banco sem ${getResourceName(resourceType)} suficiente; ninguém recebeu esse recurso.`,
      );
    });

    this.applyPendingDistributions(
      pendingDistributions.filter(
        (distribution) =>
          !blockedResourceTypes.includes(distribution.resourceType),
      ),
      distributions,
    );

    this.gameState.setPhase("main-actions");
    return distributions;
  }

  private getPendingDistributionsFromTile(
    tile: Tile,
  ): PendingResourceDistribution[] {
    const resourceType = tile.type;

    if (!this.isResourceTile(resourceType)) {
      return [];
    }

    const pendingDistributions: PendingResourceDistribution[] = [];

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

      pendingDistributions.push({
        playerId: player.id,
        resourceType,
        amount,
      });
    });

    return pendingDistributions;
  }

  private getBlockedResourceTypes(
    pendingDistributions: PendingResourceDistribution[],
  ) {
    const demandByResource = pendingDistributions.reduce(
      (demand, distribution) => {
        demand[distribution.resourceType] =
          (demand[distribution.resourceType] ?? 0) + distribution.amount;

        return demand;
      },
      {} as Partial<ResourceInventory>,
    );

    return (Object.keys(demandByResource) as ResourceType[]).filter(
      (resourceType) =>
        !this.gameState.canBankAfford({
          [resourceType]: demandByResource[resourceType] ?? 0,
        }),
    );
  }

  private applyPendingDistributions(
    pendingDistributions: PendingResourceDistribution[],
    distributions: ResourceDistribution[],
  ) {
    pendingDistributions.forEach(({ playerId, resourceType, amount }) => {
      const player = this.gameState.getPlayerById(playerId);

      if (player === undefined) {
        return;
      }

      if (
        !this.gameState.withdrawResourcesFromBank({ [resourceType]: amount })
      ) {
        return;
      }

      player.addResource(resourceType, amount);
      this.addDistribution(distributions, playerId, resourceType, amount);
    });
  }

  private addDistribution(
    distributions: ResourceDistribution[],
    playerId: string,
    resourceType: ResourceType,
    amount: number,
  ) {
    const existing = distributions.find((d) => d.playerId === playerId);

    if (existing) {
      existing.resources[resourceType] =
        (existing.resources[resourceType] ?? 0) + amount;
      return;
    }

    distributions.push({
      playerId,
      resources: {
        [resourceType]: amount,
      },
    });
  }

  private isResourceTile(tileType: TileType): tileType is ResourceType {
    return tileType !== "desert";
  }
}
