import { StoreProductPrice } from "@/src/domain/pricing/types";
import { BasketItem } from "@/src/features/basket/types";
import { Store } from "@/src/features/stores/types";
import { getDistanceKm } from "@/src/utils/distance";

const NEARBY_RADIUS_KM = 50;

export type ItemCoverageStatus =
  | { kind: "none_anywhere" }
  | { kind: "none_nearby"; anywhereCount: number }
  | { kind: "nearby"; nearbyCount: number };

export type ItemCoverage = {
  productId: string;
  status: ItemCoverageStatus;
};

type Input = {
  basket: BasketItem[];
  stores: Store[];
  prices: StoreProductPrice[];
  userCoords: { latitude: number; longitude: number } | null;
  radiusKm?: number;
};

export function computePerItemCoverage({
  basket,
  stores,
  prices,
  userCoords,
  radiusKm = NEARBY_RADIUS_KM,
}: Input): Map<string, ItemCoverage> {
  const storeById = new Map(stores.map((s) => [s.storeId, s]));

  // per-product: count of in-stock prices in geocoded stores (anywhere / nearby)
  const anywhere = new Map<string, number>();
  const nearby = new Map<string, number>();

  for (const price of prices) {
    if (!price.inStock) continue;
    const store = storeById.get(price.storeId);
    if (!store || store.lat == null || store.lng == null) continue;

    anywhere.set(price.productId, (anywhere.get(price.productId) ?? 0) + 1);

    if (userCoords) {
      const d = getDistanceKm(
        userCoords.latitude,
        userCoords.longitude,
        store.lat,
        store.lng,
      );
      if (d <= radiusKm) {
        nearby.set(price.productId, (nearby.get(price.productId) ?? 0) + 1);
      }
    }
  }

  const result = new Map<string, ItemCoverage>();
  for (const item of basket) {
    const a = anywhere.get(item.productId) ?? 0;
    const n = userCoords ? (nearby.get(item.productId) ?? 0) : a;

    let status: ItemCoverageStatus;
    if (a === 0) {
      status = { kind: "none_anywhere" };
    } else if (userCoords && n === 0) {
      status = { kind: "none_nearby", anywhereCount: a };
    } else {
      status = { kind: "nearby", nearbyCount: n };
    }
    result.set(item.productId, { productId: item.productId, status });
  }
  return result;
}
