import { getAllPrices } from "@/src/data/prices/priceRepository";
import { getAllStores } from "@/src/data/stores/storeRepository";
import { rankStores } from "@/src/domain/recommendation/rankStores";
import { useBasketStore } from "@/src/features/basket/store";
import { usePreferenceStore } from "@/src/features/preferences/store";
import { formatDistanceKm } from "@/src/utils/distance";
import { formatCurrency, formatRelativeUpdateTime } from "@/src/utils/format";
import { CompareCard, CompareScreenModel } from "./types";

function getReasonText(card: {
  isBest: boolean;
  matchedCount: number;
  missingCount: number;
  savingsVsNext: number | null;
  savingsVsUsualStore: number | null;
}) {
  if (card.isBest && card.savingsVsUsualStore !== null && card.savingsVsUsualStore > 0) {
    return `חוסך ${formatCurrency(card.savingsVsUsualStore)} לעומת הסופר הרגיל שלך`;
  }

  if (card.isBest && card.savingsVsNext !== null && card.savingsVsNext > 0) {
    return `חוסך ${formatCurrency(card.savingsVsNext)} לעומת האפשרות הבאה`;
  }

  if (card.missingCount === 0) {
    return "כל המוצרים נמצאים כאן";
  }

  return `חסרים ${card.missingCount} מוצרים`;
}

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
    const baselineText = isBest
      ? store.savingsVsUsualStore === null
        ? undefined
        : store.savingsVsUsualStore > 0
        ? `חוסך ${formatCurrency(store.savingsVsUsualStore)} לעומת הסופר הרגיל שלך`
        : store.savingsVsUsualStore < 0
        ? `עולה ${formatCurrency(Math.abs(store.savingsVsUsualStore))} יותר מהסופר הרגיל שלך`
        : "זו אותה עלות כמו הסופר הרגיל שלך"
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
      reasonText: getReasonText({
        isBest,
        matchedCount: store.matchedCount,
        missingCount: store.missingCount,
        savingsVsNext: store.savingsVsNext,
        savingsVsUsualStore: store.savingsVsUsualStore,
      }),
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
