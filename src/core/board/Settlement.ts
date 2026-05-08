export type SettlementLevel = "settlement" | "city";

export class Settlement {
  id: string;
  ownerId: string;
  vertexId: string;
  level: SettlementLevel;

  constructor(
    id: string,
    ownerId: string,
    vertexId: string,
    level: SettlementLevel = "settlement",
  ) {
    this.id = id;
    this.ownerId = ownerId;
    this.vertexId = vertexId;
    this.level = level;
  }

  getVictoryPoints() {
    return this.level === "city" ? 2 : 1;
  }

  upgradeToCity() {
    this.level = "city";
  }
}
