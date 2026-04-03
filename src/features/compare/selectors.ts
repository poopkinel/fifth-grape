import { getAllPrices } from "@/src/data/prices/priceRepository";
import { getAllStores } from "@/src/data/stores/storeRepository";
import { rankStores } from "@/src/domain/recommendation/rankStores";
import { useBasketStore } from "@/src/features/basket/store";
import { formatDistanceKm } from "@/src/utils/distance";
import { formatCurrency } from "@/src/utils/format";
import { CompareCard, CompareScreenModel } from "./types";

export function getCompareScreenModel(
  userCoords: { latitude: number; longitude: number } | null
): CompareScreenModel {
  const basket = useBasketStore.getState().items;

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
  });

  const cards: CompareCard[] = result.rankedStores.map((store) => {
    const distanceText =
      store.distanceKm !== null
        ? formatDistanceKm(store.distanceKm)
        : "—";

    const isBest = store.rank === 0;

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
      reason: isBest
        ? store.savingsVsNext !== null
          ? `חוסך ${formatCurrency(store.savingsVsNext)} לעומת הבא`
          : "הבחירה המשתלמת ביותר"
        : store.missingCount === 0
        ? "כל המוצרים זמינים"
        : `חסרים ${store.missingCount} מוצרים`,
      isBest,
      color: isBest ? "#22c55e" : "#e5e7eb",
      savingsVsNext: store.savingsVsNext,
    };
  });

  const best = cards[0];

  return {
    cards,
    summaryText: best ? `${best.chainName} היא הבחירה הכי משתלמת` : "",
    bestStoreId: result.bestStoreId,
  };
}