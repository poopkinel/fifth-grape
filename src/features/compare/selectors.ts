import { StoreProductPrice } from "@/src/domain/pricing/types";
import {
  buildBaselineText,
  buildReasonText,
} from "@/src/domain/recommendation/explain";
import { rankStores } from "@/src/domain/recommendation/rankStores";
import { formatDistanceKm } from "@/src/utils/distance";
import { formatCurrency, formatRelativeUpdateTime } from "@/src/utils/format";
import { BasketItem } from "../basket/types";
import { Store } from "../stores/types";
import { CompareCard, CompareScreenModel } from "./types";

type CompareScreenModelInput = {
  basket: BasketItem[];
  userCoords: { latitude: number; longitude: number } | null;
  usualStoreId?: string | null;
  stores: Store[];
  prices: StoreProductPrice[];
};

export function getCompareScreenModel({
  basket,
  userCoords,
  usualStoreId,
  stores,
  prices,
}: CompareScreenModelInput): CompareScreenModel {

  if (!basket.length) {
    return {
      cards: [],
      summaryText: "אין מוצרים להשוואה",
    };
  }

  const result = rankStores({
    basket,
    stores,
    prices,
    userCoords,
    usualStoreId
  });

  const cards: CompareCard[] = result.rankedStores.map((store) => {
    const distanceText =
      store.distanceKm !== null
        ? formatDistanceKm(store.distanceKm)
        : "—";

    const isBest = store.rank === 0;
    const isUsualStore = store.store.storeId === usualStoreId;
    const relativeUpdateText = formatRelativeUpdateTime(store.updatedAt);
    const trustText =
      relativeUpdateText === "לא ידוע"
        ? "מידע לא זמין"
        : `מידע ${relativeUpdateText}`;
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
      reasonText: buildReasonText(store, { isUsualStore }),
      trustText,
      baselineText,
      isBest,
      color: isBest ? "#22c55e" : "#e5e7eb",
      isUsualStore,
    };
  });

  const best = cards[0];
  const bestStore = result.rankedStores[0];
  const summaryText = !best || !bestStore
    ? ""
    : bestStore.savingsVsUsualStore !== null &&
      bestStore.savingsVsUsualStore > 0 &&
      bestStore.store.storeId !== usualStoreId
    ? `${best.chainName} חוסכת ${formatCurrency(bestStore.savingsVsUsualStore)} לעומת הסופר הרגיל שלך`
    : bestStore.store.storeId === usualStoreId
    ? `${best.chainName} נשארת הבחירה הטובה ביותר לסל הנוכחי`
    : `${best.chainName} היא ההמלצה המובילה לסל הנוכחי`;

  return {
    cards,
    summaryText,
    bestStoreId: result.bestStoreId,
  };
}
