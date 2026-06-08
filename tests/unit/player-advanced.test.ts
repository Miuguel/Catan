import { Player } from "../../src/core/game/Player";
import {
  getResourceColor,
  getResourceName,
  RESOURCE_COLORS,
  RESOURCE_NAMES,
} from "../../src/core/game/ResourceNames";

describe("Player - advanced", () => {
  let player: Player;

  beforeEach(() => {
    player = new Player("p1", "Tester");
  });

  it("counts total resources", () => {
    player.addResources({ brick: 2, lumber: 3, ore: 1 });
    expect(player.getTotalResources()).toBe(6);
  });

  it("adds a single resource", () => {
    player.addResource("wool", 2);
    expect(player.resources.wool).toBe(2);
  });

  it("discards the requested amount", () => {
    player.addResources({ brick: 3, lumber: 3, wool: 2 });
    const discarded = player.discardResources(4);

    expect(player.getTotalResources()).toBe(4);
    expect(Object.values(discarded).reduce((a, b) => a + (b ?? 0), 0)).toBe(4);
  });

  it("returns development card counts by type", () => {
    player.addDevelopmentCard({ type: "knight", purchasedTurn: 1 });
    player.addDevelopmentCard({ type: "knight", purchasedTurn: 1 });
    player.addDevelopmentCard({ type: "monopoly", purchasedTurn: 1 });

    expect(player.getDevelopmentCardCounts()).toEqual({
      knight: 2,
      "victory-point": 0,
      monopoly: 1,
      "year-of-plenty": 0,
      "road-building": 0,
    });
  });

  it("counts victory point cards", () => {
    player.addDevelopmentCard({ type: "victory-point", purchasedTurn: 1 });
    expect(player.countVictoryPointCards()).toBe(1);
  });

  it("detects playable development cards from previous turns", () => {
    player.addDevelopmentCard({ type: "knight", purchasedTurn: 1 });
    player.addDevelopmentCard({ type: "knight", purchasedTurn: 5 });

    expect(player.hasPlayableDevelopmentCard("knight", 3)).toBe(true);
    expect(player.hasPlayableDevelopmentCard("knight", 5)).toBe(true);
    player.addDevelopmentCard({ type: "monopoly", purchasedTurn: 3 });
    expect(player.hasPlayableDevelopmentCard("monopoly", 3)).toBe(false);
  });

  it("removes a playable development card", () => {
    player.addDevelopmentCard({ type: "monopoly", purchasedTurn: 1 });
    expect(player.removeDevelopmentCard("monopoly", 3)).toBe(true);
    expect(player.developmentCards).toHaveLength(0);
    expect(player.removeDevelopmentCard("monopoly", 3)).toBe(false);
  });

  it("releases a settlement piece when upgrading", () => {
    player.consumeSettlementPiece();
    player.releaseSettlementPiece();
    expect(player.pieces.settlements).toBe(5);
  });

  it("takes a random resource from inventory", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);
    player.addResources({ ore: 2 });

    const taken = player.takeRandomResource();

    expect(taken).toBe("ore");
    expect(player.resources.ore).toBe(1);
    jest.restoreAllMocks();
  });

  it("returns null when taking from empty inventory", () => {
    expect(player.takeRandomResource()).toBeNull();
  });

  it("throws when consuming unavailable pieces", () => {
    for (let i = 0; i < 15; i += 1) {
      player.consumeRoadPiece();
    }
    expect(() => player.consumeRoadPiece()).toThrow("no roads left");

    for (let i = 0; i < 5; i += 1) {
      player.consumeSettlementPiece();
    }
    expect(() => player.consumeSettlementPiece()).toThrow("no settlements left");
    for (let i = 0; i < 4; i += 1) {
      player.consumeCityPiece();
    }
    expect(() => player.consumeCityPiece()).toThrow("no cities left");
  });
});

describe("ResourceNames", () => {
  it("maps resource types to Portuguese names", () => {
    expect(RESOURCE_NAMES.brick).toBe("Tijolo");
    expect(getResourceName("lumber")).toBe("Madeira");
    expect(getResourceName("unknown")).toBe("unknown");
  });

  it("maps resource types to colors", () => {
    expect(RESOURCE_COLORS.ore).toBe("#6b7280");
    expect(getResourceColor("grain")).toBe("#eab308");
    expect(getResourceColor("invalid")).toBe("#4b5563");
  });
});
