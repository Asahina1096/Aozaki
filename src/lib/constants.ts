export const PILL_STYLES = {
  info:
    "chip-surface-target inline-flex items-center gap-0.5 rounded-full border border-border/20 px-1 py-0.5 whitespace-nowrap text-[0.65rem]",
  status:
    "chip-surface-target inline-flex items-center gap-0.5 rounded-full border border-border/20 px-1 py-0.5 whitespace-nowrap text-[0.65rem]",
  network:
    "chip-surface-target inline-flex items-center gap-1 rounded-full border border-border/20 px-1.5 py-0.5 whitespace-nowrap",
  capsule:
    "chip-surface-target inline-flex items-center rounded-full border border-border/20 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground",
} as const;

export const INFO_CARD_CLASS =
  "card-blur-target px-3 py-2";

export const INFO_CARD_COMPACT_CLASS =
  "card-blur-target inline-flex rounded-2xl border border-border/20 px-2.5 py-0.5 text-xs font-semibold tracking-wide shadow-sm";

export const CARD_CONTAINMENT_STYLE = {
  contain: "layout style paint",
} as const;
