import { getDistanceInfo } from "@/src/utils/distance";
import { getStoreById } from "@/src/utils/stores";
import { realPrices } from "../../lib/constants/realPrices";
import { realStores } from "../../lib/constants/realStores";
import { BasketItem } from "../lists/types";
import { UserCoords } from "../location/useUserLocation";
import { getStoreDecisionScore } from "../stores/getStoreDecisionScore";
import { compareBasket } from "./compareBasket";
import { CompareScreenModel } from "./types";


export function getCompareScreenModel(
  basket: BasketItem[], 
  userCoords: UserCoords | null
): CompareScreenModel {
  const result = compareBasket(basket, realStores, realPrices);

  const cards = result.stores.map((store) => {
    const isBest = store.storeId === result.bestStoreId;
    const isFullBasket = store.storeId === result.cheapestFullBasketStoreId;    
    
    const realStore = getStoreById(store.storeId);
    const { distanceKm, distanceText } = getDistanceInfo(userCoords, realStore);
    const score = getStoreDecisionScore(store.total, store.missingCount, distanceKm)

    return {
      storeId: store.storeId,
      chainName: store.chainName,
      branchName: store.branchName,
      address: store.address,
      distnaceKm: distanceKm,
      total: store.total,
      missingCount: store.missingCount,
      coverage: store.coverage,
      title: isBest
        ? "הבחירה הטובה ביותר"
        : isFullBasket
        ? "הסל המלא הזול ביותר"
        : "אפשרות נוספת",
      badge: isBest
        ? "הכי משתלם"
        : isFullBasket
        ? "סל מלא"
        : "אפשרות נוספת",
      distanceText: distanceText,
      isBest,
      color: isBest ? "#10b981" : isFullBasket ? "#f59e0b" : "#ef4444",
      decisionScore: score,
    };
  });

  const totalCount = basket.reduce((sum, item) => sum + item.quantity, 0);

  const bestStore = result.stores.find((store) => store.storeId === result.bestStoreId);
  
  const fullBasketStore = result.stores.find(
    (store) => store.storeId === result.cheapestFullBasketStoreId
  );

  const summaryText =
    totalCount === 0
        ? "עדיין אין מוצרים ברשימה."
        : bestStore && fullBasketStore
        ? `${bestStore.chainName} היא הבחירה הכי משתלמת כרגע עבור ${totalCount} מוצרים. אם חשוב לך סל מלא, ${fullBasketStore.chainName} עדיפה.`
        : bestStore
        ? `${bestStore.chainName} היא הבחירה הכי משתלמת כרגע עבור ${totalCount} מוצרים.`
        : "לא נמצאה השוואה כרגע.";

  return {
    cards,
    summaryText,
    bestStoreId: result.bestStoreId,
    cheapestFullBasketStoreId: result.cheapestFullBasketStoreId,
  }
}