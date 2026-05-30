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
  private tileImages: Record<string, HTMLImageElement> = {};
  private resourceIcons: Record<string, HTMLImageElement> = {};

  private readonly playerColors: Record<string, string> = {
    "player-1": "#2563eb",
    "player-2": "#dc2626",
  };

  private readonly tileImageMap: Record<string, string> = {
    brick: "/hills.png",
    lumber: "/forest2.png",
    wool: "/pasture.png",
    grain: "/fields2.png",
    ore: "/mountains2.png",
    desert: "/desert2.png",
  };

  private readonly resourceIconMap: Record<string, string> = {
    brick: "/icon_brick.png",
    lumber: "/icon_lumber.png",
    wool: "/icon_wool.png",
    grain: "/icon_grain.png",
    ore: "/icon_ore.png",
    desert: "/icon_desert.png",
  };

  constructor(ctx: CanvasRenderingContext2D, board: Board) {
    this.ctx = ctx;
    this.board = board;
    this.loadTileImages();
    this.loadResourceIcons();
  }

  private loadTileImages() {
    Object.entries(this.tileImageMap).forEach(([tileType, imagePath]) => {
      const img = new Image();
      img.src = imagePath;
      this.tileImages[tileType] = img;
    });
  }

  private loadResourceIcons() {
    Object.entries(this.resourceIconMap).forEach(([tileType, imagePath]) => {
      const img = new Image();
      img.src = imagePath;
      this.resourceIcons[tileType] = img;
    });
  }

  drawHex(hex: Hex, state: BoardRenderState) {
    const { x, y } = hex.getPixelPosition();
    const tile = this.board.getTileAtHex(hex.q, hex.r);

    const centerX = x + this.ctx.canvas.width / 2;
    const centerY = y + this.ctx.canvas.height / 2;

    const hexPath = new Path2D();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      const px = centerX + hex.size * Math.cos(angle);
      const py = centerY + hex.size * Math.sin(angle);

      if (i === 0) {
        hexPath.moveTo(px, py);
      } else {
        hexPath.lineTo(px, py);
      }
    }
    hexPath.closePath();

    if (tile && this.tileImages[tile.type]?.complete) {
      this.ctx.save();
      this.ctx.clip(hexPath);

      const imageSize = hex.size * 2.32;
      this.ctx.drawImage(
        this.tileImages[tile.type],
        centerX - imageSize / 2,
        centerY - imageSize / 2,
        imageSize,
        imageSize
      );

      this.ctx.restore();
    } else {
      this.ctx.fillStyle = this.getTileFillStyle(tile?.type);
      this.ctx.fill(hexPath);
    }

    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 2;
    this.ctx.stroke(hexPath);

    const tileKey = `${hex.q}:${hex.r}`;

    if (state.hoveredTileKey === tileKey) {
      this.ctx.strokeStyle = "#fde047";
      this.ctx.lineWidth = 5;
      this.ctx.stroke(hexPath);
    }

    // Renderizar apenas o número da área com fundo semi-opaco centralizado
    if (tile && tile.type !== "desert") {
      const hasNumber = tile.numberToken !== null && tile.numberToken !== undefined;

      if (hasNumber) {
        const numberFontSize = Math.round(hex.size * 0.38);
        const panelW = hex.size * 0.62;
        const panelH = hex.size * 0.50;
        const panelX = centerX - panelW / 2;
        const panelY = centerY - panelH / 2;
        const radius = panelH / 2;

        // Fundo semi-opaco em forma ovval
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(panelX + radius, panelY);
        this.ctx.lineTo(panelX + panelW - radius, panelY);
        this.ctx.quadraticCurveTo(panelX + panelW, panelY, panelX + panelW, panelY + radius);
        this.ctx.lineTo(panelX + panelW, panelY + panelH - radius);
        this.ctx.quadraticCurveTo(panelX + panelW, panelY + panelH, panelX + panelW - radius, panelY + panelH);
        this.ctx.lineTo(panelX + radius, panelY + panelH);
        this.ctx.quadraticCurveTo(panelX, panelY + panelH, panelX, panelY + panelH - radius);
        this.ctx.lineTo(panelX, panelY + radius);
        this.ctx.quadraticCurveTo(panelX, panelY, panelX + radius, panelY);
        this.ctx.closePath();

        const isHot = tile.numberToken === 6 || tile.numberToken === 8;
        this.ctx.fillStyle = isHot ? "rgba(180, 30, 30, 0.75)" : "rgba(0, 0, 0, 0.55)";
        this.ctx.fill();
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        // Número centralizado
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = `bold ${numberFontSize}px sans-serif`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(String(tile.numberToken), centerX, centerY);
        this.ctx.restore();
      }
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
      ? strokeColor
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

    if (settlement === undefined && !isPreview && !isSelected) {
      return;
    }

    this.ctx.beginPath();
    this.ctx.fillStyle = isSelected
      ? "#f59e0b"
      : isPreview
        ? "#fcd34d"
        : this.playerColors[settlement!.ownerId] ?? "#f3f4f6";

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
