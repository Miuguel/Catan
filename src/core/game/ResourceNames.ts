export type ResourceType = "brick" | "lumber" | "wool" | "grain" | "ore";

export const RESOURCE_NAMES: Record<ResourceType, string> = {
  brick: "Tijolo",
  lumber: "Madeira",
  wool: "Lã",
  grain: "Trigo",
  ore: "Minério",
};

export const RESOURCE_COLORS: Record<ResourceType, string> = {
  brick: "#b45309",
  lumber: "#15803d",
  wool: "#65a30d",
  grain: "#eab308",
  ore: "#6b7280",
};

export function getResourceName(resourceType: ResourceType | string): string {
  return RESOURCE_NAMES[resourceType as ResourceType] || resourceType;
}

export function getResourceColor(resourceType: ResourceType | string): string {
  return RESOURCE_COLORS[resourceType as ResourceType] || "#4b5563";
}
