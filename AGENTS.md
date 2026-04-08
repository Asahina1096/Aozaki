<!-- From: /home/mihari/Aozaki/AGENTS.md -->
# AGENTS.md

Guidance for coding agents operating in `/home/mihari/Aozaki`.

## 1) Project Overview

**Aozaki** is a modern frontend theme for [Komari Monitor](https://github.com/Asahina1096/Komari), a server monitoring and management platform. This is a static frontend application that communicates with a Komari backend via JSON-RPC 2.0 over WebSocket and HTTP.

### Purpose
- Display real-time server/node status (CPU, memory, disk, network)
- Provide a beautiful, customizable dashboard for monitoring infrastructure
- Support theme customization via Komari's theme management system

### Technology Stack
- **Framework**: Astro 6 (static site generation)
- **UI Library**: React 19 (interactive components)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 4 with CSS variables for theming
- **UI Components**: Radix UI + shadcn/ui patterns
- **Charts**: Recharts
- **Build Tool**: Vite (via Astro)
- **Package Manager**: Bun (`bun@1.3.11`)
- **Formatter**: oxfmt

### Runtime Architecture
```
┌─────────────────┐     WebSocket/HTTP      ┌─────────────────┐
│   Aozaki Theme  │ ◄──────────────────────► │  Komari Backend │
│  (Static Build) │       JSON-RPC 2.0       │   (API Server)  │
└─────────────────┘                          └─────────────────┘
```

The application:
1. Builds as static files (`dist/`)
2. Runs client-side as a SPA within Astro
3. Connects to Komari backend via `/api/rpc2` endpoint
4. Polls live data every 2 seconds
5. Supports real-time updates via WebSocket with HTTP fallback

## 2) Project Structure

```
.
├── src/
│   ├── pages/              # Astro entry pages (SSG)
│   │   └── index.astro     # Main page shell
│   ├── components/         # React UI components
│   │   ├── AppProviders.tsx      # Provider composition root
│   │   ├── AppRouter.tsx         # React Router setup
│   │   ├── ServerList.tsx        # Main server grid with virtualization
│   │   ├── ServerCard.tsx        # Individual server card
│   │   ├── ServerOverview.tsx    # Summary statistics
│   │   ├── InstanceDetail.tsx    # Detailed node view with charts
│   │   ├── instance/             # Chart components
│   │   │   ├── LoadChart.tsx
│   │   │   └── PingChart.tsx
│   │   └── ui/                   # shadcn/ui components
│   │       ├── card.tsx
│   │       ├── chart.tsx
│   │       ├── progress.tsx
│   │       └── ...
│   ├── contexts/           # React state management
│   │   ├── RPC2Context.tsx       # JSON-RPC client & connection state
│   │   ├── PublicInfoContext.tsx # Site configuration & theme settings
│   │   ├── NodeListContext.tsx   # Server/node list data
│   │   └── LiveDataContext.tsx   # Real-time metrics polling
│   ├── lib/                # Utilities & business logic
│   │   ├── rpc2.ts               # JSON-RPC 2.0 client implementation
│   │   ├── constants.ts          # UI styling constants
│   │   ├── utils.ts              # Formatting utilities
│   │   ├── format/               # Byte/speed formatting
│   │   ├── normalizers/          # Data transformation
│   │   └── types/                # Type definitions
│   ├── types/              # Core TypeScript types
│   │   ├── LiveData.ts           # Real-time data structures
│   │   └── rpc2.ts               # JSON-RPC type definitions
│   ├── i18n/               # Internationalization
│   │   ├── config.ts             # i18next configuration
│   │   └── locales/              # Translation files
│   │       ├── en.json
│   │       ├── zh_CN.json
│   │       ├── zh_TW.json
│   │       ├── ja_JP.json
│   │       └── id_ID.json
│   ├── layouts/            # Astro layouts
│   │   └── BaseLayout.astro      # Root HTML shell with theme script
│   └── styles/             # Global styles
│       └── globals.css           # Tailwind + custom CSS variables
├── public/                 # Static assets
├── scripts/
│   └── package.sh          # Theme packaging script
├── dist/                   # Build output (gitignored)
├── komari-theme.json       # Theme metadata for Komari
├── preview.png             # Theme preview image
├── astro.config.mjs        # Astro configuration
├── tsconfig.json           # TypeScript configuration
├── components.json         # shadcn/ui configuration
└── .oxfmtrc.json           # Formatter configuration
```

## 3) Setup and Environment

### Prerequisites
- Bun 1.3.11+ (`https://bun.sh`)
- A running Komari backend (for development)

### Initial Setup
```bash
# Install dependencies
bun install

# Configure environment
cp .env.example .env
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_API_URL` | Yes | Full Komari backend URL (e.g., `https://komari.example.com`) |
| `VITE_API_TARGET` | No | Development proxy target (default: `http://127.0.0.1:25774`) |

**Important**: 
- Do NOT add trailing slash to `PUBLIC_API_URL`
- The app will fail to start without `PUBLIC_API_URL`

## 4) Build, Development and Quality Commands

### Development
```bash
bun run dev          # Start dev server (http://localhost:4321)
```

### Build and Package
```bash
bun run build        # Build static assets to dist/
bun run preview      # Preview production build locally
bun run package      # Build and create theme zip package
```

The `package` script:
1. Runs `bun run build`
2. Verifies required files exist
3. Creates `aozaki-vYY.MM.DD-<commit>.zip` in repo root
4. Zip contains: `dist/`, `preview.png`, `komari-theme.json`

### Quality Checks
```bash
bun run format          # Format all files with oxfmt
bun run format:check    # Check formatting without changes
bun run check           # Clean artifacts + type check with astro check
bun run check:all       # Run check + format:check
```

### Cleanup
```bash
bun run clean           # Remove build artifacts
bun run clean:all       # Remove build artifacts + node_modules
```

### Quality Gate
Always run before committing:
```bash
bun run check:all
```

## 5) Code Style and Conventions

### Formatting (enforced by `.editorconfig` and `oxfmt`)
- UTF-8 encoding
- LF line endings
- 2-space indentation
- Final newline required
- Trim trailing whitespace (except Markdown)
- Line width: 80 characters

### TypeScript Conventions
- **Strict mode enabled** - no `any` without justification
- Use `unknown` + type guards for boundary data
- Prefer `interface` over `type` for object shapes
- Use `as const` for literal constants
- Backend API field names preserved (snake_case valid at boundaries)

### Import Style
```typescript
// Use @/ alias for src/ imports
import { cn } from "@/lib/utils";
import { useRPC2 } from "@/contexts/RPC2Context";

// Use relative imports only for nearby modules
import type { LiveData } from "../types/LiveData";

// Type-only imports
import type { ClassValue } from "clsx";
```

### Naming Conventions
| Category | Convention | Example |
|----------|------------|---------|
| Components/Interfaces/Types | PascalCase | `ServerCard`, `LiveData` |
| Variables/Functions/Hooks | camelCase | `useLiveData`, `formatBytes` |
| Constants | UPPER_SNAKE_CASE | `PILL_STYLES`, `DEFAULT_REFRESH_INTERVAL` |
| RPC Methods | snake_case | `common:getNodesLatestStatus` |

### React Patterns
- Keep page shell in `.astro` files
- Keep interactive logic in React components
- Use `useMemo`/`useCallback` for stable identities
- Clean up timers/listeners in `useEffect` cleanup
- Use stable IDs (not index) for list keys
- Prefer composition over prop drilling

### Context Pattern
Contexts are composed in `AppProviders.tsx`:
```typescript
<PublicInfoProvider>   // Site config, theme settings
  <RPC2Provider>       // JSON-RPC connection
    <NodeListProvider> // Server list data
      <LiveDataProvider> // Real-time metrics
        <AppRouter />
      </LiveDataProvider>
    </NodeListProvider>
  </RPC2Provider>
</PublicInfoProvider>
```

### Data Flow
1. **PublicInfoContext**: Fetches `/api/public` for site config
2. **RPC2Context**: Manages WebSocket connection, provides `call` method
3. **NodeListContext**: Fetches server list via `common:getNodes`
4. **LiveDataContext**: Polls `common:getNodesLatestStatus` every 2s

## 6) API and Data Types

### JSON-RPC 2.0 Endpoints
The client communicates via `/api/rpc2`:

| Method | Purpose |
|--------|---------|
| `common:getNodes` | Get all registered servers/nodes |
| `common:getNodesLatestStatus` | Get current metrics for all nodes |
| `common:getNodeStatusHistory` | Get historical metrics (for charts) |
| `common:getNodePingHistory` | Get ping history |

### Core Data Types

**LiveData** (`src/types/LiveData.ts`):
```typescript
export type Record = {
  cpu: { usage: number };
  ram: { used: number };
  swap: { used: number };
  load: { load1: number; load5: number; load15: number };
  disk: { used: number };
  network: { up: number; down: number; totalUp: number; totalDown: number };
  connections: { tcp: number; udp: number };
  gpu?: { count: number; average_usage: number; detailed_info: [...] };
  uptime: number;
  process: number;
  updated_at: string;
};
```

**NodeBasicInfo** (`src/contexts/NodeListContext.tsx`):
```typescript
export type NodeBasicInfo = {
  uuid: string;
  name: string;
  cpu_name: string;
  virtualization: string;
  arch: string;
  cpu_cores: number;
  os: string;
  mem_total: number;
  swap_total: number;
  disk_total: number;
  region: string;
  group: string;
  // ... more fields
};
```

## 7) Theme System

Aozaki supports extensive theme customization via Komari's theme settings:

### Theme Settings (defined in `komari-theme.json`)
| Setting | Type | Description |
|---------|------|-------------|
| `forceThemeMode` | select | Force dark/light mode, hide toggle |
| `backgroundImageEnabled` | switch | Enable custom background |
| `backgroundImageUrlDesktop` | string | Desktop background URL (image or video) |
| `backgroundImageUrlMobile` | string | Mobile background URL |
| `backgroundImageBlurStrategy` | select | `backdrop` or `preblur` |
| `backgroundImageOverlayEnabled` | switch | Enable blur/darken overlay |
| `backgroundImageOverlayBlur` | number | Blur intensity (0-20px) |
| `backgroundImageOverlayDarkness` | number | Darken level (0-100%) |
| `cardEffectStrategy` | select | `backdrop` or `tint` |
| `cardBlurEnabled` | switch | Enable card blur effect |
| `cardBlurIntensity` | number | Card blur intensity (0-20px) |
| `cardOpacityEnabled` | switch | Enable custom card opacity |
| `cardOpacity` | number | Card opacity (0-100%) |

### CSS Variable System
Theme settings are applied via CSS custom properties in `BaseLayout.astro`:
- `--bg-image-url`: Background image
- `--overlay-blur`, `--overlay-darkness`: Background effects
- `--card-blur`, `--card-opacity`: Card styling
- `--readability-overlay-opacity`: Content readability layer

### CSS Classes for Theming
| Class | Purpose |
|-------|---------|
| `.card-blur-target` | Elements receiving blur effects |
| `.card-opacity-target` | Elements with custom opacity |
| `.control-surface-target` | Interactive control surfaces |
| `.chip-surface-target` | Badge/chip elements |

## 8) Testing Status

**Current state**: No automated tests

- No `test` script in `package.json`
- No `*.test.*` or `*.spec.*` files under `src/`

When tests are added, run with:
```bash
bun test path/to/file.test.ts
bunx vitest run path/to/file.test.ts
bunx playwright test path/to/file.spec.ts
```

## 9) Performance Considerations

### Virtualization
- Server list uses `@tanstack/react-virtual` for >48 items
- Intersection Observer for viewport-based blur optimization
- `content-visibility: auto` for off-screen cards

### Data Optimization
- Immutable updates with reference equality checks
- Memoized selectors in contexts
- Request deduplication and sequencing

### Rendering
- `React.memo` for card components
- `useDeferredValue` for search filtering
- CSS containment for isolated repaints

## 10) Security Considerations

1. **API URL**: Always use HTTPS in production
2. **CORS**: Backend must allow the theme's origin
3. **XSS**: All user content rendered via React's XSS protection
4. **Environment**: `PUBLIC_API_URL` is exposed to client (intentional)

## 11) Deployment

### Vercel (configured)
- Build: `bun run build`
- Output: `dist/`
- Framework: Astro

### Manual Deployment
1. Build: `bun run package`
2. Upload resulting zip to Komari's theme management
3. Activate theme in Komari settings

## 12) Key Files Reference

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Build config, proxy settings, cleanup hooks |
| `src/layouts/BaseLayout.astro` | HTML shell, inline theme script |
| `src/lib/rpc2.ts` | JSON-RPC 2.0 client with WebSocket |
| `src/contexts/LiveDataContext.tsx` | Real-time data polling logic |
| `komari-theme.json` | Theme metadata and settings schema |
| `scripts/package.sh` | Theme packaging pipeline |

## 13) Troubleshooting

### Common Issues

**WebSocket connection fails**
- Check `VITE_API_TARGET` in dev environment
- Verify Komari backend is running
- Check browser console for CORS errors

**Theme settings not applying**
- Verify `/api/public` returns correct `theme_settings`
- Check browser devtools for CSS variable values
- Ensure `backgroundImageEnabled` is `true`

**Build fails**
- Run `bun run clean` and retry
- Verify `PUBLIC_API_URL` is set (can be dummy for build)
- Check `bun --version` is 1.3.11+

---

**Last Updated**: 2026-04-09  
**Version**: Aozaki v1.0.0  
**License**: GPL-3.0
