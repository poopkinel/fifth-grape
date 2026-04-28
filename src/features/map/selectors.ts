import { StoreProductPrice } from "@/src/domain/pricing/types";
import { rankStores } from "@/src/domain/recommendation/rankStores";
import { BasketItem } from "@/src/features/basket/types";
import {
  ScoreWeights,
  TransportMode,
} from "@/src/features/preferences/types";
import i18n from "@/src/i18n";
import { getChainColor } from "@/src/features/stores/chainColors";
import { Store } from "@/src/features/stores/types";
import { formatDistanceKm } from "@/src/utils/distance";
import { formatRelativeUpdateTime } from "@/src/utils/format";
import { MapScreenModel } from "./types";

const MAX_MAP_MARKERS = 5;

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
  transportMode?: TransportMode;
  weights?: ScoreWeights;
};

export function getMapScreenModel({
  basket,
  userCoords,
  usualStoreId,
  stores,
  prices,
  transportMode,
  weights,
}: MapScreenModelInput): MapScreenModel {
  const result = rankStores({
    basket,
    stores,
    prices,
    userCoords,
    usualStoreId,
    transportMode,
    weights,
  });

  const markers = result.rankedStores
    .filter((store) => store.store.lat != null && store.store.lng != null)
    .slice(0, MAX_MAP_MARKERS)
    .map((store) => {
      const isBest = store.rank === 0;

      return {
        storeId: store.store.storeId,
        chainId: store.store.chainId,
        chainName: store.store.chainName,
        branchName: store.store.branchName,
        lat: store.store.lat as number,
        lng: store.store.lng as number,
        total: store.total,
        missingCount: store.missingCount,
        matchedCount: store.matchedCount,
        distanceKm: store.distanceKm,
        distanceText:
          store.distanceKm !== null
            ? formatDistanceKm(store.distanceKm)
            : i18n.t("distance.unknown"),
        title: isBest ? i18n.t("map.bestChoice") : i18n.t("map.quickCompare"),
        trustText:
          store.missingCount === 0
            ? formatRelativeUpdateTime(store.updatedAt)
            : i18n.t("store.foundCount", {
                matched: store.matchedCount,
                total: basket.length,
              }),
        badge: isBest
          ? "BEST"
          : store.missingCount === 0
            ? "FULL"
            : "MISSING",
        color: getChainColor(store.store.chainId),
        isBest,
      };
    });

  return {
    markers,
    bestStoreId: result.bestStoreId,
  };
}