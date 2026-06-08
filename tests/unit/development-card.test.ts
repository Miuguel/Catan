import {
  createDevelopmentDeck,
  DEVELOPMENT_CARD_NAMES,
  PLAYABLE_CARD_TYPES,
  type DevelopmentCardType,
} from "../../src/core/game/DevelopmentCard";

describe("DevelopmentCard", () => {
  describe("Development card names", () => {
    it("should have names for all card types", () => {
      const cardTypes: DevelopmentCardType[] = [
        "knight",
        "victory-point",
        "monopoly",
        "year-of-plenty",
        "road-building",
      ];

      cardTypes.forEach((type) => {
        expect(DEVELOPMENT_CARD_NAMES[type]).toBeDefined();
        expect(typeof DEVELOPMENT_CARD_NAMES[type]).toBe("string");
      });
    });

    it("should have Portuguese names for all cards", () => {
      expect(DEVELOPMENT_CARD_NAMES.knight).toBe("Cavaleiro");
      expect(DEVELOPMENT_CARD_NAMES["victory-point"]).toBe("Ponto de Vitória");
      expect(DEVELOPMENT_CARD_NAMES.monopoly).toBe("Monopólio");
      expect(DEVELOPMENT_CARD_NAMES["year-of-plenty"]).toBe("Ano de Fartura");
      expect(DEVELOPMENT_CARD_NAMES["road-building"]).toBe(
        "Construção de Estradas",
      );
    });
  });

  describe("Playable card types", () => {
    it("should have victory-point not in playable cards", () => {
      expect(PLAYABLE_CARD_TYPES).not.toContain("victory-point");
    });

    it("should have all playable card types", () => {
      expect(PLAYABLE_CARD_TYPES).toContain("knight");
      expect(PLAYABLE_CARD_TYPES).toContain("monopoly");
      expect(PLAYABLE_CARD_TYPES).toContain("year-of-plenty");
      expect(PLAYABLE_CARD_TYPES).toContain("road-building");
    });

    it("should have exactly 4 playable card types", () => {
      expect(PLAYABLE_CARD_TYPES).toHaveLength(4);
    });
  });

  describe("Development deck creation", () => {
    it("should create a deck with 25 cards total", () => {
      const deck = createDevelopmentDeck();

      expect(deck).toHaveLength(25);
    });

    it("should have 14 knight cards", () => {
      const deck = createDevelopmentDeck();
      const knightCount = deck.filter((card) => card === "knight").length;

      expect(knightCount).toBe(14);
    });

    it("should have 5 victory-point cards", () => {
      const deck = createDevelopmentDeck();
      const vpCount = deck.filter((card) => card === "victory-point").length;

      expect(vpCount).toBe(5);
    });

    it("should have 2 of each special card", () => {
      const deck = createDevelopmentDeck();

      expect(deck.filter((card) => card === "monopoly")).toHaveLength(2);
      expect(deck.filter((card) => card === "year-of-plenty")).toHaveLength(2);
      expect(deck.filter((card) => card === "road-building")).toHaveLength(2);
    });

    it("should create deck with correct composition", () => {
      const deck = createDevelopmentDeck();
      const composition = {
        knight: 0,
        "victory-point": 0,
        monopoly: 0,
        "year-of-plenty": 0,
        "road-building": 0,
      };

      deck.forEach((card) => {
        composition[card]++;
      });

      expect(composition.knight).toBe(14);
      expect(composition["victory-point"]).toBe(5);
      expect(composition.monopoly).toBe(2);
      expect(composition["year-of-plenty"]).toBe(2);
      expect(composition["road-building"]).toBe(2);
    });

    it("should shuffle the deck", () => {
      const deck1 = createDevelopmentDeck();
      const deck2 = createDevelopmentDeck();

      // The decks should almost certainly not be in the same order
      // (probability of same order is 1/25! which is negligible)
      expect(deck1.join(",")).not.toEqual(deck2.join(","));
    });

    it("should create deck with randomness across multiple runs", () => {
      const decks = Array.from({ length: 5 }, () => createDevelopmentDeck());

      // Check that at least some decks are different
      const uniqueDecks = new Set(decks.map((d) => d.join(",")));

      expect(uniqueDecks.size).toBeGreaterThan(1);
    });
  });
});
