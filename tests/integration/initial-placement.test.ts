import { Board } from "../../src/core/board/Board";
import { ConstructionRules } from "../../src/core/game/ConstructionRules";
import { GameState } from "../../src/core/game/GameState";
import { Player } from "../../src/core/game/Player";

describe("Initial placement integration", () => {
  it("allows the initial road only connected to the settlement just placed", () => {
    const board = new Board();
    const player = new Player("player-1", "Jogador");
    const gameState = new GameState(board, [player]);
    const constructionRules = new ConstructionRules(board, gameState);
    const settlementVertex = board.vertices[0];
    const connectedRoad = settlementVertex.connectedRoadIds
      .map((roadId) => board.getRoadById(roadId))
      .find((road) => road !== undefined);
    const disconnectedRoad = board.roads.find(
      (road) => !road.connectsVertex(settlementVertex.id),
    );

    expect(connectedRoad).toBeDefined();
    expect(disconnectedRoad).toBeDefined();

    constructionRules.buildSettlement(settlementVertex.id, player.id, true);
    gameState.registerInitialPlacementSettlement(player.id, settlementVertex.id);

    expect(
      constructionRules.canBuildRoad(
        connectedRoad!.vertexAId,
        connectedRoad!.vertexBId,
        player.id,
        true,
      ),
    ).toBe(true);
    expect(
      constructionRules.canBuildRoad(
        disconnectedRoad!.vertexAId,
        disconnectedRoad!.vertexBId,
        player.id,
        true,
      ),
    ).toBe(false);
  });

  it("exchanges resources with the bank updating player and bank inventories", () => {
    const board = new Board();
    const player = new Player("player-1", "Jogador");
    const gameState = new GameState(board, [player]);

    player.addResources({ brick: 4 });

    gameState.exchangeWithBank(player.id, "brick", "ore");

    expect(player.resources.brick).toBe(0);
    expect(player.resources.ore).toBe(1);
    expect(gameState.bank.brick).toBe(23);
    expect(gameState.bank.ore).toBe(18);
  });
});
