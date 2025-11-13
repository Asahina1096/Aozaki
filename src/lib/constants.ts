/**
 * Shared style constants for consistent UI across components
 */

export const PILL_STYLES = {
  info: "inline-flex items-center gap-0.5 rounded-full border border-border/40 bg-muted/60 px-1 py-0.5 whitespace-nowrap text-[0.65rem]",
  status:
    "inline-flex items-center gap-0.5 rounded-full border border-border/40 bg-muted/60 px-1 py-0.5 whitespace-nowrap text-[0.65rem]",
  network:
    "inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/60 px-1.5 py-0.5 whitespace-nowrap",
} as const;

export const GRID_STYLES = {
  template: "grid grid-cols-[minmax(220px,_2fr)_repeat(4,_minmax(140px,_1fr))]",
} as const;
