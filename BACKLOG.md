# Backlog — Fifth Grape

Future tickets surfaced during real-user testing. Not scoped/scheduled yet.

## Open

### Barcode scanner for item search
Tap a barcode-scan button in the basket editor to open the camera and scan a product's EAN/UPC. On hit, look up the product (`/v1/products/search?q=<barcode>` already supports exact-barcode hits) and add it to the basket. Faster than typing names, especially for English-speaking testers unfamiliar with Hebrew product names. `expo-barcode-scanner` or `expo-camera` (newer) is the path.

### Cluster overlapping store markers on the recommendation map
When two candidate stores share the same lat/lng (common for branches at the same address — see "Data-source follow-ups → Tighten same-address store dedup" below), the recommendation card map renders only one pin, hiding the other. Choosing between them in the comparison cards is then disconnected from the map. Two paths: (a) detect overlap (distance below ~25 m) and offset/cluster pins with a small badge showing the count; (b) tint pins to match the chain stripe color on each comparison card so the user can at least see which is which when they're stacked. Affects whichever component renders the map pins on the recommendation screen.



## Paused — pick up here

### Analytics (roll-your-own to backend)
**Status:** backend code merged but not yet deployed; frontend not started.

**Already done:**
- `app/db.py` — `events` table + `insert_events`/`prune_events_older_than` helpers.
- `app/models.py` — `EventBatch`, `EventIn`, `EventBatchResponse`.
- `app/main.py` — `POST /v1/events` with bearer-token auth + per-event 4 KB cap + ≤100 events/batch.
- `.env` — `EVENTS_TOKEN` set (generated; rotatable). File chmod 600.
- `scripts/prune_events.py` — retention pruner (env: `EVENTS_RETENTION_DAYS`, default 90).
- `deploy/fifth-grape-prune-events.{service,timer}` — daily systemd timer.

**Resume here:**
1. `sudo systemctl restart fifth-grape-api` on VPS (init_db will create the events table).
2. Smoke-test: curl `/v1/events` with bearer; expect `{"ingested":1}`. `sqlite3 data/fifth_grape.db "SELECT * FROM events;"` to verify the row.
3. Optional: install + enable `fifth-grape-prune-events.timer`.
4. Frontend (not started):
   - `src/lib/analytics.ts` — anonymous `distinct_id` in AsyncStorage, batched POST queue, respects opt-out.
   - Add `analyticsOptedOut: boolean` to preferences store + opt-out toggle.
   - One-line privacy notice on onboarding screen.
   - Instrument: `dilemma_shown`, `dilemma_picked`, `dilemma_skipped`, `dilemma_refined`, `recommendation_top`, `store_details_opened`, `basket_item_added/removed`, `usual_store_set/cleared`. Aggregate basket data only (count + total NIS, no product names).
   - `EXPO_PUBLIC_EVENTS_TOKEN` to `frontend/.env` (same value as backend `EVENTS_TOKEN`).

### Product name translations (Hebrew → English)
The DB stores product names only in Hebrew, so even with English UI an English-speaking tester still sees `חלב תנובה 3% 1 ליטר`. Three paths, recommended stack:
1. **Open Food Facts `product_name_en`** — already querying OFF for images; grab the English name same time, persist as a new `name_en` column. Free, partial coverage (international brands mostly).
2. **Curated top-200 list** — hand-translate the most common products. High quality on the long tail of common shopping; ~0 cost.
3. **LLM batch translation** — pre-translate ~85k names via Claude Haiku / 4o-mini, cache as `name_en`. ~$5–15 one-shot, plus deltas on new scrapes. Quality dicey on brand names.

**Open design question:** transliterate brand names ("תנובה" → "Tnuva") or keep them in Hebrew even in the English UI? Newcomers seeing physical packaging want Latin brand names; auto-transliteration is fragile, so this usually means a manual brands map for top chains.

### Image proxy through backend (privacy)
Product images currently load directly from Open Food Facts CDN URLs. That leaks each tester's product views to OFF servers via Referer + access logs. For production, proxy through `fifth-api` (download once on backend, serve from `/v1/products/{id}/image` with caching). For testing it's acceptable.

## Earlier deferrals (from chat)

- **Sales / promotions data** — surface chain promotions in pricing & recommendations. Future, not scoped.
- **Investigate "גבינה צהובה דלת לקטוז"** — verify whether lactose-free yellow cheese is actually missing from the data (deduplication / canonical grouping question). Backend.
- **Data-source follow-ups (formerly: "investigate gov.il CPFTA")** — Confirmed: our current scraper (`il-supermarket-scraper` in `backend/app/scraper/runner.py`) already pulls the gov.il-mandated chain XML feeds. The CPFTA page (https://www.gov.il/he/pages/cpfta_prices_regulations) is the *regulation*, not a separate data source — there's nothing to swap to. Source-side data-quality issues (for a possible CPFTA complaint) are tracked in `backend/data_source_issues.md`. The actual gaps worth chasing are:
  - ~~**Ingest `PromoFull` feeds**~~ — DONE 2026-04-26. `promotions` + `promotion_items` tables in `app/db.py`; `_load_promotions` in `app/scraper/runner.py`; `PROMO_FULL_FILE` in `SCRAPE_FILE_TYPES`. Next scrape populates. **Still TODO**: API endpoint + frontend surfacing (see "Sales / promotions data" above — now unblocked).
  - ~~**Scheduled scrape**~~ — DONE 2026-04-26 at the file level; `deploy/fifth-grape-scrape.{service,timer}` is on disk and `systemd-analyze verify` clean. **Still TODO**: `sudo cp` + `enable --now` on the VPS (commands in `backend/README.md`).
  - **Tighten same-address store dedup** — STILL OPEN. Address `יהודה מכבי 81, ת"א` has 8 chains all claiming `store_id = 305` at identical lat/lng; Places verification passes 2 of them (Shufersal + TivTaam), but Google search suggests the TivTaam name is wrong. Worth checking whether `store_id = 305` is a placeholder/default that some chains' feeds use, and whether the Places verification heuristic should require the *chain name* to match the Places business name (not just "any business at this address"). Backend: `verify_stores.py` (clustering at lines 180–420), `app/main.py:_display_chain_name` (lines 51–59).
  - **Expand chain coverage** (new) — `app/scraper/chains.py` registers 9 chains; the library exposes 35+ via `ScraperFactory`. Audit which of the unregistered chains are worth enabling (criteria: actually serving consumers, not flagged unstable in `il-supermarket-scraper`'s stability tracker, supplies feeds in our region). Likely candidates: Cofix, Dor Alon, Good Pharm, Fresh Market & Super Dosh, Yellow, Stop Market, Keshet, Zol VeBegadol. Skip: Quik (flaky), Wolt (delivery service, not a chain).
  - **Fix `nan` parser bug** (new, our-side) — `app/scraper/runner.py:222` writes `'nan'` into `products.name` for items whose source `<ItemName>` is empty (1,126 rows in DB). One-line fix: pass `itemname` through `_nullable()` like brand/unit do. Backfill: re-run `enrich_off.py` for the affected barcodes.
