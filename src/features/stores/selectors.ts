import { StoreProductPrice } from "@/src/domain/pricing/types";
import {
  buildBaselineText,
  buildReasonText,
} from "@/src/domain/recommendation/explain";
import { rankStores } from "@/src/domain/recommendation/rankStores";
import {
  ScoreWeights,
  TransportMode,
} from "@/src/features/preferences/types";
import i18n from "@/src/i18n";
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
  transportMode?: TransportMode;
  weights?: ScoreWeights;
};

export function getStoreScreenModel({
  basket,
  storeId,
  userCoords,
  usualStoreId,
  stores,
  prices,
  details,
  transportMode,
  weights,
}: StoreScreenModelInput): StoreScreenModel | null {
  const store = stores.find((s) => s.storeId === storeId);

  if (!details || !store) return null;

  const recommendation = rankStores({
    basket,
    stores,
    prices,
    userCoords,
    usualStoreId,
    transportMode,
    weights,
  }).rankedStores.find((item) => item.store.storeId === storeId);

  const distanceKm =
    userCoords && store.lat != null && store.lng != null
      ? getDistanceKm(
          userCoords.latitude,
          userCoords.longitude,
          store.lat,
          store.lng,
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
      ? i18n.t("store.allItemsHere")
      : i18n.t("store.missingItemsCount", { count: details.missingCount });

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
    trustText: i18n.t("store.foundCount", {
      matched: matchedCount,
      total: basket.length,
    }),
    updatedAtText,
    baselineText,
    isUsualStore,
    splitTripText:
      details.missingCount === 0
        ? i18n.t("store.noSplitNeeded")
        : i18n.t("store.missingHere", { count: details.missingCount }),
    rows: details.rows.map((row) => ({
      productId: row.productId,
      name: row.name,
      subtitle: [row.brand, row.unit].filter(Boolean).join(" • "),
      emoji: row.emoji,
      imageUrl: row.imageUrl,
      inStock: row.inStock,
      totalPrice: row.totalPrice,
      statusText: row.inStock
        ? i18n.t("store.available")
        : i18n.t("store.notAvailable"),
    })),
  };
}