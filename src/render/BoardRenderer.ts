import { Hex } from "../core/Hex";
import { Board } from "../core/board/Board";

export type BoardRenderState = {
  mode?: string | null;
  selectedVertexId?: string | null;
  selectedRoadId?: string | null;
  hoveredVertexId?: string | null;
  hoveredRoadId?: string | null;
  hoveredTileKey?: string | null;
  robberTile?: { q: number; r: number } | null;
};

export class BoardRenderer {
  ctx: CanvasRenderingContext2D;
  board: Board;

  private readonly playerColors: Record<string, string> = {
    "player-1": "#2563eb",
    "player-2": "#dc2626",
  };

  constructor(ctx: CanvasRenderingContext2D, board: Board) {
    this.ctx = ctx;
    this.board = board;
  }

  drawHex(hex: Hex, state: BoardRenderState) {
    const { x, y } = hex.getPixelPosition();
    const tile = this.board.getTileAtHex(hex.q, hex.r);

    const centerX = x + this.ctx.canvas.width / 2;
    const centerY = y + this.ctx.canvas.height / 2;

    this.ctx.beginPath();

    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);

      const px = centerX + hex.size * Math.cos(angle);
      const py = centerY + hex.size * Math.sin(angle);

      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }

    this.ctx.closePath();

    this.ctx.fillStyle = this.getTileFillStyle(tile?.type);
    this.ctx.fill();

    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    const tileKey = `${hex.q}:${hex.r}`;

    if (state.hoveredTileKey === tileKey) {
      this.ctx.beginPath();

      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i - 30);
        const px = centerX + hex.size * Math.cos(angle);
        const py = centerY + hex.size * Math.sin(angle);

        if (i === 0) {
          this.ctx.moveTo(px, py);
        } else {
          this.ctx.lineTo(px, py);
        }
      }

      this.ctx.closePath();
      this.ctx.strokeStyle = "#fde047";
      this.ctx.lineWidth = 5;
      this.ctx.stroke();
    }

    if (tile?.numberToken !== null && tile?.numberToken !== undefined) {
      this.ctx.fillStyle =
        tile.numberToken === 6 || tile.numberToken === 8
          ? "#b91c1c"
          : "#111827";
      this.ctx.font = "bold 18px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(String(tile.numberToken), centerX, centerY);
    }
  }

  private drawRoad(
    roadId: string,
    selectedRoadId?: string | null,
    hoveredRoadId?: string | null,
    mode?: string | null,
  ) {
    const road = this.board.getRoadById(roadId);

    if (road === undefined) {
      return;
    }

    const vertexA = this.board.getVertex(road.vertexAId);
    const vertexB = this.board.getVertex(road.vertexBId);

    if (vertexA === undefined || vertexB === undefined) {
      return;
    }

    const offsetX = this.ctx.canvas.width / 2;
    const offsetY = this.ctx.canvas.height / 2;
    const strokeColor =
      road.ownerId === null
        ? "rgba(255,255,255,0.25)"
        : (this.playerColors[road.ownerId] ?? "#f9fafb");

    this.ctx.beginPath();
    this.ctx.moveTo(vertexA.x + offsetX, vertexA.y + offsetY);
    this.ctx.lineTo(vertexB.x + offsetX, vertexB.y + offsetY);
    const isSelected = road.id === selectedRoadId;
    const isHovered = road.id === hoveredRoadId;
    const isPreview = mode === "build-road" && isHovered && !isSelected;

    this.ctx.lineWidth = isSelected ? 10 : isHovered ? 8 : 5;
    this.ctx.strokeStyle = isSelected
      ? "#f59e0b"
      : isPreview
        ? "#fcd34d"
        : strokeColor;
    this.ctx.lineCap = "round";
    this.ctx.setLineDash(isPreview ? [6, 6] : []);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  private drawVertex(
    vertexId: string,
    selectedVertexId?: string | null,
    hoveredVertexId?: string | null,
    mode?: string | null,
  ) {
    const vertex = this.board.getVertex(vertexId);

    if (vertex === undefined) {
      return;
    }

    const offsetX = this.ctx.canvas.width / 2;
    const offsetY = this.ctx.canvas.height / 2;
    const x = vertex.x + offsetX;
    const y = vertex.y + offsetY;
    const settlement = this.board.getSettlementAtVertex(vertexId);
    const radius =
      settlement === undefined ? 5 : settlement.level === "city" ? 11 : 8;
    const isSelected = vertexId === selectedVertexId;
    const isHovered = vertexId === hoveredVertexId;
    const isPreview =
      (mode === "build-settlement" || mode === "upgrade-settlement") &&
      isHovered &&
      !isSelected;

    this.ctx.beginPath();
    this.ctx.fillStyle = isSelected
      ? "#f59e0b"
      : isPreview
        ? "#fcd34d"
        : "#f3f4f6";
    this.ctx.strokeStyle = "#111827";
    this.ctx.lineWidth = isSelected || isHovered ? 3 : 2;
    this.ctx.arc(x, y, radius + (isHovered ? 1 : 0), 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    if (isPreview && settlement === undefined) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, 15, 0, Math.PI * 2);
      this.ctx.strokeStyle = "rgba(253, 224, 71, 0.7)";
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([4, 4]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    if (settlement !== undefined) {
      const settlementColor = this.playerColors[settlement.ownerId];
      this.ctx.fillStyle = settlementColor ?? "#9ca3af";
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
      this.ctx.fill();

      if (settlementColor === undefined) {
        console.warn(`Settlement with unknown owner: ${settlement.ownerId}`);
      }
    }
  }

  private drawRobber() {
    const robberTile = this.board.tiles.find((tile) => tile.hasRobber);

    if (robberTile === undefined) {
      return;
    }

    const offsetX = this.ctx.canvas.width / 2;
    const offsetY = this.ctx.canvas.height / 2;
    const center = this.board.getTileCanvasCenter(robberTile, offsetX, offsetY);

    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(17, 24, 39, 0.9)";
    this.ctx.arc(center.x, center.y, 13, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private getTileFillStyle(type?: string) {
    switch (type) {
      case "brick":
        return "#b45309";
      case "lumber":
        return "#15803d";
      case "wool":
        return "#65a30d";
      case "grain":
        return "#eab308";
      case "ore":
        return "#6b7280";
      case "desert":
        return "#d6b37a";
      default:
        return "#4b5563";
    }
  }

  render(state: BoardRenderState = {}) {
    this.board.hexes.forEach((hex) => {
      this.drawHex(hex, state);
    });

    this.board.roads.forEach((road) =>
      this.drawRoad(
        road.id,
        state.selectedRoadId,
        state.hoveredRoadId,
        state.mode,
      ),
    );

    this.board.vertices.forEach((vertex) =>
      this.drawVertex(
        vertex.id,
        state.selectedVertexId,
        state.hoveredVertexId,
        state.mode,
      ),
    );

    this.drawRobber();
  }
}
