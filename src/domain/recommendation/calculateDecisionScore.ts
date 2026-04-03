type Input = {
  total: number;
  missingCount: number;
  distanceKm: number | null;
};

export function calculateDecisionScore({
  total,
  missingCount,
  distanceKm,
}: Input): number {
  const missingPenalty = missingCount * 100;
  const distancePenalty = distanceKm ? distanceKm * 2 : 0;

  return total + missingPenalty + distancePenalty;
}