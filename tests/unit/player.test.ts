import { Player } from "../../src/core/game/Player";

describe("Player", () => {
  it("starts with the official Catan piece inventory", () => {
    const player = new Player("player-1", "Jogador");

    expect(player.pieces).toEqual({
      roads: 15,
      settlements: 5,
      cities: 4,
    });
  });

  it("spends resources only when the player can afford the cost", () => {
    const player = new Player("player-1", "Jogador");
    player.addResources({ brick: 1, lumber: 1 });

    player.spendResources({ brick: 1, lumber: 1 });

    expect(player.resources.brick).toBe(0);
    expect(player.resources.lumber).toBe(0);
    expect(() => player.spendResources({ ore: 1 })).toThrow(
      "Player cannot afford this cost",
    );
  });
});
