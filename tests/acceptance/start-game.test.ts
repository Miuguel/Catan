import { Board } from "../../src/core/board/Board";
import { GameState } from "../../src/core/game/GameState";
import { Player } from "../../src/core/game/Player";
import type { TileType } from "../../src/core/board/Tile";

describe("Game start acceptance", () => {
  it("starts a Catan match in initial placement with action history", () => {
    const board = new Board();
    const players = [
      new Player("player-1", "Humano", "human"),
      new Player("player-2", "Bot Helena", "bot"),
      new Player("player-3", "Bot Marco", "bot"),
    ];
    const gameState = new GameState(board, players);

    expect(board.tiles).toHaveLength(19);
    expect(gameState.phase).toBe("initial-placement");
    expect(gameState.getCurrentPlayer()).toBe(players[0]);
    expect(gameState.getActionLog()).toContain("Partida iniciada.");
  });

  it("creates the official base board composition with desert robber", () => {
    const board = new Board();
    const tileCounts = board.tiles.reduce(
      (counts, tile) => ({
        ...counts,
        [tile.type]: counts[tile.type] + 1,
      }),
      {
        brick: 0,
        lumber: 0,
        wool: 0,
        grain: 0,
        ore: 0,
        desert: 0,
      } satisfies Record<TileType, number>,
    );
    const numberedTiles = board.tiles.filter((tile) => tile.numberToken !== null);
    const desertTile = board.tiles.find((tile) => tile.type === "desert");

    expect(tileCounts).toEqual({
      brick: 3,
      lumber: 4,
      wool: 4,
      grain: 4,
      ore: 3,
      desert: 1,
    });
    expect(numberedTiles).toHaveLength(18);
    expect(desertTile?.hasRobber).toBe(true);
    expect(desertTile?.numberToken).toBeNull();
  });
});
