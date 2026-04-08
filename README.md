# Fifth Grape

A Hebrew-language grocery price comparison app for Israeli shoppers. Fifth Grape helps you find the cheapest supermarket branch for your shopping basket, with location-aware recommendations and an interactive map view.

---

## What It Does

- **Basket management** — Build a shopping list and track quantities.
- **Multi-store price comparison** — Compare your basket total across nearby supermarket branches.
- **Location-based ranking** — Stores are scored by price, item availability, and walking/driving distance (within a 5 km radius).
- **Map view** — See all nearby stores on a Google Map with your basket price overlaid on each pin.
- **Usual store** — Mark a preferred store; the app surfaces it in recommendations and adjusts messaging accordingly.
- **RTL-first UI** — Built for Hebrew (right-to-left layout throughout).

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Expo 54 + React Native 0.81 |
| Language | TypeScript 5.9 |
| Routing | Expo Router 6 (file-based) |
| Client state | Zustand 5 + AsyncStorage |
| Server state | TanStack React Query 5 |
| Maps & location | React Native Maps (Google Maps) + Expo Location |
| UI | React Native built-ins + Lucide icons |
| Animations | React Native Reanimated + Gesture Handler |

---

## Project Structure

```
app/                    # Expo Router screens
  (tabs)/               # Bottom tab navigation (Home, Map)
  list/                 # Basket editor and comparison screens
  store/                # Store detail screen
  map/                  # Map-based comparison screen
src/
  features/             # Self-contained feature modules
    basket/             # Basket Zustand store and hooks
    compare/            # Side-by-side store comparison selectors
    location/           # useUserLocation hook
    map/                # Map screen models and selectors
    stores/             # Store detail screen models and selectors
    pricing/            # Price formatting and calculation utilities
    preferences/        # Usual-store preference store
  data/
    market/             # useMarketData hook (React Query)
    stores/             # storeRepository
    products/           # productRepository
    prices/             # priceRepository
    config/             # dataSource.ts — toggle demo vs. real data
  domain/
    recommendation/     # rankStores, calculateDecisionScore — core business logic
  components/           # Shared UI components
  utils/                # Distance calculation, currency formatting
  constants/            # Demo data
  lib/                  # Real store constants and config values
assets/                 # Images, icons, splash screen
```

---

## Architecture

### Data Flow

```
Data Source (demo | real-local)
        ↓
  Repositories (stores, products, prices)
        ↓
  useMarketData() — React Query, 5-min stale time
        ↓
  Domain: rankStores()
    ├─ compareBasket()          — per-store totals & missing items
    └─ calculateDecisionScore() — price + availability penalty + distance penalty
        ↓
  Screen selectors (getStoreScreenModel, getMapScreenModel)
        ↓
  UI screens
```

### Recommendation Scoring

Stores are ranked by a composite score:

- **Base**: basket total in NIS
- **Missing item penalty**: +100 per item not found in store
- **Distance penalty**: +2 per km from user's location

Lower score = better recommendation.

### Persistence Strategy

| Data | Storage | Lifetime |
|---|---|---|
| Shopping basket | Zustand + AsyncStorage | Survives restarts |
| Usual store preference | Zustand + AsyncStorage | Survives restarts |
| Market data (prices, stores) | React Query cache | 5 minutes |

---

## Data Sources

The app supports two modes, configured in [src/data/config/dataSource.ts](src/data/config/dataSource.ts):

- **Demo mode** (default) — Uses static hardcoded data from `src/constants/demoData/`. No network required.
- **Real-local mode** — Pulls from `realStores` constants in `src/lib/`.

---

## Getting Started

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

> **Maps**: A Google Maps API key is required for the map screen. Configure it in `app.json` under `android.config.googleMaps.apiKey` and `ios.config.googleMapsApiKey`.

---

## Localization

The app is Hebrew-first with forced RTL layout (`I18nManager.forceRTL(true)`). All UI strings are in Hebrew. Expo Localization is used to detect the system locale.
