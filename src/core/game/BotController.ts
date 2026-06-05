import { Board } from "../board/Board";
import { ConstructionRules } from "./ConstructionRules";
import { ConstructionCost } from "./ConstructionCost";
import { GameState } from "./GameState";
import type { Player } from "./Player";
import { ResourceDistributionService } from "./ResourceDistributionService";
import { getResourceName } from "./ResourceNames";
import type { ResourceInventory } from "./ResourceInventory";
import type { ResourceType } from "./ResourceType";

const BOT_ACTION_DELAY_MS = 500;
const MAX_BOT_ACTIONS_PER_TURN = 8;
const RESOURCE_TYPES: ResourceType[] = [
  "brick",
  "lumber",
  "wool",
  "grain",
  "ore",
];

function formatResourceList(resources: Partial<ResourceInventory>) {
  return Object.entries(resources)
    .filter(([, amount]) => amount > 0)
    .map(([type, amount]) => `${amount}x ${getResourceName(type)}`)
    .join(", ");
}

export class BotController {
  private timeoutId: number | null = null;
  private turnKey: string | null = null;
  private actionsThisTurn = 0;
  private disposed = false;

  constructor(
    private readonly board: Board,
    private readonly gameState: GameState,
    private readonly constructionRules: ConstructionRules,
    private readonly resourceDistributionService: ResourceDistributionService,
  ) {}

  tick() {
    if (this.disposed || this.timeoutId !== null || this.gameState.isFinished()) {
      return;
    }

    const currentPlayer = this.gameState.getCurrentPlayer();

    if (currentPlayer?.kind !== "bot") {
      return;
    }

    this.resetTurnCounterIfNeeded(currentPlayer);

    this.timeoutId = window.setTimeout(() => {
      this.timeoutId = null;
      this.runBotAction();
    }, BOT_ACTION_DELAY_MS);
  }

