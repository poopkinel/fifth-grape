export type CompareCard = {
  storeId: string;
  chainName: string;
  branchName: string;
  address: string;
  distanceKm: number | null;
  total: number;
  missingCount: number;
  coverage: number;
  title: string;
  badge: string;
  distanceText: string;
  reasonText: string;
  trustText: string;
  baselineText?: string;
  isBest: boolean;
  color: string;
  isUsualStore: boolean;
};

export type CompareScreenModel = {
  cards: CompareCard[];
  summaryText: string;
  bestStoreId?: string;
  radiusKm: number;
};
