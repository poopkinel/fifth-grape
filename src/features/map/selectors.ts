import { StoreProductPrice } from "@/src/domain/pricing/types";
import { rankStores } from "@/src/domain/recommendation/rankStores";
import { BasketItem } from "@/src/features/basket/types";
import {
  ScoreWeights,
  TransportMode,
} from "@/src/features/preferences/types";
import i18n from "@/src/i18n";
import { getChainColor } from "@/src/features/stores/chainColors";
import { Store } from "@/src/features/stores/types";
import { formatDistanceKm } from "@/src/utils/distance";
import { formatRelativeUpdateTime } from "@/src/utils/format";
import { MapScreenModel, MapStoreMarker } from "./types";

const MAX_MAP_MARKERS = 5;

// Approx 25m at Israel's latitude — small enough that the offset doesn't
// misrepresent the store's location, large enough to make stacked pins
// individually tappable at typical zoom levels. The clusterer still merges
// these at lower zoom (correctly).
const OVERLAP_OFFSET_DEG = 0.00025;

// Two markers count as "stacked" if their lat/lng round to the same 4-decimal
// bucket (~11m). That's tight enough to catch the dual-banner / mall case
// (real distinct stores at the same address) without flagging genuinely-near
// neighbors that the user can already see as separate pins.
function offsetOverlappingMarkers(markers: MapStoreMarker[]): MapStoreMarker[] {
  const groups = new Map<string, MapStoreMarker[]>();
  for (const m of markers) {
    const key = `${m.lat.toFixed(4)},${m.lng.toFixed(4)}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(m);
    else groups.set(key, [m]);
  }

  const out: MapStoreMarker[] = [];
  for (const bucket of groups.values()) {
    if (bucket.length === 1) {
      out.push(bucket[0]);
      continue;
    }
    // Fan the stack into a circle around the original point.
    bucket.forEach((m, i) => {
      const angle = (2 * Math.PI * i) / bucket.length;
      out.push({
        ...m,
        lat: m.lat + OVERLAP_OFFSET_DEG * Math.cos(angle),
        lng: m.lng + OVERLAP_OFFSET_DEG * Math.sin(angle),
      });
    });
  }
  return out;
}

type UserCoords = {
  latitude: number;
  longitude: number;
};

type MapScreenModelInput = {
  basket: BasketItem[];
  userCoords: UserCoords | null;
  usualStoreId?: string;
  stores: Store[];
  prices: StoreProductPrice[];
  transportMode?: TransportMode;
  weights?: ScoreWeights;
};

export function getMapScreenModel({
  basket,
  userCoords,
  usualStoreId,
  stores,
  prices,
  transportMode,
  weights,
}: MapScreenModelInput): MapScreenModel {
  const result = rankStores({
    basket,
    stores,
    prices,
    userCoords,
    usualStoreId,
    transportMode,
    weights,
  });

  const markers = result.rankedStores
    .filter((store) => store.store.lat != null && store.store.lng != null)
    .slice(0, MAX_MAP_MARKERS)
    .map((store) => {
      const isBest = store.rank === 0;

      return {
        storeId: store.store.storeId,
        chainId: store.store.chainId,
        chainName: store.store.chainName,
        branchName: store.store.branchName,
        lat: store.store.lat as number,
        lng: store.store.lng as number,
        total: store.total,
        missingCount: store.missingCount,
        matchedCount: store.matchedCount,
        distanceKm: store.distanceKm,
        distanceText:
          store.distanceKm !== null
            ? formatDistanceKm(store.distanceKm)
            : i18n.t("distance.unknown"),
        title: isBest ? i18n.t("map.bestChoice") : i18n.t("map.quickCompare"),
        trustText:
          store.missingCount === 0
            ? formatRelativeUpdateTime(store.updatedAt)
            : i18n.t("store.foundCount", {
                matched: store.matchedCount,
                total: basket.length,
              }),
        badge: isBest
          ? "BEST"
          : store.missingCount === 0
            ? "FULL"
            : "MISSING",
        color: getChainColor(store.store.chainId),
        isBest,
      };
    });

  return {
    markers: offsetOverlappingMarkers(markers),
    bestStoreId: result.bestStoreId,
  };
}