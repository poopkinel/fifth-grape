import { StoreProductPrice } from "@/src/domain/pricing/types";
import { buildReasonText } from "@/src/domain/recommendation/explain";
import { rankStores } from "@/src/domain/recommendation/rankStores";
import { formatCurrency } from "@/src/utils/format";
import { formatDistanceKm } from "@/src/utils/distance";
import { BasketItem } from "../basket/types";
import { Store } from "../stores/types";
import { HomeScreenModel } from "./types";

type HomeScreenModelInput = {
  basket: BasketItem[];
  stores: Store[];
  prices: StoreProductPrice[];
  userCoords: { latitude: number; longitude: number } | null;
  usualStoreId?: string | null;
};

export function getHomeScreenModel({
  basket,
  stores,
  prices,
  userCoords,
  usualStoreId,
}: HomeScreenModelInput): HomeScreenModel {
  if (!basket.length || !stores.length) {
    return { recommendation: null, storeCount: stores.length };
  }

  const { rankedStores } = rankStores({
    basket,
    stores,
    prices,
    userCoords,
    usualStoreId,
  });

  const best = rankedStores[0];
  if (!best) {
    return { recommendation: null, storeCount: stores.length };
  }

  const isUsualStore = best.store.storeId === usualStoreId;

  return {
    recommendation: {
      storeId: best.store.storeId,
      chainName: best.store.chainName,
      branchName: best.store.branchName,
      totalText: formatCurrency(best.total),
      distanceText: formatDistanceKm(best.distanceKm),
      reasonText: buildReasonText(best, { isUsualStore }),
      missingCount: best.missingCount,
    },
    storeCount: stores.length,
  };
}
