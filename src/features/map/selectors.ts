import { realPrices } from "../../lib/constants/realPrices";
import { realStores } from "../../lib/constants/realStores";
import { compareBasket } from "../compare/compareBasket";
import { BasketItem } from "../lists/types";

import { getDistanceInfo } from "@/src/utils/distance";
import { getStoreById } from "@/src/utils/stores";
import { UserCoords } from "../location/useUserLocation";
import { getStoreDecisionScore } from "../stores/getStoreDecisionScore";
import { MapScreenModel } from "./types";


export function getMapScreenModel(
  basket: BasketItem[], 
  userCoords: UserCoords | null
): MapScreenModel {
  const result = compareBasket(basket, realStores, realPrices);

  const markers = result.stores.map((store) => {
    const isBest = store.storeId === result.bestStoreId;
    const isFullBasket = store.storeId === result.cheapestFullBasketStoreId;
    const realStore = getStoreById(store.storeId);
    const { distanceKm, distanceText } = getDistanceInfo(userCoords, realStore);
    const score = getStoreDecisionScore(store.total, store.missingCount, distanceKm)

    return {
      storeId: store.storeId,
      chainName: store.chainName,
      total: store.total,
      distanceText: distanceText,
      distanceKm: distanceKm,
      missingCount: store.missingCount,
      lat: realStore?.lat ?? 32.0853,
      lng: realStore?.lng ?? 34.7818 ,
      color: isBest ? "#10b981" : isFullBasket ? "#f59e0b" : "#ef4444",
      badge: isBest ? "הכי משתלם" : isFullBasket ? "סל מלא" : "אפשרות נוספת",
      decisionScore: score,
    };
  });

  return {
    markers,
    defaultSelectedStoreId: result.cheapestFullBasketStoreId,
  }
}