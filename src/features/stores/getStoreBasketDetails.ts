import { StoreProductPrice } from "@/src/domain/pricing/types";
import { BasketItem } from "../basket/types";
import { Store, StoreBasketDetails, StoreBasketRow } from "./types";

export function getStoreBasketDetails(
  basket: BasketItem[],
  storeId: string,
  stores: Store[],
  prices: StoreProductPrice[]
): StoreBasketDetails | null {
  const store = stores.find((s) => s.storeId === storeId);
  if (!store) return null;

  const storePricesByProductId = new Map<string, StoreProductPrice>();
  let latestUpdatedAt = "";
  for (const price of prices) {
    if (price.storeId !== storeId) continue;
    storePricesByProductId.set(price.productId, price);
    if (price.updatedAt && price.updatedAt > latestUpdatedAt) {
      latestUpdatedAt = price.updatedAt;
    }
  }

  const rows: StoreBasketRow[] = basket.map((item) => {
    const priceRecord = storePricesByProductId.get(item.productId);

    const inStock = Boolean(priceRecord?.inStock);
    const unitPrice = inStock && priceRecord ? priceRecord.price : null;
    const totalPrice =
      unitPrice != null ? Number((unitPrice * item.quantity).toFixed(2)) : null;

    return {
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      brand: item.brand,
      unit: item.unit,
      emoji: item.emoji,
      imageUrl: item.imageUrl,
      inStock,
      unitPrice,
      totalPrice,
    };
  });

  const total = rows.reduce((sum, row) => sum + (row.totalPrice ?? 0), 0);
  const missingCount = rows.filter((row) => !row.inStock).length;

  return {
    storeId: store.storeId,
    chainName: store.chainName,
    branchName: store.branchName,
    address: store.address,
    updatedAt: latestUpdatedAt,
    total: Number(total.toFixed(2)),
    missingCount,
    rows,
  };
}
