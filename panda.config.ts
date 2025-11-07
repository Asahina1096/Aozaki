import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations - include .astro files
  include: [
    "./src/**/*.{js,jsx,ts,tsx,astro}",
    "./pages/**/*.{js,jsx,ts,tsx,astro}",
  ],

  // Files to exclude
  exclude: [],

  // JSX framework
  jsxFramework: "react",

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        sizes: {
          screen: { value: "100vh" },
        },
      },
      semanticTokens: {
        colors: {
          border: { value: "hsl(var(--border))" },
          input: { value: "hsl(var(--input))" },
          ring: { value: "hsl(var(--ring))" },
          background: { value: "hsl(var(--background))" },
          foreground: { value: "hsl(var(--foreground))" },
          primary: {
            DEFAULT: { value: "hsl(var(--primary))" },
            foreground: { value: "hsl(var(--primary-foreground))" },
          },
          secondary: {
            DEFAULT: { value: "hsl(var(--secondary))" },
            foreground: { value: "hsl(var(--secondary-foreground))" },
          },
          destructive: {
            DEFAULT: { value: "hsl(var(--destructive))" },
            foreground: { value: "hsl(var(--destructive-foreground))" },
          },
          muted: {
            DEFAULT: { value: "hsl(var(--muted))" },
            foreground: { value: "hsl(var(--muted-foreground))" },
          },
          accent: {
            DEFAULT: { value: "hsl(var(--accent))" },
            foreground: { value: "hsl(var(--accent-foreground))" },
          },
          popover: {
            DEFAULT: { value: "hsl(var(--popover))" },
            foreground: { value: "hsl(var(--popover-foreground))" },
          },
          card: {
            DEFAULT: { value: "hsl(var(--card))" },
            foreground: { value: "hsl(var(--card-foreground))" },
          },
        },
        radii: {
          lg: { value: "var(--radius)" },
          md: { value: "calc(var(--radius) - 2px)" },
          sm: { value: "calc(var(--radius) - 4px)" },
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 8px 2px currentColor",
          },
          "50%": {
            opacity: "0.6",
            boxShadow: "0 0 12px 4px currentColor",
          },
        },
      },
    },
  },

  // Global CSS
  globalCss: {
    "*": {
      borderColor: "border",
    },
    body: {
      bg: "background",
      color: "foreground",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      textSizeAdjust: "100%",
    },
    "img, video, iframe": {
      maxWidth: "100%",
      height: "auto",
    },
    svg: {
      display: "block",
      maxWidth: "100%",
      height: "auto",
    },
  },

  // Utilities
  utilities: {
    extend: {
      animatePulseGlow: {
        className: "animate-pulse-glow",
        values: { type: "boolean" },
        transform(value: boolean) {
          if (!value) return {};
          return {
            animation: "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          };
        },
      },
      gridTemplateColumns: {
        shorthand: "gridCols",
        className: "grid-tc",
        values: { type: "string" },
        transform(value: string) {
          // Handle numeric values as repeat(n, minmax(0, 1fr))
          if (/^\d+$/.test(value)) {
            return {
              gridTemplateColumns: `repeat(${value}, minmax(0, 1fr))`,
            };
          }
          return { gridTemplateColumns: value };
        },
      },
    },
  },

  // The output directory for your css system
  outdir: "styled-system",

  // Hash generated class names for production
  hash: false,

  // Generate static CSS
  staticCss: {
    css: [
      {
        properties: {
          display: ["flex", "block", "inline-flex", "grid", "none"],
          flexDirection: ["row", "column"],
          alignItems: ["center", "flex-start", "flex-end", "stretch"],
          justifyContent: ["center", "space-between", "flex-start", "flex-end"],
          gap: ["1", "2", "3", "4", "6", "8"],
          padding: ["0", "1", "2", "4", "6", "8"],
          margin: ["0", "1", "2", "4", "6", "8", "auto"],
          fontSize: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"],
          fontWeight: ["normal", "medium", "semibold", "bold"],
          color: ["primary", "foreground", "muted.foreground", "accent.foreground", "destructive"],
          backgroundColor: ["primary", "background", "accent", "muted", "card", "secondary"],
          borderRadius: ["sm", "md", "lg", "full"],
          borderWidth: ["1px"],
          borderColor: ["border"],
        },
      },
    ],
  },
});
