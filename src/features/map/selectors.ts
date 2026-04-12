import { StoreProductPrice } from "@/src/domain/pricing/types";
import { rankStores } from "@/src/domain/recommendation/rankStores";
import { BasketItem } from "@/src/features/basket/types";
import { Store } from "@/src/features/stores/types";
import { formatDistanceKm } from "@/src/utils/distance";
import { formatRelativeUpdateTime } from "@/src/utils/format";
import { MapScreenModel } from "./types";

const MAX_MAP_MARKERS = 10;

type UserCoords = {
  latitude: number;
  longitude: number;
};

type MapScreenModelInput = {
  basket: BasketItem[];
  userCoords: UserCoords | null;
  usualStoreId?: string;
  stores: Store[];
  prices: StoreProductPrice[];
};

export function getMapScreenModel({
  basket,
  userCoords,
  usualStoreId,
  stores,
  prices,
}: MapScreenModelInput): MapScreenModel {
  const result = rankStores({
    basket,
    stores,
    prices,
    userCoords,
    usualStoreId,
  });

  const markers = result.rankedStores
    .filter((store) => store.store.lat != null && store.store.lng != null)
    .slice(0, MAX_MAP_MARKERS)
    .map((store) => {
      const isBest = store.rank === 0;

      return {
        storeId: store.store.storeId,
        chainName: store.store.chainName,
        branchName: store.store.branchName,
        lat: store.store.lat as number,
        lng: store.store.lng as number,
        total: store.total,
        missingCount: store.missingCount,
        matchedCount: store.matchedCount,
        distanceKm: store.distanceKm,
        distanceText:
          store.distanceKm !== null ? formatDistanceKm(store.distanceKm) : "—",
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
    bestStoreId: result.bestStoreId,
  };
}