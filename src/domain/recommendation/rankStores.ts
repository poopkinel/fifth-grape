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

type Input = {
  basket: BasketItem[];
  stores: Store[];
  prices: StoreProductPrice[];
  userCoords: { latitude: number; longitude: number } | null;
  usualStoreId?: string | null;
};

function getStoreUpdatedAt(
  prices: StoreProductPrice[],
  storeId: string
): string {
  return (
    prices
      .filter((price) => price.storeId === storeId && price.updatedAt)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]?.updatedAt ?? ""
  );
}

function getReasonCode(rank: number, missingCount: number): RecommendationReasonCode {
  if (rank === 0) return "best_overall";
  return missingCount === 0 ? "full_basket" : "missing_items";
}

export function rankStores({
  basket,
  stores,
  prices,
  userCoords,
  usualStoreId,
}: Input): RecommendationResult {
  const baseResults = compareBasket({ basket, stores, prices });

  const enriched = baseResults.map((result) => {
    const distanceKm = userCoords
      ? getDistanceKm(
          userCoords.latitude,
          userCoords.longitude,
          result.store.lat,
          result.store.lng
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
      updatedAt: getStoreUpdatedAt(prices, result.store.storeId),
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
