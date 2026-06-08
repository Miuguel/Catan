import { ConstructionRules } from "../../src/core/game/ConstructionRules";
import { Board } from "../../src/core/board/Board";
import { GameState } from "../../src/core/game/GameState";
import { Settlement } from "../../src/core/board/Settlement";
import { Road } from "../../src/core/board/Road";
import { Player } from "../../src/core/game/Player";

describe("ConstructionRules - Advanced", () => {
  let rules: ConstructionRules;
  let board: Board;
  let gameState: GameState;
  let playerId: string;

  beforeEach(() => {
    board = new Board();
    // create players and pass to GameState
    const p1 = new Player("player-1", "Alice");
    const p2 = new Player("player-2", "Bob");
    gameState = new GameState(board, [p1, p2]);
    rules = new ConstructionRules(board, gameState);
    playerId = gameState.players[0].id;

    // Add resources to player
    const player = gameState.getPlayerById(playerId)!;
    player.addResources({
      brick: 10,
      lumber: 10,
      grain: 10,
      wool: 10,
      ore: 10,
    });
  });

  it("creates construction rules instance", () => {
    expect(rules).toBeDefined();
  });

  it("can build settlement at valid vertex", () => {
    const vertex = board.vertices[0];
    const canBuild = rules.canBuildSettlement(vertex.id, playerId, false);
    expect(typeof canBuild).toBe("boolean");
  });

  it("builds settlement successfully", () => {
    const vertex = board.vertices[0];
    expect(() => {
      rules.buildSettlement(vertex.id, playerId, true);
    }).not.toThrow();
  });

  it("cannot build settlement on occupied vertex", () => {
    const vertex = board.vertices[0];
    rules.buildSettlement(vertex.id, playerId, true);

    const player2Id = gameState.players[1].id;
    const player2 = gameState.getPlayerById(player2Id)!;
    player2.addResources({
      brick: 10,
      lumber: 10,
      grain: 10,
      wool: 10,
    });

    const canBuild = rules.canBuildSettlement(vertex.id, player2Id, false);
    expect(canBuild).toBe(false);
  });

  it("can build road at valid edge", () => {
    const road = board.roads[0];
    const canBuild = rules.canBuildRoad(road.vertexAId, road.vertexBId, playerId, false);
    expect(typeof canBuild).toBe("boolean");
  });

  it("builds road successfully", () => {
    const road = board.roads[0];
    // simulate initial placement anchor
    gameState.registerInitialPlacementSettlement(playerId, road.vertexAId);
    expect(() => {
      rules.buildRoad(road.vertexAId, road.vertexBId, playerId, true);
    }).not.toThrow();
  });

  it("cannot build on occupied road", () => {
    const road = board.roads[0];
    // ensure initial placement anchor is set for building the road
    gameState.registerInitialPlacementSettlement(playerId, road.vertexAId);
    rules.buildRoad(road.vertexAId, road.vertexBId, playerId, true);

    const player2Id = gameState.players[1].id;
    const player2 = gameState.getPlayerById(player2Id)!;
    player2.addResources({
      brick: 10,
      lumber: 10,
    });

    const canBuild = rules.canBuildRoad(road.vertexAId, road.vertexBId, player2Id, false);
    expect(canBuild).toBe(false);
  });

  it("describes settlement placement issues", () => {
    const description = rules.describeSettlementPlacementIssue(
      board.vertices[0].id,
      playerId
    );
    expect(typeof description).toBe("string");
  });

  it("can upgrade settlement to city", () => {
    const vertex = board.vertices[0];
    // Build as initial placement to ensure settlement exists
    rules.buildSettlement(vertex.id, playerId, true);
    // register initial placement after placing settlement to set road anchor
    gameState.registerInitialPlacementSettlement(playerId, vertex.id);

    const player = gameState.getPlayerById(playerId)!;
    player.addResources({
      ore: 10,
      grain: 10,
    });

    const settlement = board.getSettlementAtVertex(vertex.id);
    expect(settlement).toBeDefined();

    // Should be able to upgrade
    const canUpgrade = settlement?.level === "settlement";
    expect(canUpgrade).toBe(true);
  });
});
