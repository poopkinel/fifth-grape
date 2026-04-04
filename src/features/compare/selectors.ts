import { getAllPrices } from "@/src/data/prices/priceRepository";
import { getAllStores } from "@/src/data/stores/storeRepository";
import {
  buildBaselineText,
  buildReasonText,
} from "@/src/domain/recommendation/explain";
import { rankStores } from "@/src/domain/recommendation/rankStores";
import { useBasketStore } from "@/src/features/basket/store";
import { usePreferenceStore } from "@/src/features/preferences/store";
import { formatDistanceKm } from "@/src/utils/distance";
import { formatRelativeUpdateTime } from "@/src/utils/format";
import { CompareCard, CompareScreenModel } from "./types";

export function getCompareScreenModel(
  userCoords: { latitude: number; longitude: number } | null
): CompareScreenModel {
  const basket = useBasketStore.getState().items;
  const usualStoreId = usePreferenceStore.getState().usualStoreId;

  if (!basket.length) {
    return {
      cards: [],
      summaryText: "אין מוצרים להשוואה",
    };
  }

  const stores = getAllStores();
  const prices = getAllPrices();

  const result = rankStores({
    basket,
    stores,
    prices,
    userCoords,
    usualStoreId,
  });

  const cards: CompareCard[] = result.rankedStores.map((store) => {
    const distanceText =
      store.distanceKm !== null
        ? formatDistanceKm(store.distanceKm)
        : "—";

    const isBest = store.rank === 0;
    const isUsualStore = store.store.storeId === usualStoreId;
    const trustText = formatRelativeUpdateTime(store.updatedAt);
    const baselineText =
      usualStoreId && isBest && !isUsualStore
        ? buildBaselineText(store.savingsVsUsualStore)
        : undefined;

    return {
      storeId: store.store.storeId,
      chainName: store.store.chainName,
      branchName: store.store.branchName,
      address: store.store.address,
      distanceKm: store.distanceKm,
      distanceText,
      total: store.total,
      missingCount: store.missingCount,
      coverage: store.coverage,
      title: isBest
        ? "הבחירה הכי טובה עבורך"
        : store.missingCount === 0
        ? "אפשרות מלאה"
        : "אפשרות חלקית",
      badge: isBest
        ? "BEST"
        : store.missingCount === 0
        ? "FULL"
        : "MISSING",
      reasonText: buildReasonText(store),
      trustText,
      baselineText,
      isBest,
      color: isBest ? "#22c55e" : "#e5e7eb",
      isUsualStore,
    };
  });

  const best = cards[0];

  return {
    cards,
    summaryText: best ? `${best.chainName} היא ההמלצה המובילה לסל הנוכחי` : "",
    bestStoreId: result.bestStoreId,
  };
}
