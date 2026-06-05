import {
  cloneResourceInventory,
  createEmptyResourceInventory,
} from "./ResourceInventory";
import type { ResourceInventory } from "./ResourceInventory";

export type PieceInventory = {
  roads: number;
  settlements: number;
  cities: number;
};

export type PlayerKind = "human" | "bot";

export function createInitialPieceInventory(): PieceInventory {
  return {
    roads: 15,
    settlements: 5,
    cities: 4,
  };
}

export class Player {
  id: string;
  name: string;
  kind: PlayerKind;
  resources: ResourceInventory;
  pieces: PieceInventory;
  victoryPoints: number;
  developmentCards: string[];

  constructor(
    id: string,
    name: string,
    kind: PlayerKind = "human",
    resources: ResourceInventory = createEmptyResourceInventory(),
    victoryPoints = 0,
    developmentCards: string[] = [],
    pieces: PieceInventory = createInitialPieceInventory(),
  ) {
    this.id = id;
    this.name = name;
    this.kind = kind;
    this.resources = cloneResourceInventory(resources);
    this.pieces = { ...pieces };
    this.victoryPoints = victoryPoints;
    this.developmentCards = [...developmentCards];
  }

  addResources(resources: Partial<ResourceInventory>) {
    (Object.keys(resources) as Array<keyof ResourceInventory>).forEach(
      (resourceType) => {
        this.resources[resourceType] += resources[resourceType] ?? 0;
      },
    );
  }

  addResource(resourceType: keyof ResourceInventory, amount = 1) {
    this.resources[resourceType] += amount;
  }

  getTotalResources() {
    return (
      this.resources.brick +
      this.resources.lumber +
      this.resources.wool +
      this.resources.grain +
      this.resources.ore
    );
  }

  discardResources(amount: number): Partial<ResourceInventory> {
    let remainingToDiscard = amount;
    const discardedResources: Partial<ResourceInventory> = {};

    while (remainingToDiscard > 0 && this.getTotalResources() > 0) {
      const resourceType = this.pickResourceTypeToDiscard();

      if (resourceType === null) {
        break;
      }

      this.resources[resourceType] -= 1;
      discardedResources[resourceType] =
        (discardedResources[resourceType] ?? 0) + 1;
      remainingToDiscard -= 1;
    }

    return discardedResources;
  }

  canAfford(cost: Partial<ResourceInventory>) {
    return (Object.keys(cost) as Array<keyof ResourceInventory>).every(
      (resourceType) => {
        const requiredAmount = cost[resourceType] ?? 0;

        return this.resources[resourceType] >= requiredAmount;
      },
    );
  }

  spendResources(cost: Partial<ResourceInventory>) {
    if (!this.canAfford(cost)) {
      throw new Error("Player cannot afford this cost");
    }

    (Object.keys(cost) as Array<keyof ResourceInventory>).forEach(
      (resourceType) => {
        this.resources[resourceType] -= cost[resourceType] ?? 0;
      },
    );
  }

  addVictoryPoints(points: number) {
    this.victoryPoints += points;
  }

  addDevelopmentCard(cardName: string) {
    this.developmentCards.push(cardName);
  }

  canBuildRoadPiece() {
    return this.pieces.roads > 0;
  }

  canBuildSettlementPiece() {
    return this.pieces.settlements > 0;
  }

  canBuildCityPiece() {
    return this.pieces.cities > 0;
  }

  consumeRoadPiece() {
    if (!this.canBuildRoadPiece()) {
      throw new Error("Player has no roads left");
    }

    this.pieces.roads -= 1;
  }

  consumeSettlementPiece() {
    if (!this.canBuildSettlementPiece()) {
      throw new Error("Player has no settlements left");
    }

    this.pieces.settlements -= 1;
  }

  consumeCityPiece() {
    if (!this.canBuildCityPiece()) {
      throw new Error("Player has no cities left");
    }

    this.pieces.cities -= 1;
  }

  releaseSettlementPiece() {
    this.pieces.settlements += 1;
  }

  takeRandomResource() {
    const resourceType = this.pickResourceTypeToDiscard();

    if (resourceType === null) {
      return null;
    }

    this.resources[resourceType] -= 1;

    return resourceType;
  }

  private pickResourceTypeToDiscard() {
    const availableResources = (
      Object.keys(this.resources) as Array<keyof ResourceInventory>
    ).filter((resourceType) => this.resources[resourceType] > 0);

    if (availableResources.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableResources.length);

    return availableResources[randomIndex];
  }
}
