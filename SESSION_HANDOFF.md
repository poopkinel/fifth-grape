# Session Handoff — Fifth Grape

> Handoff doc for the next Claude Code session. Covers work done, current state, known issues, and infra. Read together with `AGENTS.md` (project conventions) and `README.md` (product overview).

Last updated: 2026-04-15 (local dev → VPS migration).

---

## Current deployment

- **Code**: `/home/fifth-grape/frontend/` on Hetzner VPS (`46.225.148.191`, user `fifth-grape`)
- **Metro** runs as systemd service `fifth-grape-metro` on port 8081
- **Cloudflare tunnel** runs as systemd service `fifth-grape-tunnel`
- **Dev URL** (Expo dev client): `https://fifth-app.grapesfarm.com`
- **Backend URL**: `https://fifth-api.grapesfarm.com`
- **SSH**: `ssh fifth-grape` (alias in `~/.ssh/config`), or `ssh root@46.225.148.191`
- **Logs**: `journalctl -u fifth-grape-metro -f` / `-u fifth-grape-tunnel -f`
- **Restart Metro**: `ssh root@46.225.148.191 'systemctl restart fifth-grape-metro'`

Env var notes: `EXPO_PUBLIC_*` vars are inlined at bundle time by Metro. Change `.env` → restart Metro → reload the app. `EXPO_PACKAGER_PROXY_URL=https://fifth-app.grapesfarm.com` is set in the systemd unit so Metro advertises the public URL in its manifests (not `localhost:8081`).

---

## Architecture

### Data source switching
Controlled by `EXPO_PUBLIC_DATA_SOURCE` in `.env`:
- `"demo"` — seeded basket + local catalog
- `"real-local"` — local catalog, no pricing
- `"remote"` — production API

### Remote API contract (current)
- `POST /v1/prices/lookup` `{productIds: string[]}` → `{stores, products, prices, generatedAt}`
- `GET /v1/products/search?q=<query>&limit=50` → `Product[]`

Key types in `src/data/remote/types.ts` (`PriceLookupResponse`, `ProductSearchResponse`) and `src/data/market/types.ts` (`PriceLookup`).

### Data flow
```
Basket items → useMarketData(productIds) → getPriceLookup(productIds)
  → [remote mode] fetchRemotePriceLookup → normalizeMarketData
  → rankStores({basket, stores, prices, userCoords, usualStoreId})
      ↓
  [filterStoresByRadius → compareBasket → decisionScore → ranked sort]
      ↓
  Screen selectors (getHomeScreenModel, getCompareScreenModel, getMapScreenModel, getStoreScreenModel)
      ↓
  UI screens
```

### Key performance decisions
- `compareBasket` builds a `Map<storeId\0productId, Price>` up front → O(prices + stores × basket) instead of O(stores × basket × prices)
- `rankStores` builds `buildLatestUpdatedAtByStore(prices)` in one pass instead of per-store filter+sort
- `filterStoresByRadius` drops stores > 5km when user location available; keeps all when null
- When user has location: null-coord stores are **dropped** (can't rank by distance, user can't navigate there)
- Compare screen caps at `MAX_COMPARE_CARDS = 20`
- Map screen caps at `MAX_MAP_MARKERS = 5` (reduces overlap given coarse backend geocoding)

### Theme (dark mode)
- Tokens in `src/theme/colors.ts` (`lightColors`, `darkColors`)
- `useTheme()` reads system color scheme via `useColorScheme()` from `react-native`
- Green accent cards (home header, best store, store stats) stay green in both modes intentionally
- All neutral surfaces (backgrounds, cards, text, borders) flip based on system

### Location (Zustand singleton)
- `src/features/location/useUserLocation.ts` is a Zustand store + hook wrapper
- Uses `Location.getLastKnownPositionAsync()` first (instant cached fix), then `Location.watchPositionAsync()` to subscribe — more reliable on Android emulators than `getCurrentPositionAsync()`
- Single source of truth — all screens see the same location state (was previously per-component, caused bug where only map worked)
- `fetchLocation` is idempotent via `hasFetched` flag

