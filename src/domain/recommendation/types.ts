import { Store } from "@/src/features/stores/types";

export type RecommendationReasonCode =
  | "best_overall"
  | "full_basket"
  | "missing_items";

export type StoreComparisonBase = {
  store: Store;
  total: number;
  missingCount: number;
  matchedCount: number;
  coverage: number;
  missingProducts: string[];
};

export type StoreComparison = StoreComparisonBase & {
  distanceKm: number | null;
  decisionScore: number;
  isFullBasket: boolean;
  updatedAt: string;
};

export type RankedStore = StoreComparison & {
  rank: number;
  reasonCode: RecommendationReasonCode;
  savingsVsNext: number | null;
  savingsVsUsualStore: number | null;
};

export type RecommendationResult = {
  rankedStores: RankedStore[];
  bestStoreId?: string;
  radiusKm: number;
};
