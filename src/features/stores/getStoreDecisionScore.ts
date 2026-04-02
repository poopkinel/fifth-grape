export function getStoreDecisionScore(
  total: number,
  missingCount: number,
  distanceKm: number | null
): number {
  return distanceKm == null
    ? total + missingCount * 10
    : total + distanceKm * 5 + missingCount * 10;
}