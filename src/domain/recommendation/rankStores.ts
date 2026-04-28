import { StoreProductPrice } from "@/src/domain/pricing/types";
import { BasketItem } from "@/src/features/basket/types";
import {
  bucketValue,
  getModeGranularity,
} from "@/src/features/preferences/granularity";
import {
  ScoreWeights,
  TransportMode,
} from "@/src/features/preferences/types";
import { getDefaultWeights } from "@/src/features/preferences/weights";
import { Store } from "@/src/features/stores/types";
import { getDistanceKm } from "@/src/utils/distance";

import { calculateDecisionScore } from "./calculateDecisionScore";
import { compareBasket } from "./compareBasket";
import {
  RankedStore,
  RecommendationReasonCode,
  RecommendationResult,
} from "./types";

const FOOT_RADIUS_TIERS_KM = [1, 1.5, 3, 10];
const CAR_RADIUS_TIERS_KM = [5, 10, 25, 50];

type Input = {
  basket: BasketItem[];
  stores: Store[];
  prices: StoreProductPrice[];
  userCoords: { latitude: number; longitude: number } | null;
  usualStoreId?: string | null;
  transportMode?: TransportMode;
  weights?: ScoreWeights;
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
  radiusKm: number,
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
    return distance <= radiusKm;
  });
}

export function rankStores({
  basket,
  stores,
  prices,
  userCoords,
  usualStoreId,
  transportMode = "car",
  weights,
}: Input): RecommendationResult {
  const granularity = getModeGranularity(transportMode);
  const effectiveWeights = weights ?? getDefaultWeights(transportMode);
  const radiusTiers =
    transportMode === "foot" ? FOOT_RADIUS_TIERS_KM : CAR_RADIUS_TIERS_KM;

  let radiusKm = radiusTiers[radiusTiers.length - 1];
  let baseResults: ReturnType<typeof compareBasket> = [];

  for (const tier of radiusTiers) {
    const nearbyStores = filterStoresByRadius(stores, userCoords, tier);
    const tierResults = compareBasket({ basket, stores: nearbyStores, prices });
    if (tierResults.length > 0) {
      radiusKm = tier;
      baseResults = tierResults;
      break;
    }
  }
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

    const bucketedDistanceKm =
      distanceKm != null
        ? bucketValue(distanceKm, granularity.distanceBucketKm)
        : null;
    const bucketedTotal = bucketValue(result.total, granularity.priceBucketNis);

    const decisionScore = calculateDecisionScore({
      total: bucketedTotal,
      missingCount: result.missingCount,
      distanceKm: bucketedDistanceKm,
      weights: effectiveWeights,
    });

    return {
      ...result,
      distanceKm,
      decisionScore,
      isFullBasket: result.missingCount === 0,
      updatedAt: latestUpdatedAtByStore.get(result.store.storeId) ?? "",
    };
  });

  const sorted = [...enriched].sort((a, b) => {
    if (a.decisionScore !== b.decisionScore) {
      return a.decisionScore - b.decisionScore;
    }
    const aDist = a.distanceKm ?? Infinity;
    const bDist = b.distanceKm ?? Infinity;
    if (aDist !== bDist) return aDist - bDist;
    if (a.total !== b.total) return a.total - b.total;
    return a.missingCount - b.missingCount;
  });
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
    radiusKm,
  };
}