### Basket (Zustand + AsyncStorage)
- `src/features/basket/store.ts` — persisted
- Initial state: `demoBasketItems` in demo mode, `[]` in other modes (prevents broken slug IDs in remote mode)
- `productId` field uses **barcodes** in remote mode (matching API format)

---

## Known issues / current limitations

### Backend data quality
- Backend search uses `LIKE '%q%'` — entire query must appear as a contiguous substring. "חלב 3" won't match "חלב תנובה בקרטון 3%". **Backend fix needed**: split query into tokens with AND matching.
- Store geocoding: ~99% done (geocodeStatus: "ok" with real lat/lng), ~1% null. Many stores of the same chain cluster at the same coordinate (coarse geocoding).
- Product data: many products have null brand/unit/emoji. Raw names from government data are messy ("חלב 3% תנובה (2 ליטר)פיקו"). **Backend is working on normalization**.

### Client limitations
- `react-native-maps` doesn't support web — the map screen crashes on web bundle (safe to ignore unless deploying to web)
- Map marker overlap when multiple stores geocode to the same point (backend issue, not client)

### UI open items discussed but not implemented
- Client-side parsing to extract size info from raw product names
- Showing barcode as subtitle on search results (for identification when brand/unit are null)
- Marker clustering library for map overlap
- Manual dark mode toggle (currently system-only; discussed but chosen against)

---

## Local dev workflow (post-VPS migration)

- **VS Code Remote-SSH** → connect to host `fifth-grape` → open `/home/fifth-grape/frontend`
- Metro is already running as systemd; file changes trigger hot reload automatically
- No need to run `npx expo start` manually — it runs 24/7 via systemd
- If Metro gets weird: `sudo systemctl restart fifth-grape-metro`
- `.env` changes require Metro restart (env vars inlined at bundle time)

Phone setup: Open the pre-installed dev build, enter URL `https://fifth-app.grapesfarm.com`, connect. Hot reload works through the tunnel.

---

## Notable files

| Path | Purpose |
|---|---|
| `src/theme/` | Light/dark color tokens + `useTheme()` |
| `src/features/location/useUserLocation.ts` | Singleton location store (Zustand) |
| `src/features/basket/store.ts` | Persisted basket (Zustand + AsyncStorage) |
| `src/data/config/dataSource.ts` | Reads `EXPO_PUBLIC_DATA_SOURCE` |
| `src/data/market/useMarketData.ts` | React Query hook, keyed by sorted productIds |
| `src/data/market/marketRepository.ts` | `getPriceLookup()` — branches on DATA_SOURCE |
| `src/data/remote/apiClient.ts` | `apiGet` / `apiPost` with 15s timeout + ApiError |
| `src/data/remote/marketApi.ts` | `fetchRemotePriceLookup`, `fetchRemoteProductSearch` |
| `src/data/remote/normalizeMarketData.ts` | Fills null emoji/category from API |
| `src/data/remote/useProductSearch.ts` | React Query hook for debounced search (≥2 chars) |
| `src/domain/recommendation/rankStores.ts` | Radius filter + ranking |
| `src/domain/recommendation/compareBasket.ts` | Map-indexed price lookup |
| `src/features/*/selectors.ts` | Presentation selectors per screen |

---

## When continuing work

1. Read `AGENTS.md` for project conventions (selector/domain separation, minimal refactors, preserve Hebrew copy)
2. `EXPO_PUBLIC_*` changes need Metro restart; other JS changes hot-reload
3. If backend API contract changes, update both `src/data/remote/types.ts` and the API client functions
4. Don't reintroduce per-component location state — it was a real bug
5. Keep the location filter's null-coord behavior (drop when userCoords set, keep when null)
