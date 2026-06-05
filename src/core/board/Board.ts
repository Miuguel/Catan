import { Hex } from "../Hex";
import { createHarborTypes } from "./Harbor";
import type { Harbor } from "./Harbor";
import { Road } from "./Road";
import { Settlement } from "./Settlement";
import { Tile } from "./Tile";
import type { TileType } from "./Tile";
import { Vertex } from "./Vertex";

type Point = {
  x: number;
  y: number;
};

const TILE_TYPES: TileType[] = [
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
];

const NUMBER_TOKENS = [
  2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12,
];

const HIGH_PRODUCTION_TOKENS = new Set([6, 8]);
const MAX_TILE_GENERATION_ATTEMPTS = 100;

export class Board {
  hexes: Hex[];
  tiles: Tile[];
  vertices: Vertex[];
  roads: Road[];
  settlements: Settlement[];
  harbors: Harbor[];

  constructor(radius = 2, size = 50) {
    this.hexes = [];
    this.tiles = [];
    this.vertices = [];
    this.roads = [];
    this.settlements = [];
    this.harbors = [];
    this.generateHexes(radius, size);
    this.generateTopology();
    this.generateTiles();
    this.generateHarbors();
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
    let generatedTiles: Tile[] = [];

    for (
      let attempt = 1;
      attempt <= MAX_TILE_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      generatedTiles = this.createRandomTiles();

      if (!this.hasAdjacentHighProductionTokens(generatedTiles)) {
        this.tiles = generatedTiles;
        return;
      }
    }

    this.tiles = generatedTiles;
  }

  private createRandomTiles() {
    const resources: TileType[] = this.shuffleArray(TILE_TYPES);
    const numbers = this.shuffleArray(NUMBER_TOKENS);

    return this.hexes.map((hex) => {
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

  private hasAdjacentHighProductionTokens(tiles: Tile[]) {
    return tiles.some((tile) => {
      if (
        tile.numberToken === null ||
        !HIGH_PRODUCTION_TOKENS.has(tile.numberToken)
      ) {
        return false;
      }

      return this.getAdjacentTiles(tile, tiles).some(
        (adjacentTile) =>
          adjacentTile.numberToken !== null &&
          HIGH_PRODUCTION_TOKENS.has(adjacentTile.numberToken),
      );
    });
  }

  private getAdjacentTiles(tile: Tile, tiles: Tile[]) {
    return tiles.filter((candidate) => {
      const dq = candidate.q - tile.q;
      const dr = candidate.r - tile.r;

      return (
        (dq === 1 && dr === 0) ||
        (dq === 1 && dr === -1) ||
        (dq === 0 && dr === -1) ||
        (dq === -1 && dr === 0) ||
        (dq === -1 && dr === 1) ||
        (dq === 0 && dr === 1)
      );
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

  private generateHarbors() {
    // Conjunto de vértices (cantos) de cada hexágono.
    const hexCornerSets = this.hexes.map(
      (hex) =>
        new Set(this.getHexCorners(hex).map((point) => this.getVertexKey(point))),
    );

    // Arestas costeiras: pertencem a apenas um hexágono.
    const coastalRoads = this.roads.filter((road) => {
      const hexCount = hexCornerSets.filter(
        (corners) =>
          corners.has(road.vertexAId) && corners.has(road.vertexBId),
      ).length;

      return hexCount === 1;
    });

    if (coastalRoads.length === 0) {
      this.harbors = [];
      return;
    }

    // Ordena as arestas costeiras ao redor do centro (0,0) do tabuleiro.
    const roadAngle = (road: Road) => {
      const vertexA = this.getVertex(road.vertexAId);
      const vertexB = this.getVertex(road.vertexBId);

      if (vertexA === undefined || vertexB === undefined) {
        return 0;
      }

      return Math.atan2(
        (vertexA.y + vertexB.y) / 2,
        (vertexA.x + vertexB.x) / 2,
      );
    };

    const sortedCoastal = [...coastalRoads].sort(
      (a, b) => roadAngle(a) - roadAngle(b),
    );

    const harborTypes = this.shuffleArray(createHarborTypes());
    const harborCount = Math.min(harborTypes.length, sortedCoastal.length);
    const usedIndices = new Set<number>();
    const harbors: Harbor[] = [];

    for (let i = 0; i < harborCount; i += 1) {
      let index = Math.round((i * sortedCoastal.length) / harborCount);

      // Evita repetir a mesma aresta caso o arredondamento colida.
      while (usedIndices.has(index % sortedCoastal.length)) {
        index += 1;
      }
      index %= sortedCoastal.length;
      usedIndices.add(index);

      const road = sortedCoastal[index];
      const type = harborTypes[i];

      harbors.push({
        type,
        rate: type === "generic" ? 3 : 2,
        vertexAId: road.vertexAId,
        vertexBId: road.vertexBId,
      });
    }

    this.harbors = harbors;
  }

  getPlayerHarbors(playerId: string): Harbor[] {
    return this.harbors.filter((harbor) => {
      const settlementA = this.getSettlementAtVertex(harbor.vertexAId);
      const settlementB = this.getSettlementAtVertex(harbor.vertexBId);

      return (
        settlementA?.ownerId === playerId || settlementB?.ownerId === playerId
      );
    });
  }

  private getVertexKey(point: Point) {
    // Normaliza "-0.00" para "0.00": x=+0 e x=-0 são o mesmo ponto e não
    // podem virar vértices distintos (senão a topologia fica inválida).
    const format = (value: number) => {
      const rounded = value.toFixed(2);
      return rounded === "-0.00" ? "0.00" : rounded;
    };

    return `${format(point.x)}:${format(point.y)}`;
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

    const hasPlayerRoad = vertex.connectedRoadIds.some((roadId) => {
      const road = this.getRoadById(roadId);

      return road !== undefined && road.ownerId === playerId;
    });

    return hasPlayerRoad;
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
