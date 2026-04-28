import { ModeGranularity, TransportMode } from "./types";

const FOOT: ModeGranularity = {
  distanceBucketKm: 0.1,
  priceBucketNis: 0.5,
  searchRadiusKm: 1.5,
};

const CAR: ModeGranularity = {
  distanceBucketKm: 0.5,
  priceBucketNis: 1,
  searchRadiusKm: 10,
};

export function getModeGranularity(mode: TransportMode): ModeGranularity {
  return mode === "foot" ? FOOT : CAR;
}

export function bucketValue(value: number, bucket: number): number {
  if (bucket <= 0) return value;
  return Math.round(value / bucket) * bucket;
}
