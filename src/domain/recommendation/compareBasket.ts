import { StoreProductPrice } from "@/src/domain/pricing/types";
import { BasketItem } from "@/src/features/basket/types";
import { Store } from "@/src/features/stores/types";
import { StoreComparisonBase } from "./types";

type Input = {
  basket: BasketItem[];
  stores: Store[];
  prices: StoreProductPrice[];
};

function priceKey(storeId: string, productId: string): string {
  return `${storeId}\u0000${productId}`;
}

export function compareBasket({
  basket,
  stores,
  prices,
}: Input): StoreComparisonBase[] {
  const priceIndex = new Map<string, StoreProductPrice>();
  for (const price of prices) {
    priceIndex.set(priceKey(price.storeId, price.productId), price);
  }

  return stores
    .map((store) => {
      let total = 0;
      let missingCount = 0;
      let matchedCount = 0;

      for (const item of basket) {
        const price = priceIndex.get(priceKey(store.storeId, item.productId));

        if (!price || !price.inStock) {
          missingCount++;
          continue;
        }

        matchedCount++;
        total += price.price * item.quantity;
      }

      const coverage =
        basket.length > 0 ? matchedCount / basket.length : 0;

      return {
        store,
        total: Number(total.toFixed(2)),
        missingCount,
        matchedCount,
        coverage,
      };
    })
    .filter((store) => store.matchedCount > 0);
}
