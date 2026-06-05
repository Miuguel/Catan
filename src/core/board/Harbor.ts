import type { ResourceType } from "../game/ResourceType";

export type HarborType = "generic" | ResourceType;

export interface Harbor {
  type: HarborType;
  /** 3 para porto genérico (3:1), 2 para porto específico (2:1). */
  rate: number;
  vertexAId: string;
  vertexBId: string;
}

/** Composição oficial: 4 portos genéricos 3:1 + 1 porto 2:1 por recurso. */
export function createHarborTypes(): HarborType[] {
  return [
    "generic",
    "generic",
    "generic",
    "generic",
    "brick",
    "lumber",
    "wool",
    "grain",
    "ore",
  ];
}

export function harborLabel(harbor: Harbor): string {
  return harbor.type === "generic" ? "3:1" : "2:1";
}
