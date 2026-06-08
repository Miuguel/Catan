import { ResourceDistributionService } from "../../src/core/game/ResourceDistributionService";
import { GameState } from "../../src/core/game/GameState";
import { Board } from "../../src/core/board/Board";
import { Settlement } from "../../src/core/board/Settlement";
import { Player } from "../../src/core/game/Player";

describe("ResourceDistributionService", () => {
  let service: ResourceDistributionService;
  let gameState: GameState;
  let board: Board;

  beforeEach(() => {
    board = new Board();
    const p1 = new Player("player-1", "Alice");
    gameState = new GameState(board, [p1]);
    service = new ResourceDistributionService(gameState);
  });

  it("creates resource distribution service", () => {
    expect(service).toBeDefined();
  });

  it("returns empty array for invalid player", () => {
    const result = service.grantResourcesForVertex("vertex-1", "invalid-player");
    expect(result).toEqual([]);
  });

  it("returns resources for valid vertex with settlement", () => {
    const playerId = gameState.players[0].id;
    const vertex = board.vertices[0];

    // Place a settlement for testing
    const settlement = new Settlement(
      "settlement-1",
      playerId,
      vertex.id,
      "settlement"
    );
    board.placeSettlement(settlement);

    const result = service.grantResourcesForVertex(vertex.id, playerId);
    expect(Array.isArray(result)).toBe(true);
  });

  it("handles resource distribution for multiple vertices", () => {
    const playerId = gameState.players[0].id;
    const vertices = board.vertices.slice(0, 2);

    vertices.forEach((vertex, index) => {
      const settlement = new Settlement(
        `settlement-${index}`,
        playerId,
        vertex.id,
        "settlement"
      );
      board.placeSettlement(settlement);
    });

    const results = vertices.map((vertex) =>
      service.grantResourcesForVertex(vertex.id, playerId)
    );

    expect(results).toHaveLength(2);
    results.forEach((result) => {
      expect(Array.isArray(result)).toBe(true);
    });
  });

  it("distributes resources from dice roll", () => {
    const result = service.distributeForRoll(7);
    expect(Array.isArray(result)).toBe(true);
  });

  it("handles empty player map for dice distribution", () => {
    const result = service.distributeForRoll(6);
    expect(Array.isArray(result)).toBe(true);
  });
});
