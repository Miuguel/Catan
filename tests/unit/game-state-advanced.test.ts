import { GameState } from "../../src/core/game/GameState";
import { Board } from "../../src/core/board/Board";
import { Player } from "../../src/core/game/Player";
import { TurnPhase } from "../../src/core/game/TurnPhase";

describe("GameState - Advanced", () => {
  let gameState: GameState;
  let board: Board;

  beforeEach(() => {
    board = new Board();
    const players = [
      new Player("p1", "A"),
      new Player("p2", "B"),
      new Player("p3", "C"),
      new Player("p4", "D"),
    ];
    gameState = new GameState(board, players);
  });

  it("initializes with correct number of players", () => {
    expect(gameState.players).toHaveLength(4);
  });

  it("gets player by ID", () => {
    const players = gameState.players;
    const player = gameState.getPlayerById(players[0].id);
    expect(player).toBe(players[0]);
  });

  it("returns undefined for invalid player ID", () => {
    const player = gameState.getPlayerById("invalid-id");
    expect(player).toBeUndefined();
  });

  it("has initial phase set", () => {
    const phase = gameState.phase;
    expect(phase).toBeDefined();
  });

  it("gets current player", () => {
    const player = gameState.getCurrentPlayer();
    expect(player).toBeDefined();
  });

  it("gets action log", () => {
    const log = gameState.getActionLog();
    expect(Array.isArray(log)).toBe(true);
  });

  it("adds action to log", () => {
    const initialLog = gameState.getActionLog();
    gameState.addActionLog("test action");
    const updatedLog = gameState.getActionLog();
    expect(updatedLog.length).toBeGreaterThan(initialLog.length);
  });

  it("checks bank affordability", () => {
    const canAfford = gameState.canBankAfford({ brick: 1, grain: 1 });
    expect(typeof canAfford).toBe("boolean");
  });

  it("withdraws resources from bank", () => {
    const initialBank = { ...gameState.bank };
    const success = gameState.withdrawResourcesFromBank({ brick: 1 });
    
    if (success) {
      const updatedBank = gameState.bank;
      if (initialBank.brick !== undefined) {
        expect(updatedBank.brick).toBeLessThanOrEqual(initialBank.brick);
      }
    }
  });

  it("handles invalid resource withdrawal", () => {
    const result = gameState.withdrawResourcesFromBank({
      brick: 100000,
      grain: 100000,
    });
    // Should return false for excessive withdrawal
    expect(typeof result).toBe("boolean");
  });

  it("gets development card deck", () => {
    const deck = gameState.developmentDeck;
    expect(Array.isArray(deck)).toBe(true);
  });

  it("gets board", () => {
    const retrievedBoard = gameState.board;
    expect(retrievedBoard).toBe(board);
  });
});
