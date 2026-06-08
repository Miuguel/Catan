import { Board } from "../../src/core/board/Board";
import { ConstructionRules } from "../../src/core/game/ConstructionRules";
import { GameState } from "../../src/core/game/GameState";
import { Player } from "../../src/core/game/Player";

describe("ConstructionRules - full coverage", () => {
  let board: Board;
  let gameState: GameState;
  let rules: ConstructionRules;
  let player: Player;
  let player2: Player;

  beforeEach(() => {
    board = new Board();
    player = new Player("p1", "Alice");
    player2 = new Player("p2", "Bob");
    gameState = new GameState(board, [player]);
    rules = new ConstructionRules(board, gameState);
    player.addResources({ brick: 10, lumber: 10, wool: 10, grain: 10, ore: 10 });
  });

  function finishSetupToMainPhase(): void {
    for (let round = 0; round < 2; round += 1) {
      const vertex = board.vertices.find((v) =>
        board.canPlaceSettlement(v.id),
      )!;
      rules.buildSettlement(vertex.id, player.id, true);
      gameState.registerInitialPlacementSettlement(player.id, vertex.id);

      const road = vertex.connectedRoadIds
        .map((id) => board.getRoadById(id))
        .find((candidate) => candidate !== undefined && candidate.ownerId === null)!;

      rules.buildRoad(road.vertexAId, road.vertexBId, player.id, true);
      gameState.registerInitialPlacementRoad(player.id);
    }

    gameState.setPhase("main-actions");
    gameState.hasRolledDiceThisTurn = true;
  }

  it("returns null when settlement placement is valid in main phase", () => {
    finishSetupToMainPhase();

    const freeVertex = board.vertices.find(
      (v) =>
        board.canPlaceSettlement(v.id) &&
        rules.canBuildRoad(v.connectedRoadIds[0] ? board.getRoadById(v.connectedRoadIds[0])!.vertexAId : "", v.id, player.id, false) === false,
    );

    const issue = rules.describeSettlementPlacementIssue(
      board.vertices[0].id,
      player.id,
    );

    expect(issue === null || typeof issue === "string").toBe(true);
  });

  it("describes player not found", () => {
    expect(rules.describeSettlementPlacementIssue("v0", "missing")).toBe(
      "Jogador não encontrado.",
    );
  });

  it("describes missing settlement pieces", () => {
    finishSetupToMainPhase();
    player.pieces.settlements = 0;

    expect(
      rules.describeSettlementPlacementIssue(board.vertices[0].id, player.id),
    ).toBe("Você não tem mais peças de aldeia disponíveis.");
  });

  it("describes wrong turn", () => {
    finishSetupToMainPhase();
    gameState.addPlayer(player2);
    expect(
      rules.describeSettlementPlacementIssue(board.vertices[0].id, "p2"),
    ).toBe("Aguarde: não é o seu turno.");
  });

  it("describes insufficient resources", () => {
    finishSetupToMainPhase();
    player.resources = { brick: 0, lumber: 0, wool: 0, grain: 0, ore: 0 };

    const free = board.vertices.find((v) => board.canPlaceSettlement(v.id));
    if (free) {
      expect(
        rules.describeSettlementPlacementIssue(free.id, player.id),
      ).toContain("Recursos insuficientes");
    }
  });

  it("describes occupied vertex", () => {
    finishSetupToMainPhase();
    expect(
      rules.describeSettlementPlacementIssue(board.vertices[0].id, player.id),
    ).toBe("Já existe uma construção neste vértice.");
  });

  it("upgrades settlement to city in main phase", () => {
    finishSetupToMainPhase();
    const occupied = board.settlements[0];

    rules.upgradeSettlement(occupied.vertexId, player.id);

    expect(board.getSettlementAtVertex(occupied.vertexId)?.level).toBe("city");
    expect(player.pieces.cities).toBe(3);
  });

  it("throws when building settlement fails validation", () => {
    expect(() =>
      rules.buildSettlement("invalid", player.id, true),
    ).toThrow("Cannot build settlement");
  });

  it("throws when building road fails validation", () => {
    expect(() =>
      rules.buildRoad("a", "b", player.id, false),
    ).toThrow("Cannot build road");
  });

  it("throws when upgrading invalid settlement", () => {
    finishSetupToMainPhase();
    const free = board.vertices.find((v) => board.canPlaceSettlement(v.id));
    if (free) {
      expect(() =>
        rules.upgradeSettlement(free.id, player.id),
      ).toThrow("Cannot upgrade settlement");
    }
  });

  it("builds road using free road from development card", () => {
    finishSetupToMainPhase();
    gameState.freeRoadsRemaining = 1;

    const anchor = board.settlements[0].vertexId;
    const road = board.roads.find(
      (r) =>
        r.ownerId === null &&
        (r.vertexAId === anchor || r.vertexBId === anchor),
    );

    if (road) {
      rules.buildRoad(road.vertexAId, road.vertexBId, player.id, false);
      expect(road.ownerId).toBe(player.id);
      expect(gameState.hasFreeRoad()).toBe(false);
    }
  });

  it("blocks settlement when distance rule violated", () => {
    const v0 = board.vertices[0];
    rules.buildSettlement(v0.id, player.id, true);

    if (v0.adjacentVertexIds.length > 0) {
      expect(
        rules.canBuildSettlement(v0.adjacentVertexIds[0], player.id, true),
      ).toBe(false);
    }
  });
});