  dispose() {
    this.disposed = true;

    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private runBotAction() {
    if (this.disposed || this.gameState.isFinished()) {
      return;
    }

    const currentPlayer = this.gameState.getCurrentPlayer();

    if (currentPlayer?.kind !== "bot") {
      return;
    }

    this.resetTurnCounterIfNeeded(currentPlayer);
    this.actionsThisTurn += 1;

    if (
      this.actionsThisTurn > MAX_BOT_ACTIONS_PER_TURN &&
      this.gameState.phase === "main-actions"
    ) {
      this.passTurn(currentPlayer);
      return;
    }

    if (this.gameState.isInitialPlacementActive()) {
      this.playInitialPlacementAction(currentPlayer);
      return;
    }

    if (this.gameState.phase === "roll-dice") {
      this.rollDice(currentPlayer);
      return;
    }

    if (this.gameState.phase === "discard") {
      this.resolveDiscard();
      return;
    }

    if (this.gameState.phase === "robber") {
      this.moveRobber(currentPlayer);
      return;
    }

    if (this.gameState.phase === "main-actions") {
      this.playMainAction(currentPlayer);
    }
  }

  private resetTurnCounterIfNeeded(currentPlayer: Player) {
    const nextTurnKey = [
      this.gameState.turnNumber,
      this.gameState.phase,
      this.gameState.getInitialPlacementStep() ?? "-",
      currentPlayer.id,
    ].join(":");

    if (nextTurnKey !== this.turnKey) {
      this.turnKey = nextTurnKey;
      this.actionsThisTurn = 0;
    }
  }

  private playInitialPlacementAction(currentPlayer: Player) {
    const initialStep = this.gameState.getInitialPlacementStep();

    if (initialStep === "settlement") {
      const vertex = this.board.vertices.find((candidate) =>
        this.constructionRules.canBuildSettlement(
          candidate.id,
          currentPlayer.id,
          true,
        ),
      );

      if (vertex === undefined) {
        this.gameState.addActionLog(
          `${currentPlayer.name} não encontrou aldeia inicial válida.`,
        );
        return;
      }

      this.constructionRules.buildSettlement(vertex.id, currentPlayer.id, true);
      this.gameState.registerInitialPlacementSettlement(
        currentPlayer.id,
        vertex.id,
      );
      this.gameState.addActionLog(
        `${currentPlayer.name} colocou uma aldeia inicial.`,
      );

      if (this.gameState.getInitialPlacementSettlementCount(currentPlayer.id) === 2) {
        const grantedResources =
          this.resourceDistributionService.grantResourcesForVertex(
            vertex.id,
            currentPlayer.id,
          );

        if (grantedResources.length > 0) {
          this.gameState.addActionLog(
            `${currentPlayer.name} recebeu ${grantedResources
              .map((resourceType) => getResourceName(resourceType))
              .join(", ")}.`,
          );
        }
      }

      return;
    }

    if (initialStep === "road") {
      const road = this.board.roads.find((candidate) =>
        this.constructionRules.canBuildRoad(
          candidate.vertexAId,
          candidate.vertexBId,
          currentPlayer.id,
          true,
        ),
      );

      if (road === undefined) {
        this.gameState.addActionLog(
          `${currentPlayer.name} não encontrou estrada inicial válida.`,
        );
        return;
      }

      this.constructionRules.buildRoad(
        road.vertexAId,
        road.vertexBId,
        currentPlayer.id,
        true,
      );
      this.gameState.registerInitialPlacementRoad(currentPlayer.id);
      this.gameState.addActionLog(
        `${currentPlayer.name} colocou uma estrada inicial.`,
      );

      const nextPlayer = this.gameState.getCurrentPlayer();
      this.gameState.addActionLog(
        this.gameState.isInitialPlacementActive()
          ? `Próxima colocação inicial: ${nextPlayer?.name ?? "Jogador"} deve construir uma aldeia.`
          : `Configuração inicial concluída. ${nextPlayer?.name ?? "Jogador"} começa rolando os dados.`,
      );
    }
  }

  private rollDice(currentPlayer: Player) {
    const roll = this.gameState.rollDice();
    const distributions = this.resourceDistributionService.distributeForRoll(
      roll.total,
    );

    this.gameState.addActionLog(`${currentPlayer.name} rolou ${roll.total}.`);

    if (roll.total === 7) {
      this.gameState.addActionLog(
        `${currentPlayer.name} ativou o ladrão com o resultado 7.`,
      );
      return;
    }

    if (distributions.length === 0) {
      this.gameState.addActionLog(
        "Nenhum jogador recebeu recursos nesta rolagem.",
      );
      return;
    }

    distributions.forEach((distribution) => {
      const player = this.gameState.getPlayerById(distribution.playerId);
      const resourceList = formatResourceList(distribution.resources);

      if (player !== undefined && resourceList.length > 0) {
        this.gameState.addActionLog(`${player.name} recebeu ${resourceList}.`);
      }
    });
  }

  private resolveDiscard() {
    // Descarta automaticamente apenas os bots; humanos escolhem no modal.
    const discardResults = this.gameState.autoDiscardBots();

    discardResults.forEach((discardResult) => {
      const player = this.gameState.getPlayerById(discardResult.playerId);
      const resourceList = formatResourceList(discardResult.discardedResources);

      this.gameState.addActionLog(
        `${player?.name ?? discardResult.playerId} descartou ${resourceList}.`,
      );
    });

    this.gameState.finalizeDiscardPhaseIfReady();
    // Se ainda houver humano para descartar, o bot aguarda (modal do humano).
  }

  private moveRobber(currentPlayer: Player) {
    const currentRobberTile = this.board.tiles.find((tile) => tile.hasRobber);
    const isDifferentTile = (tile: { q: number; r: number }) =>
      currentRobberTile === undefined ||
      tile.q !== currentRobberTile.q ||
      tile.r !== currentRobberTile.r;

    // Prefere um hexágono que tenha um adversário com recursos para roubar.
    const targetTile =
      this.board.tiles.find(
        (tile) =>
          isDifferentTile(tile) &&
          tile.vertexIds.some((vertexId) => {
            const ownerId =
              this.board.getSettlementAtVertex(vertexId)?.ownerId ?? null;

            if (ownerId === null || ownerId === currentPlayer.id) {
              return false;
            }

            const owner = this.gameState.getPlayerById(ownerId);
            return owner !== undefined && owner.getTotalResources() > 0;
          }),
      ) ?? this.board.tiles.find((tile) => isDifferentTile(tile));

    if (targetTile === undefined) {
      this.gameState.addActionLog(
        `${currentPlayer.name} não encontrou hexágono válido para o ladrão.`,
      );
      return;
    }

    const robbery = this.gameState.moveRobberAuto(targetTile.q, targetTile.r);

    if (robbery.stolenFromPlayerId !== null && robbery.resourceType !== null) {
      const victim = this.gameState.getPlayerById(robbery.stolenFromPlayerId);

      this.gameState.addActionLog(
        `${currentPlayer.name} moveu o ladrão e roubou 1 ${getResourceName(
          robbery.resourceType,
        )} de ${victim?.name ?? robbery.stolenFromPlayerId}.`,
      );
      return;
    }

    this.gameState.addActionLog(
      `${currentPlayer.name} moveu o ladrão sem roubar recursos.`,
    );
  }

  private playMainAction(currentPlayer: Player) {
    if (this.tryBuildCity(currentPlayer)) {
      return;
    }

    if (this.tryBuildSettlement(currentPlayer)) {
      return;
    }

    if (this.tryBuildRoad(currentPlayer)) {
      return;
    }

    if (this.tryPlayDevelopmentCard(currentPlayer)) {
      return;
    }

    if (this.tryBuyDevelopmentCard(currentPlayer)) {
      return;
    }

    if (this.tryTradeWithBank(currentPlayer)) {
      return;
    }

    this.passTurn(currentPlayer);
  }

  private tryBuildCity(currentPlayer: Player) {
    const settlement = this.board.settlements.find(
      (candidate) =>
        candidate.ownerId === currentPlayer.id &&
        candidate.level === "settlement" &&
        this.constructionRules.canUpgradeSettlement(
          candidate.vertexId,
          currentPlayer.id,
        ),
    );

    if (settlement === undefined) {
      return false;
    }

    this.constructionRules.upgradeSettlement(
      settlement.vertexId,
      currentPlayer.id,
    );
    this.gameState.addActionLog(
      `${currentPlayer.name} melhorou uma aldeia para cidade.`,
    );
    return true;
  }

  private tryBuildSettlement(currentPlayer: Player) {
    const vertex = this.board.vertices.find((candidate) =>
      this.constructionRules.canBuildSettlement(candidate.id, currentPlayer.id),
    );

    if (vertex === undefined) {
      return false;
    }

    this.constructionRules.buildSettlement(vertex.id, currentPlayer.id);
    this.gameState.addActionLog(`${currentPlayer.name} construiu uma aldeia.`);
    return true;
  }

  private tryBuildRoad(currentPlayer: Player) {
    const road = this.board.roads.find((candidate) =>
      this.constructionRules.canBuildRoad(
        candidate.vertexAId,
        candidate.vertexBId,
        currentPlayer.id,
      ),
    );

    if (road === undefined) {
      return false;
    }

    this.constructionRules.buildRoad(
      road.vertexAId,
      road.vertexBId,
      currentPlayer.id,
    );
    this.gameState.addActionLog(`${currentPlayer.name} construiu uma estrada.`);
    return true;
  }

  private tryPlayDevelopmentCard(currentPlayer: Player) {
    if (!this.gameState.canPlayDevelopmentCardThisTurn()) {
      return false;
    }

    if (this.gameState.canPlayDevelopmentCard(currentPlayer.id, "knight")) {
      this.gameState.playKnight(currentPlayer.id);
      this.gameState.addActionLog(`${currentPlayer.name} jogou um Cavaleiro.`);
      return true; // próximo tick: fase do ladrão será resolvida
    }

    if (
      this.gameState.canPlayDevelopmentCard(currentPlayer.id, "year-of-plenty")
    ) {
      const picks = this.pickYearOfPlentyResources(currentPlayer);

      try {
        this.gameState.playYearOfPlenty(currentPlayer.id, picks);
        this.gameState.addActionLog(
          `${currentPlayer.name} jogou Ano de Fartura e pegou ${formatResourceList(picks)}.`,
        );
        return true;
      } catch {
        // se não houver recurso no banco, tenta outra carta
      }
    }

    if (this.gameState.canPlayDevelopmentCard(currentPlayer.id, "monopoly")) {
      const resourceType = this.pickMonopolyResource(currentPlayer);
      const total = this.gameState.playMonopoly(currentPlayer.id, resourceType);
      this.gameState.addActionLog(
        `${currentPlayer.name} jogou Monopólio de ${getResourceName(resourceType)} e coletou ${total}.`,
      );
      return true;
    }

    if (
      this.gameState.canPlayDevelopmentCard(currentPlayer.id, "road-building")
    ) {
      this.gameState.playRoadBuilding(currentPlayer.id);
      this.gameState.addActionLog(
        `${currentPlayer.name} jogou Construção de Estradas.`,
      );
      return true; // estradas grátis serão construídas nos próximos ticks
    }

    return false;
  }

  private pickMonopolyResource(currentPlayer: Player): ResourceType {
    const totals: Record<ResourceType, number> = {
      brick: 0,
      lumber: 0,
      wool: 0,
      grain: 0,
      ore: 0,
    };

    this.gameState.players.forEach((player) => {
      if (player.id === currentPlayer.id) {
        return;
      }

      RESOURCE_TYPES.forEach((resourceType) => {
        totals[resourceType] += player.resources[resourceType];
      });
    });

    let best: ResourceType = "brick";

    RESOURCE_TYPES.forEach((resourceType) => {
      if (totals[resourceType] > totals[best]) {
        best = resourceType;
      }
    });

    return best;
  }

  private pickYearOfPlentyResources(
    currentPlayer: Player,
  ): Partial<ResourceInventory> {
    const result: Partial<ResourceInventory> = {};
    let remaining = 2;

    const fillMissingFor = (cost: ResourceInventory) => {
      RESOURCE_TYPES.forEach((resourceType) => {
        if (remaining <= 0) {
          return;
        }

        const missing =
          cost[resourceType] -
          currentPlayer.resources[resourceType] -
          (result[resourceType] ?? 0);

        if (missing > 0 && this.gameState.bank[resourceType] > 0) {
          const take = Math.min(missing, remaining);
          result[resourceType] = (result[resourceType] ?? 0) + take;
          remaining -= take;
        }
      });
    };

    fillMissingFor(ConstructionCost.settlement);
    fillMissingFor(ConstructionCost.road);

    // Completa com os primeiros recursos disponíveis no banco.
    RESOURCE_TYPES.forEach((resourceType) => {
      if (remaining <= 0) {
        return;
      }

      const available =
        this.gameState.bank[resourceType] - (result[resourceType] ?? 0);

      if (available > 0) {
        const take = Math.min(remaining, available);
        result[resourceType] = (result[resourceType] ?? 0) + take;
        remaining -= take;
      }
    });

    return result;
  }

  private tryBuyDevelopmentCard(currentPlayer: Player) {
    if (!this.gameState.canBuyDevelopmentCard(currentPlayer.id)) {
      return false;
    }

    this.gameState.buyDevelopmentCard(currentPlayer.id);
    this.gameState.addActionLog(
      `${currentPlayer.name} comprou uma carta de desenvolvimento.`,
    );
    return true;
  }

  private tryTradeWithBank(currentPlayer: Player) {
    const targetCost =
      this.getCostWithSingleMissingResource(currentPlayer, ConstructionCost.city) ??
      this.getCostWithSingleMissingResource(
        currentPlayer,
        ConstructionCost.settlement,
      ) ??
      this.getCostWithSingleMissingResource(currentPlayer, ConstructionCost.road);

    if (targetCost === null) {
      return false;
    }

    const offeredResource = RESOURCE_TYPES.find(
      (resourceType) =>
        resourceType !== targetCost.missingResource &&
        currentPlayer.resources[resourceType] >= 4,
    );

    if (offeredResource === undefined) {
      return false;
    }

    try {
      this.gameState.exchangeWithBank(
        currentPlayer.id,
        offeredResource,
        targetCost.missingResource,
      );
    } catch {
      return false;
    }

    this.gameState.addActionLog(
      `${currentPlayer.name} trocou 4 ${getResourceName(
        offeredResource,
      )} por 1 ${getResourceName(targetCost.missingResource)} com o banco.`,
    );
    return true;
  }

  private getCostWithSingleMissingResource(
    currentPlayer: Player,
    cost: ResourceInventory,
  ) {
    const missingResources = RESOURCE_TYPES.flatMap((resourceType) => {
      const missingAmount = cost[resourceType] - currentPlayer.resources[resourceType];

      return missingAmount > 0
        ? Array.from({ length: missingAmount }, () => resourceType)
        : [];
    });

    if (missingResources.length !== 1) {
      return null;
    }

    return {
      missingResource: missingResources[0],
    };
  }

  private passTurn(currentPlayer: Player) {
    this.gameState.nextTurn();
    const nextPlayer = this.gameState.getCurrentPlayer();
    this.gameState.addActionLog(
      `${currentPlayer.name} passou o turno para ${nextPlayer?.name ?? "Jogador"}.`,
    );
  }
}
