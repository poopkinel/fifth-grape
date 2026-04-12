import { StoreProductPrice } from "@/src/domain/pricing/types";
import { BasketItem } from "@/src/features/basket/types";
import { Store } from "@/src/features/stores/types";
import { getDistanceKm } from "@/src/utils/distance";

import { calculateDecisionScore } from "./calculateDecisionScore";
import { compareBasket } from "./compareBasket";
import {
  RankedStore,
  RecommendationReasonCode,
  RecommendationResult,
} from "./types";

const SEARCH_RADIUS_KM = 5;

type Input = {
  basket: BasketItem[];
  stores: Store[];
  prices: StoreProductPrice[];
  userCoords: { latitude: number; longitude: number } | null;
  usualStoreId?: string | null;
};

function buildLatestUpdatedAtByStore(
  prices: StoreProductPrice[],
): Map<string, string> {
  const latest = new Map<string, string>();
  for (const price of prices) {
    if (!price.updatedAt) continue;
    const current = latest.get(price.storeId);
    if (!current || price.updatedAt > current) {
      latest.set(price.storeId, price.updatedAt);
    }
  }
  return latest;
}

function getReasonCode(rank: number, missingCount: number): RecommendationReasonCode {
  if (rank === 0) return "best_overall";
  return missingCount === 0 ? "full_basket" : "missing_items";
}

function filterStoresByRadius(
  stores: Store[],
  userCoords: { latitude: number; longitude: number } | null,
): Store[] {
  if (!userCoords) return stores;

  return stores.filter((store) => {
    if (store.lat == null || store.lng == null) return false;
    const distance = getDistanceKm(
      userCoords.latitude,
      userCoords.longitude,
      store.lat,
      store.lng,
    );
    return distance <= SEARCH_RADIUS_KM;
  });
}

export function rankStores({
  basket,
  stores,
  prices,
  userCoords,
  usualStoreId,
}: Input): RecommendationResult {
  const nearbyStores = filterStoresByRadius(stores, userCoords);
  const baseResults = compareBasket({ basket, stores: nearbyStores, prices });
  const latestUpdatedAtByStore = buildLatestUpdatedAtByStore(prices);

  const enriched = baseResults.map((result) => {
    const distanceKm =
      userCoords && result.store.lat != null && result.store.lng != null
        ? getDistanceKm(
            userCoords.latitude,
            userCoords.longitude,
            result.store.lat,
            result.store.lng,
          )
        : null;

    const decisionScore = calculateDecisionScore({
      total: result.total,
      missingCount: result.missingCount,
      distanceKm,
    });

    return {
      ...result,
      distanceKm,
      decisionScore,
      isFullBasket: result.missingCount === 0,
      updatedAt: latestUpdatedAtByStore.get(result.store.storeId) ?? "",
    };
  });

  const sorted = [...enriched].sort(
    (a, b) => a.decisionScore - b.decisionScore
  );
  const usualStore = usualStoreId
    ? sorted.find((store) => store.store.storeId === usualStoreId)
    : null;

  const ranked: RankedStore[] = sorted.map((store, index) => {
    const next = index < sorted.length - 1 ? sorted[index + 1] : null;
    const savingsVsUsualStore = usualStore
      ? Number((usualStore.total - store.total).toFixed(2))
      : null;

    return {
      ...store,
      rank: index,
      reasonCode: getReasonCode(index, store.missingCount),
      savingsVsNext: next ? Number((next.total - store.total).toFixed(2)) : null,
      savingsVsUsualStore,
    };
  });

  return {
    rankedStores: ranked,
    bestStoreId: ranked[0]?.store.storeId,
  };
}
