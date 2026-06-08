import { ConstructionCost } from "../../src/core/game/ConstructionCost";
import type { ResourceInventory } from "../../src/core/game/ResourceInventory";

describe("ConstructionCost", () => {
  describe("Road construction cost", () => {
    it("should have correct road construction cost", () => {
      const expectedCost: ResourceInventory = {
        brick: 1,
        lumber: 1,
        wool: 0,
        grain: 0,
        ore: 0,
      };

      expect(ConstructionCost.road).toEqual(expectedCost);
    });

    it("should require only brick and lumber for roads", () => {
      const roadCost = ConstructionCost.road;
      expect(roadCost.brick).toBe(1);
      expect(roadCost.lumber).toBe(1);
      expect(roadCost.wool).toBe(0);
      expect(roadCost.grain).toBe(0);
      expect(roadCost.ore).toBe(0);
    });
  });

  describe("Settlement construction cost", () => {
    it("should have correct settlement construction cost", () => {
      const expectedCost: ResourceInventory = {
        brick: 1,
        lumber: 1,
        wool: 1,
        grain: 1,
        ore: 0,
      };

      expect(ConstructionCost.settlement).toEqual(expectedCost);
    });

    it("should require one of each resource except ore", () => {
      const settlementCost = ConstructionCost.settlement;
      expect(settlementCost.brick).toBe(1);
      expect(settlementCost.lumber).toBe(1);
      expect(settlementCost.wool).toBe(1);
      expect(settlementCost.grain).toBe(1);
      expect(settlementCost.ore).toBe(0);
    });
  });

  describe("City construction cost", () => {
    it("should have correct city construction cost", () => {
      const expectedCost: ResourceInventory = {
        brick: 0,
        lumber: 0,
        wool: 0,
        grain: 2,
        ore: 3,
      };

      expect(ConstructionCost.city).toEqual(expectedCost);
    });

    it("should require grain and ore only for cities", () => {
      const cityCost = ConstructionCost.city;
      expect(cityCost.brick).toBe(0);
      expect(cityCost.lumber).toBe(0);
      expect(cityCost.wool).toBe(0);
      expect(cityCost.grain).toBe(2);
      expect(cityCost.ore).toBe(3);
    });
  });

  describe("Development Card construction cost", () => {
    it("should have correct development card construction cost", () => {
      const expectedCost: ResourceInventory = {
        brick: 0,
        lumber: 0,
        wool: 1,
        grain: 1,
        ore: 1,
      };

      expect(ConstructionCost.developmentCard).toEqual(expectedCost);
    });

    it("should require wool, grain and ore for development cards", () => {
      const devCardCost = ConstructionCost.developmentCard;
      expect(devCardCost.brick).toBe(0);
      expect(devCardCost.lumber).toBe(0);
      expect(devCardCost.wool).toBe(1);
      expect(devCardCost.grain).toBe(1);
      expect(devCardCost.ore).toBe(1);
    });
  });

  describe("Cost comparison", () => {
    it("road should be cheaper than settlement", () => {
      const roadTotal =
        Object.values(ConstructionCost.road).reduce((a, b) => a + b) || 0;
      const settlementTotal =
        Object.values(ConstructionCost.settlement).reduce((a, b) => a + b) ||
        0;

      expect(roadTotal).toBeLessThan(settlementTotal);
    });

    it("settlement should be cheaper than city", () => {
      const settlementTotal =
        Object.values(ConstructionCost.settlement).reduce((a, b) => a + b) ||
        0;
      const cityTotal =
        Object.values(ConstructionCost.city).reduce((a, b) => a + b) || 0;

      expect(settlementTotal).toBeLessThan(cityTotal);
    });
  });
});
