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

const VERTEX_PROBABILITY_SCORES: Record<number, number> = {
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  8: 5,
  9: 4,
  10: 3,
  11: 2,
  12: 1,
};

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

  private getDiceTokenScore(numberToken: number | null) {
    return numberToken === null ? 0 : VERTEX_PROBABILITY_SCORES[numberToken] ?? 0;
  }

  private getVertexTiles(vertexId: string) {
    return this.board.tiles.filter((tile) => tile.vertexIds.includes(vertexId));
  }

  private getVertexResourceTypes(vertexId: string) {
    return Array.from(
      new Set(
        this.getVertexTiles(vertexId)
          .map((tile) => tile.type)
          .filter((type): type is ResourceType => type !== "desert"),
      ),
    );
  }

  private getVertexProbabilityScore(vertexId: string) {
    return this.getVertexTiles(vertexId).reduce(
      (score, tile) => score + this.getDiceTokenScore(tile.numberToken),
      0,
    );
  }

  private getVertexDiversityScore(vertexId: string) {
    return this.getVertexResourceTypes(vertexId).length * 2;
  }

  private getVertexSynergyScore(vertexId: string) {
    const resourceTypes = new Set(this.getVertexResourceTypes(vertexId));
    let score = 0;

    if (resourceTypes.has("brick") && resourceTypes.has("lumber")) {
      score += 4;
    }

    if (resourceTypes.has("grain") && resourceTypes.has("ore")) {
      score += 4;
    }

    return score;
  }

  private getVertexHarborScore(vertexId: string, player: Player) {
    return this.board.harbors.reduce((score, harbor) => {
      if (harbor.vertexAId !== vertexId && harbor.vertexBId !== vertexId) {
        return score;
      }

      if (harbor.type === "generic") {
        return score + 3;
      }

      return score + (player.resources[harbor.type] >= 3 ? 5 : 3);
    }, 0);
  }

  private getNearbyOpponentSettlementPenalty(vertex: {
    adjacentVertexIds: string[];
  }, playerId: string) {
    return vertex.adjacentVertexIds.reduce((penalty, adjacentVertexId) => {
      const settlement = this.board.getSettlementAtVertex(adjacentVertexId);
      return settlement !== undefined && settlement.ownerId !== playerId
        ? penalty + 5
        : penalty;
    }, 0);
  }

  private getVertexScore(
    vertex: { id: string; adjacentVertexIds: string[] },
    player: Player,
    missingResources = new Set<ResourceType>(),
  ) {
    const base = this.getVertexProbabilityScore(vertex.id);
    const diversity = this.getVertexDiversityScore(vertex.id);
    const synergy = this.getVertexSynergyScore(vertex.id);
    const harbor = this.getVertexHarborScore(vertex.id, player);
    const penalty = this.getNearbyOpponentSettlementPenalty(vertex, player.id);
    const resourceTypes = this.getVertexResourceTypes(vertex.id);
    const balanceBonus = Array.from(missingResources).reduce(
      (bonus, resourceType) =>
        resourceTypes.includes(resourceType) ? bonus + 2 : bonus,
      0,
    );

    return base + diversity + synergy + harbor + balanceBonus - penalty;
  }

  private getMissingResourcesForSecondInitialSettlement(playerId: string) {
    const ownedSettlements = this.board.settlements.filter(
      (settlement) => settlement.ownerId === playerId,
    );

    if (ownedSettlements.length !== 1) {
      return new Set<ResourceType>();
    }

    const coveredResources = new Set(
      this.getVertexResourceTypes(ownedSettlements[0].vertexId),
    );

    return new Set(
      RESOURCE_TYPES.filter((resourceType) => !coveredResources.has(resourceType)),
    );
  }

  private findBestSettlementVertex(
    player: Player,
    isInitialPlacement = false,
    missingResources = new Set<ResourceType>(),
  ) {
    const candidates = this.board.vertices.filter((vertex) =>
      this.constructionRules.canBuildSettlement(
        vertex.id,
        player.id,
        isInitialPlacement,
      ),
    );

    let bestVertex:
      | (typeof this.board.vertices)[number]
      | undefined = undefined;
    let bestScore = -Infinity;

    for (const candidate of candidates) {
      const score = this.getVertexScore(candidate, player, missingResources);

      if (bestVertex === undefined || score > bestScore) {
        bestVertex = candidate;
        bestScore = score;
      }
    }

    return bestVertex;
  }

  private getRoadResourceAccessScore(road: { vertexAId: string; vertexBId: string }) {
    const tiles = this.board.tiles.filter(
      (tile) =>
        tile.vertexIds.includes(road.vertexAId) ||
        tile.vertexIds.includes(road.vertexBId),
    );

    const total = tiles.reduce(
      (sum, tile) => sum + this.getDiceTokenScore(tile.numberToken),
      0,
    );

    return total * 0.5;
  }

  private getRoadExpansionScore(road: {
    vertexAId: string;
    vertexBId: string;
  },
  playerId: string) {
    const endpoints = [
      this.board.getVertex(road.vertexAId),
      this.board.getVertex(road.vertexBId),
    ];

    let bestScore = 0;

    for (const [index, endpoint] of endpoints.entries()) {
      const opposite = endpoints[1 - index];

      if (endpoint === undefined || opposite === undefined) {
        continue;
      }

      if (
        !this.board.isVertexConnectedToPlayer(endpoint.id, playerId) ||
        opposite.isOccupied()
      ) {
        continue;
      }

      if (!this.board.canPlaceSettlement(opposite.id)) {
        continue;
      }

      const vertexScore = this.getVertexScore(
        opposite,
        this.gameState.getPlayerById(playerId)!,
      );

      bestScore = Math.max(bestScore, vertexScore);
    }

    return bestScore * 0.5;
  }

  private getRoadEnemyBlockScore(
    road: { vertexAId: string; vertexBId: string },
    playerId: string,
  ) {
    const endpoints = [
      this.board.getVertex(road.vertexAId),
      this.board.getVertex(road.vertexBId),
    ];

    const isAdjacentToEnemy = (vertex: { adjacentVertexIds: string[] }) =>
      vertex.adjacentVertexIds.some((adjacentVertexId) => {
        const settlement = this.board.getSettlementAtVertex(adjacentVertexId);
        return settlement !== undefined && settlement.ownerId !== playerId;
      });

    let score = 0;

    for (const [index, endpoint] of endpoints.entries()) {
      const opposite = endpoints[1 - index];

      if (
        endpoint !== undefined &&
        this.board.isVertexConnectedToPlayer(endpoint.id, playerId) &&
        opposite !== undefined &&
        !opposite.isOccupied() &&
        isAdjacentToEnemy(opposite)
      ) {
        score += 4;
      }
    }

    return score;
  }

  private getRoadEnemyPenalty(
    road: { vertexAId: string; vertexBId: string },
    playerId: string,
  ) {
    return [road.vertexAId, road.vertexBId].reduce((penalty, vertexId) => {
      const vertex = this.board.getVertex(vertexId);

      if (vertex === undefined) {
        return penalty;
      }

      const adjacentEnemyCount = vertex.adjacentVertexIds.reduce(
        (count, adjacentVertexId) => {
          const settlement = this.board.getSettlementAtVertex(adjacentVertexId);
          return settlement !== undefined && settlement.ownerId !== playerId
            ? count + 1
            : count;
        },
        0,
      );

      return penalty - adjacentEnemyCount * 2;
    }, 0);
  }

  private scoreRoad(
    road: { vertexAId: string; vertexBId: string },
    player: Player,
  ) {
    let score = 0;

    if (
      this.board.isVertexConnectedToPlayer(road.vertexAId, player.id) ||
      this.board.isVertexConnectedToPlayer(road.vertexBId, player.id)
    ) {
      score += 8;
    }

    score += this.getRoadResourceAccessScore(road);
    score += this.getRoadExpansionScore(road, player.id);
    score += this.getRoadEnemyBlockScore(road, player.id);
    score += this.getRoadEnemyPenalty(road, player.id);

    return score;
  }

  private findBestRoad(playerId: string, isInitialPlacement = false) {
    const candidates = this.board.roads.filter((candidate) =>
      this.constructionRules.canBuildRoad(
        candidate.vertexAId,
        candidate.vertexBId,
        playerId,
        isInitialPlacement,
      ),
    );

    let bestRoad:
      | (typeof this.board.roads)[number]
      | undefined = undefined;
    let bestScore = -Infinity;

    for (const candidate of candidates) {
      const score = this.scoreRoad(candidate, this.gameState.getPlayerById(playerId)!);

      if (bestRoad === undefined || score > bestScore) {
        bestRoad = candidate;
        bestScore = score;
      }
    }

    return bestRoad;
  }

  private getCityUpgradeScore(settlement: { vertexId: string }) {
    return (
      this.getVertexProbabilityScore(settlement.vertexId) +
      this.getVertexDiversityScore(settlement.vertexId) +
      this.getVertexSynergyScore(settlement.vertexId)
    );
  }

  private findBestCityUpgrade(player: Player) {
    const candidates = this.board.settlements.filter(
      (candidate) =>
        candidate.ownerId === player.id &&
        candidate.level === "settlement" &&
        this.constructionRules.canUpgradeSettlement(candidate.vertexId, player.id),
    );

    let bestSettlement:
      | (typeof this.board.settlements)[number]
      | undefined = undefined;
    let bestScore = -Infinity;

    for (const candidate of candidates) {
      const score = this.getCityUpgradeScore(candidate);

      if (bestSettlement === undefined || score > bestScore) {
        bestSettlement = candidate;
        bestScore = score;
      }
    }

    return bestSettlement;
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
      const missingResources =
        this.getMissingResourcesForSecondInitialSettlement(currentPlayer.id);
      const vertex = this.findBestSettlementVertex(
        currentPlayer,
        true,
        missingResources,
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
      const road = this.findBestRoad(currentPlayer.id, true);

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
    const settlement = this.findBestCityUpgrade(currentPlayer);

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
    const vertex = this.findBestSettlementVertex(currentPlayer);

    if (vertex === undefined) {
      return false;
    }

    this.constructionRules.buildSettlement(vertex.id, currentPlayer.id);
    this.gameState.addActionLog(`${currentPlayer.name} construiu uma aldeia.`);
    return true;
  }

  private tryBuildRoad(currentPlayer: Player) {
    const road = this.findBestRoad(currentPlayer.id);

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

    // Usa a melhor taxa disponível (porto específico, genérico ou 4:1).
    const offeredResource = RESOURCE_TYPES.find(
      (resourceType) =>
        resourceType !== targetCost.missingResource &&
        currentPlayer.resources[resourceType] >=
          this.gameState.getBankTradeRate(currentPlayer.id, resourceType),
    );

    if (offeredResource === undefined) {
      return false;
    }

    const rate = this.gameState.getBankTradeRate(
      currentPlayer.id,
      offeredResource,
    );

    try {
      this.gameState.exchangeWithBank(
        currentPlayer.id,
        offeredResource,
        targetCost.missingResource,
        rate,
      );
    } catch {
      return false;
    }

    this.gameState.addActionLog(
      `${currentPlayer.name} trocou ${rate} ${getResourceName(
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
