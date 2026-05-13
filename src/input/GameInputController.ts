import { Board } from "../core/board/Board";
import { ConstructionRules } from "../core/game/ConstructionRules";
import { GameState } from "../core/game/GameState";
import { ResourceDistributionService } from "../core/game/ResourceDistributionService";
import { getResourceName } from "../core/game/ResourceNames";

export type InputMode =
  | "idle"
  | "build-road"
  | "build-settlement"
  | "upgrade-settlement";

export type BoardSelectionState = {
  selectedVertexId: string | null;
  selectedRoadId: string | null;
  hoveredVertexId: string | null;
  hoveredRoadId: string | null;
  hoveredTileKey: string | null;
};

export class GameInputController {
  private mode: InputMode = "idle";
  private statusMessage =
    "Configuração inicial: construa uma aldeia e depois uma estrada.";
  private selectedVertexId: string | null = null;
  private selectedRoadId: string | null = null;
  private hoveredVertexId: string | null = null;
  private hoveredRoadId: string | null = null;
  private hoveredTileKey: string | null = null;
  private initialPlacementLastSettlementVertexId: string | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly board: Board,
    private readonly gameState: GameState,
    private readonly constructionRules: ConstructionRules,
    private readonly resourceDistributionService: ResourceDistributionService,
  ) {
    this.canvas.addEventListener("click", this.handleCanvasClick);
    this.canvas.addEventListener("mousemove", this.handleCanvasMove);
    this.canvas.addEventListener("mouseleave", this.clearHoverState);
  }

  dispose() {
    this.canvas.removeEventListener("click", this.handleCanvasClick);
    this.canvas.removeEventListener("mousemove", this.handleCanvasMove);
    this.canvas.removeEventListener("mouseleave", this.clearHoverState);
  }

  setMode(mode: InputMode) {
    if (this.gameState.isInitialPlacementActive()) {
      if (
        mode === "build-settlement" &&
        !this.gameState.canCurrentPlayerPlaceInitialSettlement()
      ) {
        this.statusMessage =
          "Na configuração inicial, primeiro construa uma estrada.";
        return;
      }

      if (
        mode === "build-road" &&
        !this.gameState.canCurrentPlayerPlaceInitialRoad()
      ) {
        this.statusMessage =
          "Na configuração inicial, primeiro construa uma aldeia.";
        return;
      }

      if (mode === "upgrade-settlement") {
        this.statusMessage =
          "Melhoria para cidade só está disponível depois da configuração inicial.";
        return;
      }
    }

    this.mode = mode;
    this.selectedVertexId = null;
    this.selectedRoadId = null;

    if (mode === "build-road") {
      this.statusMessage = "Clique em uma aresta para construir uma estrada.";
    } else if (mode === "build-settlement") {
      this.statusMessage = "Clique em um vértice para construir uma aldeia.";
    } else if (mode === "upgrade-settlement") {
      this.statusMessage =
        "Clique em um vértice com aldeia sua para virar cidade.";
    }
  }

  rollDice() {
    if (this.gameState.isFinished()) {
      return;
    }

    if (this.gameState.phase !== "roll-dice") {
      this.statusMessage = "Role os dados na fase correta.";
      return;
    }

    const currentPlayer = this.gameState.getCurrentPlayer();
    const roll = this.gameState.rollDice();
    const distributions =
      this.resourceDistributionService.distributeForRoll(roll);

    this.gameState.addActionLog(
      `${currentPlayer?.name ?? "Jogador"} rolou ${roll}.`,
    );

    if (roll === 7) {
      this.statusMessage = "Saiu 7. Resolva o descarte e depois mova o ladrão.";
      this.mode = "idle";
      return;
    }

    if (distributions.length > 0) {
      distributions.forEach((distribution) => {
        const player = this.gameState.getPlayerById(distribution.playerId);
        if (
          player !== undefined &&
          Object.keys(distribution.resources).length > 0
        ) {
          const resourceList = Object.entries(distribution.resources)
            .filter(([, amount]) => amount > 0)
            .map(([type, amount]) => `${amount}x ${getResourceName(type)}`)
            .join(", ");

          if (resourceList) {
            this.gameState.addActionLog(
              `${player.name} recebeu ${resourceList}.`,
            );
          }
        }
      });
    }

    this.statusMessage = `Saiu ${roll}. Você pode agir agora.`;
  }

  resolveDiscard() {
    if (this.gameState.phase !== "discard") {
      this.statusMessage = "Não há descarte pendente.";
      return;
    }

    this.gameState.resolveSevenDiscard();
    this.gameState.addActionLog("Descarte do 7 resolvido.");
    this.statusMessage = "Escolha um hexágono para mover o ladrão.";
    this.mode = "idle";
  }

  passTurn() {
    if (this.gameState.isFinished()) {
      return;
    }

    if (this.gameState.phase !== "main-actions") {
      this.statusMessage = this.gameState.isInitialPlacementActive()
        ? "Finalize a configuração inicial para liberar turnos normais."
        : "Você só pode passar o turno na fase principal.";
      return;
    }

    const previousPlayer = this.gameState.getCurrentPlayer();
    this.gameState.nextTurn();
    this.mode = "idle";
    this.selectedVertexId = null;
    this.selectedRoadId = null;

    const currentPlayer = this.gameState.getCurrentPlayer();

    if (currentPlayer !== undefined) {
      this.statusMessage = `Turno de ${currentPlayer.name}. Role os dados.`;
      this.gameState.addActionLog(
        `${previousPlayer?.name ?? "Jogador"} passou o turno para ${currentPlayer.name}.`,
      );
    }
  }

  getStatusMessage() {
    return this.statusMessage;
  }

  getMode() {
    return this.mode;
  }

  getRenderState() {
    return {
      mode: this.mode,
      selectedVertexId: this.selectedVertexId,
      selectedRoadId: this.selectedRoadId,
      hoveredVertexId: this.hoveredVertexId,
      hoveredRoadId: this.hoveredRoadId,
      hoveredTileKey: this.hoveredTileKey,
      robberTile: this.board.tiles.find((tile) => tile.hasRobber) ?? null,
    };
  }

  private handleCanvasMove = (event: MouseEvent) => {
    const position = this.getPointerPosition(event);

    if (position === null) {
      this.clearHoverState();
      return;
    }

    const { x, y, offsetX, offsetY } = position;

    if (this.gameState.phase === "robber") {
      const tile = this.board.getTileAtPoint(x, y, offsetX, offsetY);

      this.hoveredTileKey = tile ? `${tile.q}:${tile.r}` : null;
      this.hoveredVertexId = null;
      this.hoveredRoadId = null;
      return;
    }

    this.hoveredTileKey = null;

    if (
      this.mode === "build-settlement" ||
      this.mode === "upgrade-settlement"
    ) {
      const vertex = this.board.getVertexAtPoint(x, y, offsetX, offsetY);

      this.hoveredVertexId = vertex?.id ?? null;
      this.hoveredRoadId = null;
      return;
    }

    if (this.mode === "build-road") {
      const road = this.board.getRoadAtPoint(x, y, offsetX, offsetY);

      this.hoveredRoadId = road?.id ?? null;
      this.hoveredVertexId = null;
      return;
    }

    this.hoveredVertexId = null;
    this.hoveredRoadId = null;
  };

  private clearHoverState = () => {
    this.hoveredVertexId = null;
    this.hoveredRoadId = null;
    this.hoveredTileKey = null;
  };

  private getPointerPosition(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      return null;
    }

    const x = ((event.clientX - rect.left) / rect.width) * this.canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * this.canvas.height;
    const offsetX = this.canvas.width / 2;
    const offsetY = this.canvas.height / 2;

    return { x, y, offsetX, offsetY };
  }

  private handleCanvasClick = (event: MouseEvent) => {
    const position = this.getPointerPosition(event);

    if (position === null) {
      return;
    }

    const { x, y, offsetX, offsetY } = position;
    const currentPlayer = this.gameState.getCurrentPlayer();

    if (currentPlayer === undefined) {
      this.statusMessage = "Nenhum jogador ativo.";
      return;
    }

    if (this.gameState.phase === "robber") {
      const tile = this.board.getTileAtPoint(x, y, offsetX, offsetY);

      if (tile === undefined) {
        this.statusMessage = "Clique em um hexágono para mover o ladrão.";
        return;
      }

      try {
        const robbery = this.gameState.moveRobber(tile.q, tile.r);

        if (
          robbery.stolenFromPlayerId !== null &&
          robbery.resourceType !== null
        ) {
          const victim = this.gameState.getPlayerById(
            robbery.stolenFromPlayerId,
          );
          const victimName = victim?.name ?? robbery.stolenFromPlayerId;

          this.statusMessage = `Ladrão movido. Você roubou 1 ${robbery.resourceType} de ${victimName}.`;
          this.gameState.addActionLog(
            `${currentPlayer.name} moveu o ladrão e roubou 1 ${robbery.resourceType} de ${victimName}.`,
          );
        } else {
          this.statusMessage =
            "Ladrão movido. Nenhum jogador elegível para roubo.";
          this.gameState.addActionLog(
            `${currentPlayer.name} moveu o ladrão sem roubar recursos.`,
          );
        }
      } catch (error) {
        this.statusMessage =
          error instanceof Error ? error.message : "Falha ao mover o ladrão.";
      }
      return;
    }

    if (
      this.gameState.phase !== "main-actions" &&
      this.gameState.phase !== "initial-placement"
    ) {
      return;
    }

    const isInitialPlacement = this.gameState.phase === "initial-placement";

    if (this.mode === "build-road") {
      const road = this.board.getRoadAtPoint(x, y, offsetX, offsetY);

      if (road === undefined) {
        this.statusMessage =
          "Clique em uma aresta válida para construir a estrada.";
        return;
      }

      try {
        if (isInitialPlacement) {
          if (!this.gameState.canCurrentPlayerPlaceInitialRoad()) {
            this.statusMessage =
              "Na configuração inicial, construa a aldeia antes da estrada.";
            return;
          }

          if (
            this.initialPlacementLastSettlementVertexId !== null &&
            !road.connectsVertex(this.initialPlacementLastSettlementVertexId)
          ) {
            this.statusMessage =
              "A estrada inicial deve tocar a aldeia que você acabou de construir.";
            return;
          }
        }

        this.constructionRules.buildRoad(
          road.vertexAId,
          road.vertexBId,
          currentPlayer.id,
          isInitialPlacement,
        );

        if (isInitialPlacement) {
          this.gameState.registerInitialPlacementRoad(currentPlayer.id);
          this.initialPlacementLastSettlementVertexId = null;
        }

        this.gameState.addActionLog(
          isInitialPlacement
            ? `${currentPlayer.name} colocou uma estrada inicial.`
            : `${currentPlayer.name} construiu uma estrada.`,
        );

        this.selectedRoadId = road.id;
        this.selectedVertexId = null;
        this.statusMessage = this.gameState.isInitialPlacementActive()
          ? "Estrada inicial construída. Próximo jogador: construa uma aldeia."
          : "Estrada construída.";
      } catch (error) {
        this.statusMessage =
          error instanceof Error
            ? error.message
            : "Falha ao construir estrada.";
      }

      return;
    }

    if (this.mode === "build-settlement") {
      const vertex = this.board.getVertexAtPoint(x, y, offsetX, offsetY);

      if (vertex === undefined) {
        this.statusMessage =
          "Clique em um vértice válido para construir a aldeia.";
        return;
      }

      try {
        let settlementStatusMessage = "Aldeia construída.";

        if (
          isInitialPlacement &&
          !this.gameState.canCurrentPlayerPlaceInitialSettlement()
        ) {
          this.statusMessage =
            "Na configuração inicial, construa uma estrada antes da próxima aldeia.";
          return;
        }

        this.constructionRules.buildSettlement(
          vertex.id,
          currentPlayer.id,
          isInitialPlacement,
        );

        const grantedResources =
          this.resourceDistributionService.grantResourcesForVertex(
            vertex.id,
            currentPlayer.id,
          );

        if (isInitialPlacement) {
          this.gameState.registerInitialPlacementSettlement(currentPlayer.id);
          this.initialPlacementLastSettlementVertexId = vertex.id;

          if (
            this.gameState.getInitialPlacementSettlementCount(
              currentPlayer.id,
            ) === 2
          ) {
            const translatedResources = grantedResources.map((r) =>
              getResourceName(r),
            );
            settlementStatusMessage =
              translatedResources.length > 0
                ? `Aldeia inicial construída. Você recebeu ${translatedResources.join(", ")}. Agora construa a estrada conectada a ela.`
                : "Aldeia inicial construída. Agora construa a estrada conectada a ela.";
          } else {
            settlementStatusMessage =
              "Aldeia inicial construída. Agora construa a estrada conectada a ela.";
          }
        } else {
          const translatedResources = grantedResources.map((r) =>
            getResourceName(r),
          );
          settlementStatusMessage =
            translatedResources.length > 0
              ? `Aldeia construída. Você recebeu ${translatedResources.join(", ")}.`
              : "Aldeia construída.";
        }

        this.gameState.addActionLog(
          isInitialPlacement
            ? `${currentPlayer.name} colocou uma aldeia inicial.`
            : `${currentPlayer.name} construiu uma aldeia.`,
        );

        if (grantedResources.length > 0) {
          const translatedResources = grantedResources.map((r) =>
            getResourceName(r),
          );
          this.gameState.addActionLog(
            `${currentPlayer.name} recebeu ${translatedResources.join(", ")}.`,
          );
        }

        this.selectedVertexId = vertex.id;
        this.selectedRoadId = null;
        this.statusMessage = settlementStatusMessage;
      } catch (error) {
        this.statusMessage =
          error instanceof Error ? error.message : "Falha ao construir aldeia.";
      }

      return;
    }

    if (this.mode === "upgrade-settlement") {
      const vertex = this.board.getVertexAtPoint(x, y, offsetX, offsetY);

      if (vertex === undefined) {
        this.statusMessage =
          "Clique em um vértice com aldeia sua para melhorar.";
        return;
      }

      try {
        this.constructionRules.upgradeSettlement(vertex.id, currentPlayer.id);
        this.selectedVertexId = vertex.id;
        this.statusMessage = "Aldeia promovida a cidade.";
        this.gameState.addActionLog(
          `${currentPlayer.name} melhorou uma aldeia para cidade.`,
        );
      } catch (error) {
        this.statusMessage =
          error instanceof Error
            ? error.message
            : "Falha ao melhorar a aldeia.";
      }
    }
  };
}
