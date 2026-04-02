import { BasketItem } from "../lists/types";
import { StoreProductPrice } from "../pricing/types";
import { Store } from "../stores/types";
import { CompareBasketResult, ComparedStore } from "./types";

export function compareBasket(
  basket: BasketItem[],
  stores: Store[],
  prices: StoreProductPrice[]
): CompareBasketResult {
  if (basket.length === 0 || stores.length === 0) {
    return {
      stores: [],
    };
  }

  const comparedStores: ComparedStore[] = stores.map((store) => {
    let total = 0;
    let missingCount = 0;
    let availableCount = 0;

    for (const basketItem of basket) {
      const priceRecord = prices.find(
        (price) =>
          price.storeId === store.storeId &&
          price.productId === basketItem.productId
      );

      if (!priceRecord || !priceRecord.inStock) {
        missingCount += 1;
        continue;
      }

      total += priceRecord.price * basketItem.quantity;
      availableCount += 1;
    }

    const coverage =
      basket.length > 0 ? availableCount / basket.length : 0;

    return {
      storeId: store.storeId,
      chainName: store.chainName,
      branchName: store.branchName,
      address: store.address,
      lat: store.lat,
      lng: store.lng,
      total: Number(total.toFixed(2)),
      missingCount,
      availableCount,
      coverage
    };
  });

  const sortedStores = [...comparedStores].sort((a, b) => {
    if (a.missingCount !== b.missingCount) {
      return a.missingCount - b.missingCount;
    }

    return a.total - b.total;
  });

  const fullBasketStores = sortedStores
    .filter((store) => store.missingCount === 0)
    .sort((a, b) => a.total - b.total);

  return {
    stores: sortedStores,
    bestStoreId: sortedStores[0]?.storeId,
    cheapestFullBasketStoreId: fullBasketStores[0]?.storeId,
    closestStoreId: stores[0]?.storeId,
  };
}