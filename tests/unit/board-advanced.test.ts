import { Board } from "../../src/core/board/Board";
import { Road } from "../../src/core/board/Road";
import { Settlement } from "../../src/core/board/Settlement";
import { Vertex } from "../../src/core/board/Vertex";

describe("Board - advanced", () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  it("returns null for unknown vertex canvas position", () => {
    expect(board.getVertexCanvasPosition("missing", 0, 0)).toBeNull();
  });

  it("returns canvas position for existing vertex", () => {
    const vertex = board.vertices[0];
    const pos = board.getVertexCanvasPosition(vertex.id, 10, 20);

    expect(pos).toEqual({ x: vertex.x + 10, y: vertex.y + 20 });
  });

  it("returns road midpoint on canvas", () => {
    const road = board.roads[0];
    const midpoint = board.getRoadCanvasMidpoint(road.id, 0, 0);

    expect(midpoint).not.toBeNull();
    expect(midpoint!.x).toBeDefined();
  });

  it("returns null for unknown road midpoint", () => {
    expect(board.getRoadCanvasMidpoint("missing", 0, 0)).toBeNull();
  });

  it("returns tile canvas center", () => {
    const tile = board.tiles[0];
    const center = board.getTileCanvasCenter(tile, 5, 5);

    expect(center.x).toBeDefined();
    expect(center.y).toBeDefined();
  });

  it("finds vertex at point within tolerance", () => {
    const vertex = board.vertices[0];
    const found = board.getVertexAtPoint(vertex.x, vertex.y, 0, 0, 15);

    expect(found?.id).toBe(vertex.id);
  });

  it("finds road at point near segment", () => {
    const road = board.roads[0];
    const vertexA = board.getVertex(road.vertexAId)!;
    const vertexB = board.getVertex(road.vertexBId)!;
    const midX = (vertexA.x + vertexB.x) / 2;
    const midY = (vertexA.y + vertexB.y) / 2;

    const found = board.getRoadAtPoint(midX, midY, 0, 0, 20);
    expect(found?.id).toBe(road.id);
  });

  it("finds tile at point near center", () => {
    const tile = board.tiles.find((t) => !t.isDesert)!;
    const center = board.getTileCanvasCenter(tile, 0, 0);
    const found = board.getTileAtPoint(center.x, center.y, 0, 0);

    expect(found?.q).toBe(tile.q);
    expect(found?.r).toBe(tile.r);
  });

  it("checks vertex connection to player via settlement", () => {
    const vertex = board.vertices[0];
    board.placeSettlement(
      new Settlement("s1", "player-1", vertex.id),
    );

    expect(board.isVertexConnectedToPlayer(vertex.id, "player-1")).toBe(true);
    expect(board.isVertexConnectedToPlayer(vertex.id, "player-2")).toBe(false);
  });

  it("checks vertex connection via owned road", () => {
    const road = board.roads[0];
    road.ownerId = "player-1";

    expect(
      board.isVertexConnectedToPlayer(road.vertexAId, "player-1"),
    ).toBe(true);
  });

  it("returns player harbors when settlement touches harbor edge", () => {
    if (board.harbors.length === 0) {
      return;
    }

    const harbor = board.harbors[0];
    board.placeSettlement(
      new Settlement("s-harbor", "player-1", harbor.vertexAId),
    );

    const harbors = board.getPlayerHarbors("player-1");
    expect(harbors.length).toBeGreaterThan(0);
  });

  it("throws when placing settlement on occupied vertex", () => {
    const vertex = board.vertices[0];
    board.placeSettlement(new Settlement("s1", "p1", vertex.id));

    expect(() =>
      board.placeSettlement(new Settlement("s2", "p2", vertex.id)),
    ).toThrow("already occupied");
  });

  it("throws when vertex not found", () => {
    expect(() =>
      board.placeSettlement(new Settlement("s1", "p1", "missing")),
    ).toThrow("Vertex missing not found");
  });

  it("validates road placement prerequisites", () => {
    const road = board.roads[0];
    expect(board.canPlaceRoad(road)).toBe(true);

    road.ownerId = "player-1";
    expect(board.canPlaceRoad(road)).toBe(false);
  });

  it("gets road between vertices regardless of order", () => {
    const road = board.roads[0];
    const found = board.getRoadBetweenVertices(
      road.vertexBId,
      road.vertexAId,
    );

    expect(found?.id).toBe(road.id);
  });

  it("can add custom vertex and road", () => {
    const customBoard = new Board();
    const vertex = new Vertex("custom-v", 999, 999);
    customBoard.addVertex(vertex);
    customBoard.addRoad(new Road("custom-r", "custom-v", customBoard.vertices[0].id));

    expect(customBoard.getVertex("custom-v")).toBe(vertex);
    expect(customBoard.roads.some((r) => r.id === "custom-r")).toBe(true);
  });
});
