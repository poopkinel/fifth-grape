import { getAllPrices } from "@/src/data/prices/priceRepository";
import { getAllStores } from "@/src/data/stores/storeRepository";
import { rankStores } from "@/src/domain/recommendation/rankStores";
import { BasketItem } from "@/src/features/basket/types";
import { formatDistanceKm } from "@/src/utils/distance";
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

  const result = rankStores({
    basket,
    stores,
    prices,
    userCoords,
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
      distanceKm: store.distanceKm,
      distanceText:
        store.distanceKm !== null
          ? formatDistanceKm(store.distanceKm)
          : "—",
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