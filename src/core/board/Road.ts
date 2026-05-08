export class Road {
  id: string;
  vertexAId: string;
  vertexBId: string;
  ownerId: string | null;

  constructor(
    id: string,
    vertexAId: string,
    vertexBId: string,
    ownerId: string | null = null,
  ) {
    this.id = id;
    this.vertexAId = vertexAId;
    this.vertexBId = vertexBId;
    this.ownerId = ownerId;
  }

  isOwned() {
    return this.ownerId !== null;
  }

  connectsVertex(vertexId: string) {
    return this.vertexAId === vertexId || this.vertexBId === vertexId;
  }
}
