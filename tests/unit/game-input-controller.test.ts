import { GameInputController } from "../../src/input/GameInputController";

function makeCanvas(width = 200, height = 200) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  // provide a non-zero bounding rect
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width, height, right: width, bottom: height } as any);
  return canvas;
}

const noop = () => {};

describe("GameInputController (basic)", () => {
  test("setMode blocks upgrade during initial placement and provides message", () => {
    const canvas = makeCanvas();

    const board: any = { tiles: [], getTileAtPoint: noop, getVertexAtPoint: noop, getRoadAtPoint: noop };

    const gameState: any = {
      isInitialPlacementActive: () => true,
      canCurrentPlayerPlaceInitialSettlement: () => false,
      canCurrentPlayerPlaceInitialRoad: () => true,
    };

    const controller = new GameInputController(canvas, board, gameState, {} as any, {} as any);

    controller.setMode("upgrade-settlement");

    expect(controller.getStatusMessage()).toMatch(/Melhoria para cidade só está disponível depois da configuração inicial/);
  });

  test("startRoadBuildingMode sets expected mode and message", () => {
    const canvas = makeCanvas();
    const board: any = { tiles: [], getTileAtPoint: noop, getVertexAtPoint: noop, getRoadAtPoint: noop };

    const gameState: any = { isInitialPlacementActive: () => false };

    const controller = new GameInputController(canvas, board, gameState, {} as any, {} as any);

    controller.startRoadBuildingMode();

    expect(controller.getMode()).toBe("build-road");
    expect(controller.getStatusMessage()).toMatch(/Construção de Estradas/);
  });
});

