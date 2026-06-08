import { shouldBotAcceptTrade } from "../../src/core/game/TradeService";
import { Player } from "../../src/core/game/Player";

describe("TradeService", () => {
  describe("shouldBotAcceptTrade", () => {
    let bot: Player;

    beforeEach(() => {
      bot = new Player("bot-1", "Bot", "bot");
    });

    it("should reject trades with zero resources offered", () => {
      bot.addResources({ brick: 5 });

      const result = shouldBotAcceptTrade(
        bot,
        {},
        { brick: 1 }
      );

      expect(result).toBe(false);
    });

    it("should reject trades with zero resources requested", () => {
      bot.addResources({ brick: 5 });

      const result = shouldBotAcceptTrade(
        bot,
        { brick: 1 },
        {}
      );

      expect(result).toBe(false);
    });

    it("should reject trades when bot cannot afford the cost", () => {
      bot.addResources({ brick: 1 });

      const result = shouldBotAcceptTrade(
        bot,
        { lumber: 1 },
        { brick: 2 }
      );

      expect(result).toBe(false);
    });

    it("should accept trades with equal resource quantities", () => {
      bot.addResources({ brick: 2, lumber: 1 });

      const result = shouldBotAcceptTrade(
        bot,
        { brick: 2 },
        { lumber: 1 }
      );

      expect(result).toBe(true);
    });

    it("should accept trades where bot receives more resources", () => {
      bot.addResources({ brick: 3 });

      const result = shouldBotAcceptTrade(
        bot,
        { lumber: 5 },
        { brick: 2 }
      );

      expect(result).toBe(true);
    });

    it("should accept trades for missing resources even with fewer total resources", () => {
      bot.addResources({ brick: 5, lumber: 0 });

      const result = shouldBotAcceptTrade(
        bot,
        { lumber: 1 },
        { brick: 2 }
      );

      expect(result).toBe(true);
    });

    it("should reject trades where bot would have negative resources", () => {
      bot.addResources({ brick: 1, lumber: 1 });

      const result = shouldBotAcceptTrade(
        bot,
        { grain: 1 },
        { brick: 2 }
      );

      expect(result).toBe(false);
    });

    it.skip("should reject trades with only one resource type", () => {
      bot.addResources({ brick: 5 });

      const result = shouldBotAcceptTrade(
        bot,
        { brick: 2 },
        { brick: 1 }
      );

      expect(result).toBe(false);
    });

    it("should handle complex multi-resource trades", () => {
      bot.addResources({
        brick: 2,
        lumber: 3,
        wool: 1,
        grain: 2,
        ore: 0,
      });

      const result = shouldBotAcceptTrade(
        bot,
        { ore: 2, grain: 1 },
        { brick: 1, lumber: 1 }
      );

      expect(result).toBe(true);
    });

    it("should prefer trades that provide needed resources over quantity", () => {
      bot.addResources({ brick: 10, lumber: 10, wool: 10, grain: 10, ore: 0 });

      const result = shouldBotAcceptTrade(
        bot,
        { ore: 1 },
        { brick: 2 }
      );

      expect(result).toBe(true);
    });
  });
});
