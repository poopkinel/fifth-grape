import { StoreProductPrice } from "@/src/domain/pricing/types";
import {
  buildBaselineText,
  buildReasonText,
} from "@/src/domain/recommendation/explain";
import { rankStores } from "@/src/domain/recommendation/rankStores";
import { formatDistanceKm, getDistanceKm } from "@/src/utils/distance";
import { formatRelativeUpdateTime } from "@/src/utils/format";
import { BasketItem } from "../basket/types";
import { UserCoords } from "../location/useUserLocation";
import { Store, StoreBasketDetails, StoreScreenModel } from "./types";

type StoreScreenModelInput = {
  basket: BasketItem[];
  storeId: string;
  userCoords: UserCoords | null;
  usualStoreId?: string;
  stores: Store[];
  prices: StoreProductPrice[];
  details: StoreBasketDetails | null;
};

export function getStoreScreenModel({
  basket,
  storeId,
  userCoords,
  usualStoreId,
  stores,
  prices,
  details
}: StoreScreenModelInput): StoreScreenModel | null {
  const store = stores.find((s) => s.storeId === storeId);

  if (!details || !store) return null;

  const recommendation = rankStores({
    basket,
    stores,
    prices,
    userCoords,
    usualStoreId,
  }).rankedStores.find((item) => item.store.storeId === storeId);

  const distanceKm = userCoords
    ? getDistanceKm(
        userCoords.latitude,
        userCoords.longitude,
        store.lat,
        store.lng
      )
    : null;

  const matchedCount =
    recommendation?.matchedCount ??
    details.rows.filter((row) => row.inStock).length;

  const updatedAtText = formatRelativeUpdateTime(
    recommendation?.updatedAt ?? details.updatedAt
  );

  const isUsualStore = storeId === usualStoreId;

  const reasonText = recommendation
    ? buildReasonText(recommendation, { isUsualStore })
    : details.missingCount === 0
      ? "כל המוצרים נמצאים כאן"
      : `חסרים ${details.missingCount} מוצרים`;

  const baselineText =
    usualStoreId && recommendation?.rank === 0 && !isUsualStore
      ? buildBaselineText(recommendation?.savingsVsUsualStore ?? null)
      : undefined;

  return {
    storeId,
    title: details.chainName,
    subtitle: `${details.chainName} • ${details.address}`,
    total: details.total,
    missingCount: details.missingCount,
    matchedCount,
    distanceText: formatDistanceKm(distanceKm),
    reasonText,
    trustText: `נמצאו ${matchedCount} מתוך ${basket.length} מוצרים`,
    updatedAtText,
    baselineText,
    isUsualStore,
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