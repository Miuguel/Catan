import type { ResourceInventory } from "./ResourceInventory";

export const ConstructionCost = {
  road: {
    brick: 1,
    lumber: 1,
    wool: 0,
    grain: 0,
    ore: 0,
  } satisfies ResourceInventory,
  settlement: {
    brick: 1,
    lumber: 1,
    wool: 1,
    grain: 1,
    ore: 0,
  } satisfies ResourceInventory,
  city: {
    brick: 0,
    lumber: 0,
    wool: 0,
    grain: 2,
    ore: 3,
  } satisfies ResourceInventory,
  developmentCard: {
    brick: 0,
    lumber: 0,
    wool: 1,
    grain: 1,
    ore: 1,
  } satisfies ResourceInventory,
} as const;
