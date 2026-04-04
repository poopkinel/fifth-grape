import { getAllPrices } from "@/src/data/prices/priceRepository";
import { getAllStores } from "@/src/data/stores/storeRepository";
import { rankStores } from "@/src/domain/recommendation/rankStores";
import { BasketItem } from "@/src/features/basket/types";
import { usePreferenceStore } from "@/src/features/preferences/store";
import { formatDistanceKm } from "@/src/utils/distance";
import { formatRelativeUpdateTime } from "@/src/utils/format";
import { MapScreenModel } from "./types";

type UserCoords = {
  latitude: number;
  longitude: number;
};

export function getMapScreenModel(
  basket: BasketItem[],
  userCoords: UserCoords | null
): MapScreenModel {
  const stores = getAllStores();
  const prices = getAllPrices();
  const usualStoreId = usePreferenceStore.getState().usualStoreId;

  const result = rankStores({
    basket,
    stores,
    prices,
    userCoords,
    usualStoreId,
  });

  const markers = result.rankedStores.map((store) => {
    const isBest = store.rank === 0;

    return {
      storeId: store.store.storeId,
      chainName: store.store.chainName,
      branchName: store.store.branchName,
      lat: store.store.lat,
      lng: store.store.lng,
      total: store.total,
      missingCount: store.missingCount,
      matchedCount: store.matchedCount,
      distanceKm: store.distanceKm,
      distanceText:
        store.distanceKm !== null
          ? formatDistanceKm(store.distanceKm)
          : "—",
      title: isBest ? "הבחירה הטובה ביותר" : "השוואה מהירה",
      trustText:
        store.missingCount === 0
          ? formatRelativeUpdateTime(store.updatedAt)
          : `נמצאו ${store.matchedCount} מתוך ${basket.length} מוצרים`,
      badge: isBest
        ? "BEST"
        : store.missingCount === 0
        ? "FULL"
        : "MISSING",
      color: isBest ? "#22c55e" : "#ef4444",
      isBest,
    };
  });

  return {
    markers,
    defaultSelectedStoreId: result.bestStoreId,
  };
}
