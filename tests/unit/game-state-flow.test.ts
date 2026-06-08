import { Board } from "../../src/core/board/Board";
import { ConstructionRules } from "../../src/core/game/ConstructionRules";
import { GameState } from "../../src/core/game/GameState";
import { Player } from "../../src/core/game/Player";
import { ConstructionCost } from "../../src/core/game/ConstructionCost";

function completeInitialPlacement(
  gameState: GameState,
  rules: ConstructionRules,
): void {
  const playerCount = gameState.players.length;
  const rounds = 2;

  for (let round = 0; round < rounds; round += 1) {
    const order =
      round === 0
        ? gameState.players
        : [...gameState.players].reverse();

    for (const player of order) {
      const vertex = boardFirstFreeVertex(gameState.board);
      rules.buildSettlement(vertex.id, player.id, true);
      gameState.registerInitialPlacementSettlement(player.id, vertex.id);

      const road = vertex.connectedRoadIds
        .map((id) => gameState.board.getRoadById(id))
        .find((candidate) => candidate !== undefined && candidate.ownerId === null);

      if (road !== undefined) {
        rules.buildRoad(road.vertexAId, road.vertexBId, player.id, true);
        gameState.registerInitialPlacementRoad(player.id);
      }
    }
  }
}

function boardFirstFreeVertex(board: Board) {
  return board.vertices.find((vertex) => board.canPlaceSettlement(vertex.id))!;
}

function setupMainActions(gameState: GameState, player: Player): void {
  gameState.setPhase("main-actions");
  gameState.hasRolledDiceThisTurn = true;
  player.addResources({ brick: 10, lumber: 10, wool: 10, grain: 10, ore: 10 });
}

