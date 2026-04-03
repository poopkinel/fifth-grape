import { StoreProductPrice } from "@/src/domain/pricing/types";
import { BasketItem } from "@/src/features/basket/types";
import { Store } from "@/src/features/stores/types";
import { getDistanceKm } from "@/src/utils/distance";

import { calculateDecisionScore } from "./calculateDecisionScore";
import { compareBasket } from "./compareBasket";
import {
    RankedStore,
    RecommendationResult,
} from "./types";

type Input = {
  basket: BasketItem[];
  stores: Store[];
  prices: StoreProductPrice[];
  userCoords: { latitude: number; longitude: number } | null;
};

export function rankStores({
  basket,
  stores,
  prices,
  userCoords,
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
    };
  });

  const sorted = [...enriched].sort(
    (a, b) => a.decisionScore - b.decisionScore
  );

  const ranked: RankedStore[] = sorted.map((store, index) => {
    const next = index < sorted.length - 1 ? sorted[index + 1] : null;

    return {
      ...store,
      rank: index,
      savingsVsNext: next ? next.total - store.total : null,
    };
  });

  return {
    rankedStores: ranked,
    bestStoreId: ranked[0]?.store.storeId,
  };
}