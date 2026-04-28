import { RankedStore } from "./types";

export type Dilemma = {
  a: RankedStore;
  b: RankedStore;
};

const TOP_N = 5;

function dominates(a: RankedStore, b: RankedStore): boolean {
  const aDist = a.distanceKm ?? Infinity;
  const bDist = b.distanceKm ?? Infinity;
  const noWorse =
    a.total <= b.total &&
    a.missingCount <= b.missingCount &&
    aDist <= bDist;
  const strictlyBetter =
    a.total < b.total ||
    a.missingCount < b.missingCount ||
    aDist < bDist;
  return noWorse && strictlyBetter;
}

function isTradeoff(a: RankedStore, b: RankedStore): boolean {
  return !dominates(a, b) && !dominates(b, a);
}

export function findDilemmaPairs(rankedStores: RankedStore[]): Dilemma[] {
  const top = rankedStores.slice(0, TOP_N);
  const pairs: Dilemma[] = [];
  for (let i = 0; i < top.length; i++) {
    for (let j = i + 1; j < top.length; j++) {
      if (isTradeoff(top[i], top[j])) {
        pairs.push({ a: top[i], b: top[j] });
      }
    }
  }
  return pairs;
}

export function findDilemma(
  rankedStores: RankedStore[],
  skipKey?: string,
): Dilemma | null {
  const pairs = findDilemmaPairs(rankedStores);
  if (pairs.length === 0) return null;
  if (!skipKey) return pairs[0];
  return pairs.find((p) => dilemmaKey(p) !== skipKey) ?? null;
}

export function dilemmaKey(d: Dilemma): string {
  const ids = [d.a.store.storeId, d.b.store.storeId].sort();
  return `${ids[0]}|${ids[1]}`;
}
