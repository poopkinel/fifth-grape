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

  const rows: StoreBasketRow[] = basket.map((item) => {
    const priceRecord = prices.find(
      (price) => price.storeId === storeId && price.productId === item.productId
    );

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
      inStock,
      unitPrice,
      totalPrice,
    };
  });

  const total = rows.reduce((sum, row) => sum + (row.totalPrice ?? 0), 0);

  const missingCount = rows.filter((row) => !row.inStock).length;

  const relevantPriceRecords = prices
    .filter((p) => p.storeId === storeId && p.updatedAt)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const updatedAt = relevantPriceRecords[0]?.updatedAt ?? "";

  return {
    storeId: store.storeId,
    chainName: store.chainName,
    branchName: store.branchName,
    address: store.address,
    updatedAt,
    total: Number(total.toFixed(2)),
    missingCount,
    rows,
  };
}
