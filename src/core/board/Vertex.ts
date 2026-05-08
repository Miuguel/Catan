export class Vertex {
  id: string;
  x: number;
  y: number;
  adjacentVertexIds: string[];
  connectedRoadIds: string[];
  settlementId: string | null;

  constructor(
    id: string,
    x: number,
    y: number,
    adjacentVertexIds: string[] = [],
    connectedRoadIds: string[] = [],
    settlementId: string | null = null,
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.adjacentVertexIds = adjacentVertexIds;
    this.connectedRoadIds = connectedRoadIds;
    this.settlementId = settlementId;
  }

  isOccupied() {
    return this.settlementId !== null;
  }

  occupy(settlementId: string) {
    this.settlementId = settlementId;
  }

  release() {
    this.settlementId = null;
  }
}
