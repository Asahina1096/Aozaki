export function toFiniteNumber(value: unknown, fallback: number = 0): number {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export function toStringOr(value: unknown, fallback: string = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function toOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function toBooleanOr(value: unknown, fallback: boolean = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}
