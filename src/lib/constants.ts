/**
 * Shared style constants for consistent UI across components
 */

export const PILL_STYLES = {
  info: "inline-flex items-center gap-0.5 rounded-full border border-border/15 bg-muted/70 backdrop-blur-sm px-1 py-0.5 whitespace-nowrap text-[0.65rem] transition-colors duration-150",
  status:
    "inline-flex items-center gap-0.5 rounded-full border border-border/15 bg-muted/70 backdrop-blur-sm px-1 py-0.5 whitespace-nowrap text-[0.65rem] transition-colors duration-150",
  network:
    "inline-flex items-center gap-1 rounded-full border border-border/15 bg-muted/70 backdrop-blur-sm px-1.5 py-0.5 whitespace-nowrap transition-colors duration-150",
} as const;

export const GRID_STYLES = {
  template: "grid grid-cols-[minmax(220px,_2fr)_repeat(4,_minmax(140px,_1fr))]",
} as const;
