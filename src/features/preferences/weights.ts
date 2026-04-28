import { ScoreWeights, TransportMode } from "./types";

const FOOT_DEFAULT: ScoreWeights = {
  price: 1,
  availability: 100,
  distance: 20,
};

const CAR_DEFAULT: ScoreWeights = {
  price: 1,
  availability: 100,
  distance: 2,
};

export function getDefaultWeights(mode: TransportMode): ScoreWeights {
  return mode === "foot" ? { ...FOOT_DEFAULT } : { ...CAR_DEFAULT };
}
