import type { ResourceType } from "./ResourceType";

export type ResourceInventory = Record<ResourceType, number>;

export function createEmptyResourceInventory(): ResourceInventory {
  return {
    brick: 0,
    lumber: 0,
    wool: 0,
    grain: 0,
    ore: 0,
  };
}

export function cloneResourceInventory(
  inventory: ResourceInventory,
): ResourceInventory {
  return {
    brick: inventory.brick,
    lumber: inventory.lumber,
    wool: inventory.wool,
    grain: inventory.grain,
    ore: inventory.ore,
  };
}
