import { Board } from "../../src/core/board/Board";
import { ConstructionRules } from "../../src/core/game/ConstructionRules";
import { GameState } from "../../src/core/game/GameState";
import { Player } from "../../src/core/game/Player";

describe("Game Operations", () => {
  let board: Board;
  let players: Player[];
  let gameState: GameState;
  let constructionRules: ConstructionRules;

  beforeEach(() => {
    board = new Board();
    players = [
      new Player("player-1", "Player 1"),
      new Player("player-2", "Player 2"),
      new Player("bot-1", "Bot", "bot"),
    ];
    gameState = new GameState(board, players);
    constructionRules = new ConstructionRules(board, gameState);
  });

  describe("Game initialization", () => {
    it("should have correct initial state", () => {
      expect(gameState.players).toHaveLength(3);
      expect(gameState.currentPlayer).toBe(players[0]);
      expect(gameState.phase).toBe("initial-placement");
    });

    it("should have full resource bank", () => {
      expect(gameState.bank.brick).toBe(19);
      expect(gameState.bank.lumber).toBe(19);
      expect(gameState.bank.wool).toBe(19);
      expect(gameState.bank.grain).toBe(19);
      expect(gameState.bank.ore).toBe(19);
    });

    it("should have development deck", () => {
      expect(gameState.developmentDeck).toHaveLength(25);
    });

    it("should have action log", () => {
      const log = gameState.getActionLog();
      expect(log.length).toBeGreaterThan(0);
      expect(log[0]).toContain("Partida");
    });
  });

  describe("Settlement construction", () => {
    it("should allow initial settlement placement", () => {
      const player = gameState.currentPlayer;
      const vertex = board.vertices[0];

      const canBuild = constructionRules.canBuildSettlement(
        vertex.id,
        player.id,
        true,
      );

      expect(canBuild).toBe(true);

      constructionRules.buildSettlement(vertex.id, player.id, true);

      expect(board.settlements).toHaveLength(1);
      expect(board.getSettlementAtVertex(vertex.id)?.ownerId).toBe(player.id);
    });

    it("should prevent settlement on occupied vertex", () => {
      const player = gameState.currentPlayer;
      const vertex = board.vertices[0];

      constructionRules.buildSettlement(vertex.id, player.id, true);

      const canBuild = constructionRules.canBuildSettlement(
        vertex.id,
        player.id,
        true,
      );

      expect(canBuild).toBe(false);
    });

    it("should enforce distance rule", () => {
      const player = gameState.currentPlayer;
      const vertex1 = board.vertices[0];

      constructionRules.buildSettlement(vertex1.id, player.id, true);

      if (vertex1.adjacentVertexIds.length > 0) {
        const adjacentId = vertex1.adjacentVertexIds[0];
        const canBuild = constructionRules.canBuildSettlement(
          adjacentId,
          player.id,
          true,
        );

        expect(canBuild).toBe(false);
      }
    });
  });

  describe("Resource management", () => {
    it("should withdraw from bank when available", () => {
      const initialBrick = gameState.bank.brick;

      const canWithdraw = gameState.withdrawResourcesFromBank({ brick: 5 });

      expect(canWithdraw).toBe(true);
      expect(gameState.bank.brick).toBe(initialBrick - 5);
    });

    it("should prevent withdrawal when bank insufficient", () => {
      gameState.bank.brick = 2;

      const canWithdraw = gameState.withdrawResourcesFromBank({ brick: 5 });

      expect(canWithdraw).toBe(false);
      expect(gameState.bank.brick).toBe(2);
    });

    it("should check bank affordability", () => {
      const canAfford = gameState.canBankAfford({ brick: 10, ore: 5 });
      expect(canAfford).toBe(true);

      const cannotAfford = gameState.canBankAfford({ brick: 25 });
      expect(cannotAfford).toBe(false);
    });
  });

  describe("Player tracking", () => {
    it("should identify current player", () => {
      expect(gameState.currentPlayer).toBe(players[0]);
      expect(gameState.currentPlayerIndex).toBe(0);
    });

    it("should get player by id", () => {
      const player = gameState.getPlayerById("player-1");
      expect(player).toBe(players[0]);
    });

    it("should return undefined for non-existent player", () => {
      const player = gameState.getPlayerById("invalid");
      expect(player).toBeUndefined();
    });
  });

  describe("Action logging", () => {
    it("should add actions to log", () => {
      gameState.addActionLog("Test action");
      const log = gameState.getActionLog();

      expect(log[0]).toBe("Test action");
    });

    it("should keep last 100 actions", () => {
      for (let i = 0; i < 150; i++) {
        gameState.addActionLog(`Action ${i}`);
      }

      const log = gameState.getActionLog();
      expect(log.length).toBe(100);
    });

    it("should have newest actions first", () => {
      gameState.addActionLog("First");
      gameState.addActionLog("Second");
      gameState.addActionLog("Third");

      const log = gameState.getActionLog();
      expect(log[0]).toBe("Third");
      expect(log[1]).toBe("Second");
      expect(log[2]).toBe("First");
    });
  });

  describe("Multiple player operations", () => {
    it("should support operations for all players", () => {
      players.forEach((player) => {
        expect(gameState.getPlayerById(player.id)).toBe(player);
      });
    });

    it("should have all players in game", () => {
      expect(gameState.players).toHaveLength(3);
      expect(gameState.players[0].name).toBe("Player 1");
      expect(gameState.players[1].name).toBe("Player 2");
      expect(gameState.players[2].kind).toBe("bot");
    });
  });
});
