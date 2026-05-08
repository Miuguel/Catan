import type { ResourceType } from "../game/ResourceType";

export type TileType = ResourceType | "desert";

export class Tile {
  q: number;
  r: number;
  type: TileType;
  numberToken: number | null;
  vertexIds: string[];
  hasRobber: boolean;

  constructor(
    q: number,
    r: number,
    type: TileType,
    numberToken: number | null,
    vertexIds: string[],
    hasRobber = false,
  ) {
    this.q = q;
    this.r = r;
    this.type = type;
    this.numberToken = numberToken;
    this.vertexIds = vertexIds;
    this.hasRobber = hasRobber;
  }

  get isDesert() {
    return this.type === "desert";
  }
}
