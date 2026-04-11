export type HomeRecommendation = {
  storeId: string;
  chainName: string;
  branchName: string;
  totalText: string;
  distanceText: string;
  reasonText: string;
  missingCount: number;
};

export type HomeScreenModel = {
  recommendation: HomeRecommendation | null;
  storeCount: number;
};
