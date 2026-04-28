export type TransportMode = "foot" | "car";

export type ScoreWeights = {
  price: number;
  availability: number;
  distance: number;
};

export type DilemmaAnswer = {
  pickedStoreId: string;
  rejectedStoreId: string;
  pickedTotal: number;
  rejectedTotal: number;
  pickedDistanceKm: number | null;
  rejectedDistanceKm: number | null;
  pickedMissingCount: number;
  rejectedMissingCount: number;
  transportMode: TransportMode;
  answeredAt: number;
};

export type ModeGranularity = {
  distanceBucketKm: number;
  priceBucketNis: number;
  searchRadiusKm: number;
};
