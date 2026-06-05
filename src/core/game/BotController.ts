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
    const distributions = this.resourceDistributionService.distributeForRoll(roll);

    this.gameState.addActionLog(`${currentPlayer.name} rolou ${roll}.`);

    if (roll === 7) {
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
    const discardResults = this.gameState.resolveSevenDiscard();

    if (discardResults.length === 0) {
      this.gameState.addActionLog(
        "Nenhum jogador tinha mais de 7 recursos para descartar.",
      );
    } else {
      discardResults.forEach((discardResult) => {
        const player = this.gameState.getPlayerById(discardResult.playerId);
        const resourceList = formatResourceList(
          discardResult.discardedResources,
        );

        this.gameState.addActionLog(
          `${player?.name ?? discardResult.playerId} descartou ${resourceList}.`,
        );
      });
    }

    this.gameState.addActionLog("Descarte do 7 resolvido automaticamente.");
  }

  private moveRobber(currentPlayer: Player) {
    const currentRobberTile = this.board.tiles.find((tile) => tile.hasRobber);
    const targetTile = this.board.tiles.find(
      (tile) =>
        currentRobberTile === undefined ||
        tile.q !== currentRobberTile.q ||
        tile.r !== currentRobberTile.r,
    );

    if (targetTile === undefined) {
      this.gameState.addActionLog(
        `${currentPlayer.name} não encontrou hexágono válido para o ladrão.`,
      );
      return;
    }

    const robbery = this.gameState.moveRobber(targetTile.q, targetTile.r);

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
    if (
      currentPlayer.developmentCards.length === 0 ||
      !this.gameState.canPlayDevelopmentCardThisTurn()
    ) {
      return false;
    }

    const cardName = currentPlayer.developmentCards.shift();

    if (cardName === undefined) {
      return false;
    }

    this.gameState.markDevelopmentCardPlayed();
    this.gameState.addActionLog(
      `${currentPlayer.name} jogou ${cardName} sem efeito especial nesta versão simplificada.`,
    );
    return true;
  }

  private tryBuyDevelopmentCard(currentPlayer: Player) {
    if (!this.gameState.canCurrentPlayerBuyDevelopmentCard()) {
      return false;
    }

    this.gameState.spendForDevelopmentCard();
    currentPlayer.addDevelopmentCard("Carta de Desenvolvimento");
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