describe("GameState - game flow", () => {
  let board: Board;
  let gameState: GameState;
  let rules: ConstructionRules;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    board = new Board();
    player1 = new Player("p1", "Alice");
    player2 = new Player("p2", "Bob");
    gameState = new GameState(board, [player1, player2]);
    rules = new ConstructionRules(board, gameState);
  });

  describe("initial placement", () => {
    it("tracks settlement and road steps", () => {
      expect(gameState.isInitialPlacementActive()).toBe(true);
      expect(gameState.getInitialPlacementStep()).toBe("settlement");
      expect(gameState.canCurrentPlayerPlaceInitialSettlement()).toBe(true);
      expect(gameState.canCurrentPlayerPlaceInitialRoad()).toBe(false);
    });

    it("registers settlement and switches to road step", () => {
      const vertex = board.vertices[0];
      gameState.registerInitialPlacementSettlement(player1.id, vertex.id);

      expect(gameState.getInitialPlacementStep()).toBe("road");
      expect(gameState.getInitialPlacementSettlementCount(player1.id)).toBe(1);
      expect(gameState.getInitialPlacementRoadAnchorVertexId(player1.id)).toBe(
        vertex.id,
      );
    });

    it("throws when wrong player tries to place", () => {
      expect(() =>
        gameState.registerInitialPlacementSettlement(player2.id, "v0"),
      ).toThrow("Only the current player can place");
    });

    it("completes full initial placement for two players", () => {
      completeInitialPlacement(gameState, rules);

      expect(gameState.phase).toBe("roll-dice");
      expect(gameState.isInitialPlacementActive()).toBe(false);
      expect(board.settlements.length).toBeGreaterThan(0);
    });

    it("adds a player during setup", () => {
      const extra = new Player("p3", "Carol");
      gameState.addPlayer(extra);

      expect(gameState.players).toHaveLength(3);
      expect(gameState.getInitialPlacementSettlementCount("p3")).toBe(0);
    });
  });

  describe("dice and turns", () => {
    beforeEach(() => {
      completeInitialPlacement(gameState, rules);
    });

    it("rolls dice and enters main-actions when total is not 7", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.2);

      const result = gameState.rollDice();

      expect(result.total).toBe(4);
      expect(gameState.phase).toBe("main-actions");
      expect(gameState.hasRolledDiceThisTurn).toBe(true);

      jest.restoreAllMocks();
    });

    it("enters discard phase when rolling 7", () => {
      jest
        .spyOn(Math, "random")
        .mockReturnValueOnce(0.34)
        .mockReturnValueOnce(0.55);

      const result = gameState.rollDice();

      expect(result.total).toBe(7);
      expect(gameState.phase).toBe("discard");

      jest.restoreAllMocks();
    });

    it("throws when rolling outside roll-dice phase", () => {
      gameState.setPhase("main-actions");
      expect(() => gameState.rollDice()).toThrow(
        "Os dados só podem ser rolados no início do turno.",
      );
    });

    it("throws when rolling twice in same turn", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.2);
      gameState.rollDice();
      gameState.setPhase("roll-dice");
      expect(() => gameState.rollDice()).toThrow(
        "Os dados já foram rolados neste turno.",
      );
      jest.restoreAllMocks();
    });

    it("advances to next player on nextTurn", () => {
      expect(gameState.currentPlayer.id).toBe("p1");
      gameState.nextTurn();
      expect(gameState.currentPlayer.id).toBe("p2");
      expect(gameState.phase).toBe("roll-dice");
      expect(gameState.hasRolledDiceThisTurn).toBe(false);
    });
  });

  describe("bank trades", () => {
    beforeEach(() => {
      completeInitialPlacement(gameState, rules);
      setupMainActions(gameState, player1);
    });

    it("exchanges resources with bank at 4:1 rate", () => {
      player1.addResources({ brick: 4 });
      gameState.exchangeWithBank(player1.id, "brick", "ore", 4);

      expect(player1.resources.brick).toBe(10);
      expect(player1.resources.ore).toBe(11);
    });

    it("throws when exchanging same resource", () => {
      expect(() =>
        gameState.exchangeWithBank(player1.id, "brick", "brick"),
      ).toThrow("Escolha recursos diferentes");
    });

    it("throws when rate is invalid", () => {
      expect(() =>
        gameState.exchangeWithBank(player1.id, "brick", "ore", 0),
      ).toThrow("taxa de troca");
    });

    it("trades bundle with bank using port rates", () => {
      player1.addResources({ brick: 4 });
      gameState.tradeWithBankBundle(
        player1.id,
        { brick: 4 },
        { ore: 1 },
      );

      expect(player1.resources.ore).toBe(11);
    });

    it("returns default bank trade rates", () => {
      const rates = gameState.getBankTradeRates(player1.id);
      expect(rates.brick).toBe(4);
      expect(rates.ore).toBe(4);
    });
  });

  describe("player trades", () => {
    beforeEach(() => {
      completeInitialPlacement(gameState, rules);
      player1.addResources({ brick: 3 });
      player2.addResources({ ore: 2 });
    });

    it("trades resources between players", () => {
      gameState.tradeBetweenPlayers(
        player1.id,
        player2.id,
        { brick: 2 },
        { ore: 1 },
      );

      expect(player1.resources.brick).toBe(1);
      expect(player1.resources.ore).toBe(1);
      expect(player2.resources.brick).toBe(2);
      expect(player2.resources.ore).toBe(1);
    });

    it("throws when player cannot afford offer", () => {
      expect(() =>
        gameState.tradeBetweenPlayers(
          player1.id,
          player2.id,
          { brick: 10 },
          { ore: 1 },
        ),
      ).toThrow("não possui os recursos oferecidos");
    });
  });

  describe("development cards", () => {
    beforeEach(() => {
      completeInitialPlacement(gameState, rules);
      setupMainActions(gameState, player1);
    });

    it("buys a development card", () => {
      const initialDeck = gameState.developmentDeck.length;
      const result = gameState.buyDevelopmentCard(player1.id);

      expect(gameState.developmentDeck.length).toBe(initialDeck - 1);
      expect(player1.developmentCards).toHaveLength(1);
      expect(result.type).toBeDefined();
    });

    it("plays knight and moves to robber phase", () => {
      player1.addDevelopmentCard({ type: "knight", purchasedTurn: 0 });
      gameState.setPhase("roll-dice");

      gameState.playKnight(player1.id);

      expect(gameState.phase).toBe("robber");
      expect(player1.playedKnights).toBe(1);
      expect(gameState.hasPlayedDevelopmentCardThisTurn).toBe(true);
    });

    it("plays monopoly and collects resources", () => {
      player1.addDevelopmentCard({ type: "monopoly", purchasedTurn: 0 });
      player2.addResources({ brick: 3 });

      const taken = gameState.playMonopoly(player1.id, "brick");

      expect(taken).toBe(3);
      expect(player1.resources.brick).toBe(13);
      expect(player2.resources.brick).toBe(0);
    });

    it("plays year of plenty", () => {
      player1.addDevelopmentCard({ type: "year-of-plenty", purchasedTurn: 0 });

      gameState.playYearOfPlenty(player1.id, { ore: 2 });

      expect(player1.resources.ore).toBe(12);
    });

    it("plays road building and grants free roads", () => {
      player1.addDevelopmentCard({ type: "road-building", purchasedTurn: 0 });

      gameState.playRoadBuilding(player1.id);

      expect(gameState.hasFreeRoad()).toBe(true);
      expect(gameState.freeRoadsRemaining).toBe(2);
    });

    it("prevents playing two development cards in one turn", () => {
      player1.addDevelopmentCard({ type: "knight", purchasedTurn: 0 });
      gameState.setPhase("roll-dice");
      gameState.playKnight(player1.id);

      expect(() => gameState.markDevelopmentCardPlayed()).toThrow(
        "já foi usada neste turno",
      );
    });
  });

  describe("seven discard", () => {
    beforeEach(() => {
      completeInitialPlacement(gameState, rules);
      player1.addResources({ brick: 4, lumber: 4, wool: 2 });
      gameState.beginSevenDiscard();
    });

    it("marks players with more than 7 cards for discard", () => {
      expect(gameState.getRequiredDiscardCount(player1.id)).toBe(5);
      expect(gameState.hasPendingDiscards()).toBe(true);
    });

    it("discards chosen resources for human player", () => {
      gameState.discardForPlayer(player1.id, {
        brick: 3,
        lumber: 2,
      });

      expect(gameState.getRequiredDiscardCount(player1.id)).toBe(0);
      expect(player1.getTotalResources()).toBe(5);
    });

    it("auto-discards for bots", () => {
      const bot = new Player("bot-1", "Bot", "bot");
      bot.addResources({ brick: 5, lumber: 5 });
      gameState.players.push(bot);
      gameState.beginSevenDiscard();

      const results = gameState.autoDiscardBots();

      expect(results.length).toBeGreaterThan(0);
    });

    it("finalizes discard phase when all done", () => {
      gameState.setPhase("discard");
      gameState.discardForPlayer(player1.id, { brick: 3, lumber: 2 });
      gameState.finalizeDiscardPhaseIfReady();

      expect(gameState.phase).toBe("robber");
    });
  });

  describe("robber", () => {
    beforeEach(() => {
      completeInitialPlacement(gameState, rules);
      gameState.setPhase("robber");
      player2.addResources({ ore: 3 });
    });

    it("places robber on new tile and lists victims", () => {
      const currentRobber = board.tiles.find((tile) => tile.hasRobber)!;
      const target = board.tiles.find(
        (tile) =>
          tile.q !== currentRobber.q ||
          tile.r !== currentRobber.r,
      )!;

      const victims = gameState.placeRobber(target.q, target.r);

      expect(
        board.tiles.find((t) => t.q === target.q && t.r === target.r)?.hasRobber,
      ).toBe(true);
      expect(Array.isArray(victims)).toBe(true);
    });

    it("resolves robbery transferring a resource", () => {
      jest.spyOn(Math, "random").mockReturnValue(0);

      gameState.pendingRobberVictimIds = [player2.id];
      const result = gameState.resolveRobbery(player2.id);

      expect(result.stolenFromPlayerId).toBe(player2.id);
      expect(gameState.phase).toBe("roll-dice");

      jest.restoreAllMocks();
    });

    it("moveRobberAuto places and resolves in one call", () => {
      const currentRobber = board.tiles.find((tile) => tile.hasRobber)!;
      const target = board.tiles.find(
        (tile) =>
          tile.q !== currentRobber.q ||
          tile.r !== currentRobber.r,
      )!;

      const result = gameState.moveRobberAuto(target.q, target.r);

      expect(result).toHaveProperty("stolenFromPlayerId");
    });
  });

  describe("scoring and victory", () => {
    it("computes victory points from settlements", () => {
      const vertex = board.vertices[0];
      rules.buildSettlement(vertex.id, player1.id, true);

      const points = gameState.computeVictoryPoints(player1.id);
      expect(points).toBeGreaterThanOrEqual(1);
    });

    it("refreshes scores and declares winner at 10 VP", () => {
      for (let i = 0; i < 10; i += 1) {
        player1.addDevelopmentCard({ type: "victory-point", purchasedTurn: 0 });
      }
      gameState.refreshScores();

      expect(gameState.isFinished()).toBe(true);
      expect(gameState.getWinner()?.id).toBe(player1.id);
    });

    it("sets winner explicitly", () => {
      gameState.setWinner(player2.id);
      expect(gameState.winnerId).toBe("p2");
      expect(gameState.getActionLog()[0]).toContain("Bob");
    });

    it("reports longest road length", () => {
      expect(gameState.getLongestRoadLength(player1.id)).toBe(0);
    });

    it("checks build affordability helpers", () => {
      completeInitialPlacement(gameState, rules);
      setupMainActions(gameState, player1);

      expect(gameState.canCurrentPlayerBuildRoad()).toBe(true);
      expect(gameState.canCurrentPlayerBuildSettlement()).toBe(true);
      expect(gameState.canCurrentPlayerUpgradeSettlement()).toBe(true);
      expect(gameState.canTakeMainActions()).toBe(true);
    });

    it("spends resources for constructions via bank deposit", () => {
      completeInitialPlacement(gameState, rules);
      setupMainActions(gameState, player1);
      const initialBank = gameState.bank.brick;

      gameState.spendForRoad();

      expect(player1.resources.brick).toBe(9);
      expect(gameState.bank.brick).toBe(initialBank + 1);
    });
  });

  describe("misc helpers", () => {
    it("identifies current player", () => {
      expect(gameState.isCurrentPlayer("p1")).toBe(true);
      expect(gameState.isCurrentPlayer("p2")).toBe(false);
    });

    it("deposits resources to bank", () => {
      gameState.depositResourcesToBank({ brick: 2 });
      expect(gameState.bank.brick).toBe(21);
    });

    it("returns development deck count", () => {
      expect(gameState.getDevelopmentDeckCount()).toBe(25);
    });

    it("checks buy development card eligibility", () => {
      completeInitialPlacement(gameState, rules);
      setupMainActions(gameState, player1);
      expect(gameState.canBuyDevelopmentCard(player1.id)).toBe(true);
    });

    it("returns zero VP for unknown player", () => {
      expect(gameState.computeVictoryPoints("unknown")).toBe(0);
    });

    it("canPlayDevelopmentCard respects turn and phase", () => {
      player1.addDevelopmentCard({ type: "knight", purchasedTurn: 0 });
      completeInitialPlacement(gameState, rules);
      gameState.setPhase("roll-dice");

      expect(gameState.canPlayDevelopmentCard(player1.id, "knight")).toBe(true);
      expect(gameState.canPlayDevelopmentCard(player1.id, "monopoly")).toBe(
        false,
      );
    });
  });
});
