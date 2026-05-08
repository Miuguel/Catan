import { Hex } from "../Hex";
import { Road } from "./Road";
import { Settlement } from "./Settlement";
import { Tile } from "./Tile";
import type { TileType } from "./Tile";
import { Vertex } from "./Vertex";

type Point = {
  x: number;
  y: number;
};

export class Board {
  hexes: Hex[];
  tiles: Tile[];
  vertices: Vertex[];
  roads: Road[];
  settlements: Settlement[];

  constructor(radius = 2, size = 50) {
    this.hexes = [];
    this.tiles = [];
    this.vertices = [];
    this.roads = [];
    this.settlements = [];
    this.generateHexes(radius, size);
    this.generateTopology();
    this.generateTiles();
  }

  private generateHexes(radius: number, size: number) {
    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius);
      const r2 = Math.min(radius, -q + radius);

      for (let r = r1; r <= r2; r++) {
        this.hexes.push(new Hex(q, r, size));
      }
    }
  }

  private generateTopology() {
    const vertexMap = new Map<string, Vertex>();
    const roadMap = new Map<string, Road>();

    this.hexes.forEach((hex) => {
      const corners = this.getHexCorners(hex);

      corners.forEach((point, index) => {
        const currentVertexId = this.getVertexKey(point);
        const nextPoint = corners[(index + 1) % corners.length];
        const nextVertexId = this.getVertexKey(nextPoint);

        const currentVertex = this.getOrCreateVertex(
          vertexMap,
          currentVertexId,
          point,
        );
        const nextVertex = this.getOrCreateVertex(
          vertexMap,
          nextVertexId,
          nextPoint,
        );

        this.addAdjacentVertex(currentVertex, nextVertex.id);
        this.addAdjacentVertex(nextVertex, currentVertex.id);

        const roadId = this.getRoadKey(currentVertex.id, nextVertex.id);
        const road = this.getOrCreateRoad(
          roadMap,
          roadId,
          currentVertex.id,
          nextVertex.id,
        );

        this.addConnectedRoad(currentVertex, road.id);
        this.addConnectedRoad(nextVertex, road.id);
      });
    });

    this.vertices = Array.from(vertexMap.values());
    this.roads = Array.from(roadMap.values());
  }

  private generateTiles() {
    const resources: TileType[] = this.shuffleArray([
      "brick",
      "brick",
      "brick",
      "lumber",
      "lumber",
      "lumber",
      "lumber",
      "wool",
      "wool",
      "wool",
      "wool",
      "grain",
      "grain",
      "grain",
      "grain",
      "ore",
      "ore",
      "ore",
      "desert",
    ]);
    const numbers = this.shuffleArray([
      2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12,
    ]);

    this.tiles = this.hexes.map((hex) => {
      const corners = this.getHexCorners(hex);
      const vertexIds = corners.map((point) => this.getVertexKey(point));
      const type = resources.shift() ?? "desert";

      if (type === "desert") {
        return new Tile(hex.q, hex.r, type, null, vertexIds, true);
      }

      const numberToken = numbers.shift() ?? null;
      return new Tile(hex.q, hex.r, type, numberToken, vertexIds);
    });
  }

  private shuffleArray<T>(items: T[]) {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      const currentValue = shuffled[index];

      shuffled[index] = shuffled[randomIndex];
      shuffled[randomIndex] = currentValue;
    }

    return shuffled;
  }

  private getHexCorners(hex: Hex): Point[] {
    const center = hex.getPixelPosition();

    return Array.from({ length: 6 }, (_, index) => {
      const angle = (Math.PI / 180) * (60 * index - 30);

      return {
        x: center.x + hex.size * Math.cos(angle),
        y: center.y + hex.size * Math.sin(angle),
      };
    });
  }

  private getVertexKey(point: Point) {
    const x = point.x.toFixed(2);
    const y = point.y.toFixed(2);

    return `${x}:${y}`;
  }

  private getRoadKey(vertexAId: string, vertexBId: string) {
    return [vertexAId, vertexBId].sort().join("|");
  }

  private getOrCreateVertex(
    vertexMap: Map<string, Vertex>,
    vertexId: string,
    point: Point,
  ) {
    const existingVertex = vertexMap.get(vertexId);

    if (existingVertex !== undefined) {
      return existingVertex;
    }

    const vertex = new Vertex(vertexId, point.x, point.y);
    vertexMap.set(vertexId, vertex);

    return vertex;
  }

  private getOrCreateRoad(
    roadMap: Map<string, Road>,
    roadId: string,
    vertexAId: string,
    vertexBId: string,
  ) {
    const existingRoad = roadMap.get(roadId);

    if (existingRoad !== undefined) {
      return existingRoad;
    }

    const road = new Road(roadId, vertexAId, vertexBId);
    roadMap.set(roadId, road);

    return road;
  }

  private addAdjacentVertex(vertex: Vertex, adjacentVertexId: string) {
    if (!vertex.adjacentVertexIds.includes(adjacentVertexId)) {
      vertex.adjacentVertexIds.push(adjacentVertexId);
    }
  }

  private addConnectedRoad(vertex: Vertex, roadId: string) {
    if (!vertex.connectedRoadIds.includes(roadId)) {
      vertex.connectedRoadIds.push(roadId);
    }
  }

  addVertex(vertex: Vertex) {
    this.vertices.push(vertex);
  }

  getVertex(vertexId: string) {
    return this.vertices.find((vertex) => vertex.id === vertexId);
  }

  getRoadById(roadId: string) {
    return this.roads.find((road) => road.id === roadId);
  }

  getTileAtHex(q: number, r: number) {
    return this.tiles.find((tile) => tile.q === q && tile.r === r);
  }

  getVertexCanvasPosition(vertexId: string, offsetX: number, offsetY: number) {
    const vertex = this.getVertex(vertexId);

    if (vertex === undefined) {
      return null;
    }

    return {
      x: vertex.x + offsetX,
      y: vertex.y + offsetY,
    };
  }

  getRoadCanvasMidpoint(roadId: string, offsetX: number, offsetY: number) {
    const road = this.getRoadById(roadId);

    if (road === undefined) {
      return null;
    }

    const vertexA = this.getVertex(road.vertexAId);
    const vertexB = this.getVertex(road.vertexBId);

    if (vertexA === undefined || vertexB === undefined) {
      return null;
    }

    return {
      x: (vertexA.x + vertexB.x) / 2 + offsetX,
      y: (vertexA.y + vertexB.y) / 2 + offsetY,
    };
  }

  getTileCanvasCenter(tile: Tile, offsetX: number, offsetY: number) {
    return {
      x: this.getHexCenter(tile.q, tile.r).x + offsetX,
      y: this.getHexCenter(tile.q, tile.r).y + offsetY,
    };
  }

  getVertexAtPoint(
    x: number,
    y: number,
    offsetX: number,
    offsetY: number,
    tolerance = 10,
  ) {
    return this.vertices.find((vertex) => {
      const dx = vertex.x + offsetX - x;
      const dy = vertex.y + offsetY - y;

      return Math.sqrt(dx * dx + dy * dy) <= tolerance;
    });
  }

  getRoadAtPoint(
    x: number,
    y: number,
    offsetX: number,
    offsetY: number,
    tolerance = 8,
  ) {
    return this.roads.find((road) => {
      const vertexA = this.getVertex(road.vertexAId);
      const vertexB = this.getVertex(road.vertexBId);

      if (vertexA === undefined || vertexB === undefined) {
        return false;
      }

      const ax = vertexA.x + offsetX;
      const ay = vertexA.y + offsetY;
      const bx = vertexB.x + offsetX;
      const by = vertexB.y + offsetY;

      return this.distanceToSegment(x, y, ax, ay, bx, by) <= tolerance;
    });
  }

  getTileAtPoint(x: number, y: number, offsetX: number, offsetY: number) {
    return this.tiles.find((tile) => {
      const center = this.getTileCanvasCenter(tile, offsetX, offsetY);
      const dx = center.x - x;
      const dy = center.y - y;

      return Math.sqrt(dx * dx + dy * dy) <= 38;
    });
  }

  private getHexCenter(q: number, r: number) {
    const hex = this.hexes.find(
      (candidate) => candidate.q === q && candidate.r === r,
    );

    if (hex === undefined) {
      return { x: 0, y: 0 };
    }

    return hex.getPixelPosition();
  }

  private distanceToSegment(
    px: number,
    py: number,
    ax: number,
    ay: number,
    bx: number,
    by: number,
  ) {
    const abx = bx - ax;
    const aby = by - ay;
    const apx = px - ax;
    const apy = py - ay;
    const abLengthSquared = abx * abx + aby * aby;

    if (abLengthSquared === 0) {
      const dx = px - ax;
      const dy = py - ay;

      return Math.sqrt(dx * dx + dy * dy);
    }

    const t = Math.max(
      0,
      Math.min(1, (apx * abx + apy * aby) / abLengthSquared),
    );
    const closestX = ax + abx * t;
    const closestY = ay + aby * t;
    const dx = px - closestX;
    const dy = py - closestY;

    return Math.sqrt(dx * dx + dy * dy);
  }

  getRoadBetweenVertices(vertexAId: string, vertexBId: string) {
    const roadKey = this.getRoadKey(vertexAId, vertexBId);

    return this.roads.find(
      (road) => this.getRoadKey(road.vertexAId, road.vertexBId) === roadKey,
    );
  }

  getSettlementAtVertex(vertexId: string) {
    return this.settlements.find(
      (settlement) => settlement.vertexId === vertexId,
    );
  }

  isVertexConnectedToPlayer(vertexId: string, playerId: string) {
    const vertex = this.getVertex(vertexId);

    if (vertex === undefined) {
      return false;
    }

    const settlement = this.getSettlementAtVertex(vertexId);

    if (settlement !== undefined && settlement.ownerId === playerId) {
      return true;
    }

    return vertex.connectedRoadIds.some((roadId) => {
      const road = this.getRoadById(roadId);

      return road !== undefined && road.ownerId === playerId;
    });
  }

  canPlaceSettlement(vertexId: string) {
    const vertex = this.getVertex(vertexId);

    if (vertex === undefined || vertex.isOccupied()) {
      return false;
    }

    return vertex.adjacentVertexIds.every((adjacentVertexId) => {
      const adjacentVertex = this.getVertex(adjacentVertexId);

      return adjacentVertex === undefined || !adjacentVertex.isOccupied();
    });
  }

  placeSettlement(settlement: Settlement) {
    const vertex = this.getVertex(settlement.vertexId);

    if (vertex === undefined) {
      throw new Error(`Vertex ${settlement.vertexId} not found`);
    }

    if (vertex.isOccupied()) {
      throw new Error(`Vertex ${settlement.vertexId} is already occupied`);
    }

    vertex.occupy(settlement.id);
    this.settlements.push(settlement);
  }

  addRoad(road: Road) {
    this.roads.push(road);
  }

  canPlaceRoad(road: Road) {
    const vertexA = this.getVertex(road.vertexAId);
    const vertexB = this.getVertex(road.vertexBId);

    return vertexA !== undefined && vertexB !== undefined && !road.isOwned();
  }
}
