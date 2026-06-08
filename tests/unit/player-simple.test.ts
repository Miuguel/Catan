import { Player } from "../../src/core/game/Player";

describe("Player - Simplified", () => {
  let player: Player;

  beforeEach(() => {
    player = new Player("player-1", "Test Player");
  });

  describe("Basic functionality", () => {
    it("should have correct initial state", () => {
      expect(player.id).toBe("player-1");
      expect(player.name).toBe("Test Player");
      expect(player.victoryPoints).toBe(0);
      expect(player.pieces.roads).toBe(15);
      expect(player.pieces.settlements).toBe(5);
      expect(player.pieces.cities).toBe(4);
    });

    it("should add and spend resources", () => {
      player.addResources({ brick: 2, lumber: 1 });
      expect(player.resources.brick).toBe(2);
      expect(player.resources.lumber).toBe(1);

      player.spendResources({ brick: 1 });
      expect(player.resources.brick).toBe(1);
    });

    it("should consume piece types", () => {
      player.consumeRoadPiece();
      expect(player.pieces.roads).toBe(14);

      player.consumeSettlementPiece();
      expect(player.pieces.settlements).toBe(4);

      player.consumeCityPiece();
      expect(player.pieces.cities).toBe(3);
    });

    it("should check piece availability", () => {
      expect(player.canBuildRoadPiece()).toBe(true);
      expect(player.canBuildSettlementPiece()).toBe(true);
      expect(player.canBuildCityPiece()).toBe(true);

      for (let i = 0; i < 15; i++) {
        player.consumeRoadPiece();
      }
      expect(player.canBuildRoadPiece()).toBe(false);
    });

    it("should add development cards", () => {
      expect(player.developmentCards).toHaveLength(0);

      player.addDevelopmentCard({ type: "knight", purchasedTurn: 1 });
      expect(player.developmentCards).toHaveLength(1);
      expect(player.developmentCards[0].type).toBe("knight");
    });

    it("should track victory points", () => {
      player.victoryPoints = 5;
      expect(player.victoryPoints).toBe(5);

      player.victoryPoints = 10;
      expect(player.victoryPoints).toBe(10);
    });

    it("should throw error when spending unaffordable resources", () => {
      player.addResources({ brick: 1 });
      expect(() => {
        player.spendResources({ brick: 2 });
      }).toThrow("Player cannot afford this cost");
    });
  });
});
