import { Board } from "../../src/core/board/Board";
import { BotController } from "../../src/core/game/BotController";
import { ConstructionRules } from "../../src/core/game/ConstructionRules";
import { GameState } from "../../src/core/game/GameState";
import { Player } from "../../src/core/game/Player";
import { ResourceDistributionService } from "../../src/core/game/ResourceDistributionService";

describe("Bot turn system flow", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("automatically performs the first initial placement action for a bot", () => {
    const board = new Board();
    const bot = new Player("player-1", "Bot", "bot");
    const gameState = new GameState(board, [bot]);
    const constructionRules = new ConstructionRules(board, gameState);
    const resourceDistributionService = new ResourceDistributionService(gameState);
    const botController = new BotController(
      board,
      gameState,
      constructionRules,
      resourceDistributionService,
    );

    botController.tick();
    jest.runOnlyPendingTimers();

    expect(board.settlements).toHaveLength(1);
    expect(gameState.getInitialPlacementStep()).toBe("road");

    botController.dispose();
  });

  it("automatically completes settlement and road setup steps for a bot", () => {
    const board = new Board();
    const bot = new Player("player-1", "Bot", "bot");
    const gameState = new GameState(board, [bot]);
    const constructionRules = new ConstructionRules(board, gameState);
    const resourceDistributionService = new ResourceDistributionService(gameState);
    const botController = new BotController(
      board,
      gameState,
      constructionRules,
      resourceDistributionService,
    );

    botController.tick();
    jest.runOnlyPendingTimers();
    botController.tick();
    jest.runOnlyPendingTimers();

    expect(board.settlements).toHaveLength(1);
    expect(board.roads.filter((road) => road.ownerId === bot.id)).toHaveLength(1);
    expect(gameState.getInitialPlacementStep()).toBe("settlement");

    botController.dispose();
  });
});
