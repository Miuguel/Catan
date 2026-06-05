import type { Player } from "./Player";
import type { ResourceInventory } from "./ResourceInventory";
import type { ResourceType } from "./ResourceType";

function totalResourceCount(resources: Partial<ResourceInventory>) {
  return (Object.keys(resources) as ResourceType[]).reduce(
    (total, resourceType) => total + (resources[resourceType] ?? 0),
    0,
  );
}

/**
 * Regra simples de aceitação de troca por um bot (Fase 6 do plano):
 * - aceita se receber pelo menos a mesma quantidade que entrega; ou
 * - aceita se receber algum recurso que está com 0 no inventário;
 * - nunca aceita se ficar com saldo negativo.
 */
export function shouldBotAcceptTrade(
  bot: Player,
  offeredToBot: Partial<ResourceInventory>,
  requestedFromBot: Partial<ResourceInventory>,
): boolean {
  const received = totalResourceCount(offeredToBot);
  const given = totalResourceCount(requestedFromBot);

  if (received === 0 || given === 0) {
    return false;
  }

  if (!bot.canAfford(requestedFromBot)) {
    return false;
  }

  if (received >= given) {
    return true;
  }

  return (Object.keys(offeredToBot) as ResourceType[]).some(
    (resourceType) =>
      (offeredToBot[resourceType] ?? 0) > 0 &&
      bot.resources[resourceType] === 0,
  );
}
