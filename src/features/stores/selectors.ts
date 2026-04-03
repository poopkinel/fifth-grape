import { getAllPrices } from "@/src/data/prices/priceRepository";
import { getAllStores, getStoreById } from "@/src/data/stores/storeRepository";
import { formatDistanceKm, getDistanceKm } from "@/src/utils/distance";
import { BasketItem } from "../basket/types";
import { UserCoords } from "../location/useUserLocation";
import { getStoreBasketDetails } from "./getStoreBasketDetails";
import { StoreScreenModel } from "./types";

export function getStoreScreenModel(
  basket: BasketItem[],
  storeId: string,
  userCoords: UserCoords | null
): StoreScreenModel | null {
  const stores = getAllStores();
  const prices = getAllPrices();

  const details = getStoreBasketDetails(basket, storeId, stores, prices);
  const store = getStoreById(storeId);

  if (!details || !store) return null;

  const distanceKm = userCoords
    ? getDistanceKm(
        userCoords.latitude,
        userCoords.longitude,
        store.lat,
        store.lng
      )
    : null;

  return {
    storeId,
    title: details.chainName,
    subtitle: `${details.chainName} • ${details.address}`,
    total: details.total,
    missingCount: details.missingCount,
    distanceText: formatDistanceKm(distanceKm),
    updatedAtText: details.updatedAt || "לא ידוע",
    splitTripText:
      details.missingCount === 0
        ? "הכול זמין כאן, אין צורך לפצל."
        : `חסרים ${details.missingCount} מוצרים בסניף הזה.`,
    rows: details.rows.map((row) => ({
      productId: row.productId,
      name: row.name,
      subtitle: [row.brand, row.unit].filter(Boolean).join(" • "),
      emoji: row.emoji,
      inStock: row.inStock,
      totalPrice: row.totalPrice,
      statusText: row.inStock ? "זמין בסל הנוכחי" : "לא זמין בסניף הזה",
    })),
  };
}