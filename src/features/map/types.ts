export type MapStoreMarker = {
  storeId: string;
  chainName: string;
  branchName: string;
  total: number;
  missingCount: number;
  matchedCount: number;
  distanceText: string;
  distanceKm: number | null;
  badge: string;
  title: string;
  trustText: string;
  color: string;
  lat: number;
  lng: number;
  isBest: boolean;
};

export type MapScreenModel = {
  markers: MapStoreMarker[];
  defaultSelectedStoreId?: string;
};
