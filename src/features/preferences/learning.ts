import { DilemmaAnswer, ScoreWeights, TransportMode } from "./types";
import { getDefaultWeights } from "./weights";

const ETA = 0.5;
const HALF_LIFE_MS = 14 * 24 * 60 * 60 * 1000;
const MIN_WEIGHT = 0.01;

type Features = {
  total: number;
  missing: number;
  distance: number;
};

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function scoreWith(f: Features, w: ScoreWeights): number {
  return w.price * f.total + w.availability * f.missing + w.distance * f.distance;
}

function pickedFeatures(a: DilemmaAnswer): Features {
  return {
    total: a.pickedTotal,
    missing: a.pickedMissingCount,
    distance: a.pickedDistanceKm ?? 0,
  };
}

function rejectedFeatures(a: DilemmaAnswer): Features {
  return {
    total: a.rejectedTotal,
    missing: a.rejectedMissingCount,
    distance: a.rejectedDistanceKm ?? 0,
  };
}

function stepWeights(
  w: ScoreWeights,
  a: DilemmaAnswer,
  eta: number,
): ScoreWeights {
  const picked = pickedFeatures(a);
  const rejected = rejectedFeatures(a);
  const sa = scoreWith(picked, w);
  const sb = scoreWith(rejected, w);
  const probPicked = sigmoid(sb - sa);
  const grad = 1 - probPicked;
  return {
    price: Math.max(MIN_WEIGHT, w.price + eta * grad * (rejected.total - picked.total)),
    availability: Math.max(
      MIN_WEIGHT,
      w.availability + eta * grad * (rejected.missing - picked.missing),
    ),
    distance: Math.max(
      MIN_WEIGHT,
      w.distance + eta * grad * (rejected.distance - picked.distance),
    ),
  };
}

export function learnWeights(
  mode: TransportMode,
  answers: DilemmaAnswer[],
  now: number = Date.now(),
): ScoreWeights {
  let w = getDefaultWeights(mode);
  const modeAnswers = answers
    .filter((a) => a.transportMode === mode)
    .sort((a, b) => a.answeredAt - b.answeredAt);
  for (const ans of modeAnswers) {
    const ageMs = Math.max(0, now - ans.answeredAt);
    const ageWeight = Math.exp(-ageMs / HALF_LIFE_MS);
    w = stepWeights(w, ans, ETA * ageWeight);
  }
  return w;
}
