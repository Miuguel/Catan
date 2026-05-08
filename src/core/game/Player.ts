import {
  cloneResourceInventory,
  createEmptyResourceInventory,
} from "./ResourceInventory";
import type { ResourceInventory } from "./ResourceInventory";

export class Player {
  id: string;
  name: string;
  resources: ResourceInventory;
  victoryPoints: number;
  developmentCards: string[];

  constructor(
    id: string,
    name: string,
    resources: ResourceInventory = createEmptyResourceInventory(),
    victoryPoints = 0,
    developmentCards: string[] = [],
  ) {
    this.id = id;
    this.name = name;
    this.resources = cloneResourceInventory(resources);
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

  discardResources(amount: number) {
    let remainingToDiscard = amount;

    while (remainingToDiscard > 0 && this.getTotalResources() > 0) {
      const resourceType = this.pickResourceTypeToDiscard();

      if (resourceType === null) {
        break;
      }

      this.resources[resourceType] -= 1;
      remainingToDiscard -= 1;
    }
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
