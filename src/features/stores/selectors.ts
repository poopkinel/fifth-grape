import { storeDistanceText } from "@/src/lib/constants/storeMeta";
import { realPrices } from "../../lib/constants/realPrices";
import { realStores } from "../../lib/constants/realStores";
import { BasketItem } from "../lists/types";
import { getStoreBasketDetails } from "./getStoreBasketDetails";
import { StoreScreenModel } from "./types";

export function getStoreScreenModel(
    basket: BasketItem[], 
    storeId: string
): StoreScreenModel | null {

  const details = getStoreBasketDetails(basket, storeId, realStores, realPrices);
  if (!details) return null;

  return {
    storeId: storeId,
    title: details.chainName,
    subtitle: `${details.chainName} • ${details.address}`,
    total: details.total,
    missingCount: details.missingCount,
    distanceText: storeDistanceText[details.storeId] ?? "—",
    updatedAtText: details.updatedAt || "לא ידוע",
    splitTripText:
    details.missingCount === 0
        ? "הכול זמין כאן, אין צורך לפצל."
        : `חסרים ${details.missingCount} מוצרים בסניף הזה.`,

    rows: details?.rows.map((row) => {
        return {
            productId: row.productId,
            name: row.name,
            subtitle: [row.brand, row.unit].filter(Boolean).join(" • "),
            emoji: row.emoji,
            inStock: row.inStock,
            totalPrice: row.totalPrice,
            statusText: row.inStock ? "זמין בסל הנוכחי" : "לא זמין בסניף הזה",
        };
    }),
  };
}