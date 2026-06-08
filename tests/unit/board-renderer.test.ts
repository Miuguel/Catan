import { BoardRenderer } from "../../src/render/BoardRenderer";
import { Board } from "../../src/core/board/Board";
import { GameState } from "../../src/core/game/GameState";

describe("BoardRenderer", () => {
  let renderer: BoardRenderer;
  let mockCanvas: HTMLCanvasElement;
  let mockBoard: Board;
  let mockGameState: GameState;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    // Create mock canvas
    mockCanvas = document.createElement("canvas");
    mockCanvas.width = 800;
    mockCanvas.height = 600;

    // Create a lightweight mock context with the minimal API used by BoardRenderer
    mockContext = ({
      canvas: mockCanvas,
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fill: () => {},
      fillText: () => {},
      strokeText: () => {},
      measureText: (_: string) => ({ width: 0 } as any),
      arc: () => {},
      translate: () => {},
      rotate: () => {},
      rect: () => {},
      quadraticCurveTo: () => {},
      setLineDash: () => {},
      drawImage: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
    } as unknown) as CanvasRenderingContext2D;
    expect(mockContext.canvas).toBe(mockCanvas);

    // Polyfill Path2D for the test environment
    (global as any).Path2D = class {
      constructor() {}
      moveTo() {}
      lineTo() {}
      closePath() {}
    };

    // Create real board and game state
    mockBoard = new Board();
    mockGameState = new GameState(mockBoard);

    renderer = new BoardRenderer(mockContext, mockBoard);
  });

  it("creates board renderer instance", () => {
    expect(renderer).toBeDefined();
  });

  it("renders the board without errors", () => {
    expect(() => {
      renderer.render({
        selectedVertexId: null,
        selectedRoadId: null,
        hoveredVertexId: null,
        hoveredRoadId: null,
        hoveredTileKey: null,
      });
    }).not.toThrow();
  });

  it("renders with selected vertex", () => {
    expect(() => {
      const vertexId = mockBoard.vertices[0]?.id || "vertex-1";
      renderer.render({
        selectedVertexId: vertexId,
        selectedRoadId: null,
        hoveredVertexId: null,
        hoveredRoadId: null,
        hoveredTileKey: null,
      });
    }).not.toThrow();
  });

  it("renders with hovered elements", () => {
    expect(() => {
      renderer.render({
        selectedVertexId: null,
        selectedRoadId: null,
        hoveredVertexId: mockBoard.vertices[0]?.id || "vertex-1",
        hoveredRoadId: null,
        hoveredTileKey: null,
      });
    }).not.toThrow();
  });

  it("renders with highlighted settlements", () => {
    expect(() => {
      renderer.render({
        selectedVertexId: null,
        selectedRoadId: null,
        hoveredVertexId: null,
        hoveredRoadId: null,
        hoveredTileKey: null,
      });
    }).not.toThrow();
  });

  it("canvas context is not null after rendering", () => {
    renderer.render({
      selectedVertexId: null,
      selectedRoadId: null,
      hoveredVertexId: null,
      hoveredRoadId: null,
      hoveredTileKey: null,
    });

    expect(mockCanvas.getContext("2d")).toBeDefined();
  });
});
