export type ComparedStore = {
  storeId: string;
  chainName: string;
  branchName: string;
  address: string;
  lat: number;
  lng: number;
  total: number;
  missingCount: number;
  availableCount: number;
  coverage: number;
};

export type CompareBasketResult = {
  stores: ComparedStore[];
  bestStoreId?: string;
  cheapestFullBasketStoreId?: string;
  closestStoreId?: string;
};

export type CompareCard = {
  storeId: string;
  chainName: string;
  branchName: string;
  address: string;
  distnaceKm: number | null;
  total: number;
  missingCount: number;
  coverage: number;
  title: string;
  badge: string;
  distanceText: string;
  isBest: boolean;
  color: string;
  decisionScore: number;
};

export type CompareScreenModel = {
  cards: CompareCard[];
  summaryText: string;
  bestStoreId?: string;
  cheapestFullBasketStoreId?: string,
};