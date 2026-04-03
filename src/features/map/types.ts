export type MapStoreMarker = {
  storeId: string;
  chainName: string;
  total: number;
  missingCount: number;
  distanceText: string;
  distanceKm: number | null;
  badge: string;
  color: string;
  lat: number,
  lng: number,
  // decisionScore: number,
};

export type MapScreenModel = {
    markers: MapStoreMarker[],
    defaultSelectedStoreId?: string;
}