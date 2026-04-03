import { Store } from "@/src/features/stores/types";

export type StoreComparisonBase = {
  store: Store;
  total: number;
  missingCount: number;
  matchedCount: number;
  coverage: number;
};

export type StoreComparison = StoreComparisonBase & {
  distanceKm: number | null;
  decisionScore: number;
  isFullBasket: boolean;
};

export type RankedStore = StoreComparison & {
  rank: number;
  savingsVsNext: number | null;
};

export type RecommendationResult = {
  rankedStores: RankedStore[];
  bestStoreId?: string;
};