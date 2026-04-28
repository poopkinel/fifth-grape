import { StoreProductPrice } from "@/src/domain/pricing/types";
import { buildReasonText } from "@/src/domain/recommendation/explain";
import { rankStores } from "@/src/domain/recommendation/rankStores";
import {
  ScoreWeights,
  TransportMode,
} from "@/src/features/preferences/types";
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
  transportMode?: TransportMode;
  weights?: ScoreWeights;
};

export function getHomeScreenModel({
  basket,
  stores,
  prices,
  userCoords,
  usualStoreId,
  transportMode,
  weights,
}: HomeScreenModelInput): HomeScreenModel {
  if (!basket.length || !stores.length) {
    return { recommendation: null };
  }

  const { rankedStores } = rankStores({
    basket,
    stores,
    prices,
    userCoords,
    usualStoreId,
    transportMode,
    weights,
  });

  const best = rankedStores[0];
  if (!best) {
    return { recommendation: null };
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
  };
}
