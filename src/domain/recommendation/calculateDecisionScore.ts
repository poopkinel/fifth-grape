import { ScoreWeights } from "@/src/features/preferences/types";

type Input = {
  total: number;
  missingCount: number;
  distanceKm: number | null;
  weights: ScoreWeights;
};

export function calculateDecisionScore({
  total,
  missingCount,
  distanceKm,
  weights,
}: Input): number {
  const priceTerm = total * weights.price;
  const missingTerm = missingCount * weights.availability;
  const distanceTerm = distanceKm != null ? distanceKm * weights.distance : 0;

  return priceTerm + missingTerm + distanceTerm;
}
