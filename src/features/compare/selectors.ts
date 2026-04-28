import { StoreProductPrice } from "@/src/domain/pricing/types";
import {
  buildBaselineText,
  buildReasonText,
} from "@/src/domain/recommendation/explain";
import { rankStores } from "@/src/domain/recommendation/rankStores";
import {
  ScoreWeights,
  TransportMode,
} from "@/src/features/preferences/types";
import i18n from "@/src/i18n";
import { formatDistanceKm } from "@/src/utils/distance";
import {
  formatCurrency,
  formatRelativeUpdateTime,
  isUnknownRelativeTime,
} from "@/src/utils/format";
import { BasketItem } from "../basket/types";
import { getStoreColor } from "../stores/chainColors";
import { Store } from "../stores/types";
import { CompareCard, CompareScreenModel } from "./types";

const MAX_COMPARE_CARDS = 20;
const DEFAULT_WALKING_DISTANCE_KM = 1.2;

type CompareScreenModelInput = {
  basket: BasketItem[];
  userCoords: { latitude: number; longitude: number } | null;
  usualStoreId?: string | null;
  stores: Store[];
  prices: StoreProductPrice[];
  transportMode?: TransportMode;
  weights?: ScoreWeights;
  maxWalkingDistanceKm?: number;
};

export function getCompareScreenModel({
  basket,
  userCoords,
  usualStoreId,
  stores,
  prices,
  transportMode,
  weights,
  maxWalkingDistanceKm = DEFAULT_WALKING_DISTANCE_KM,
}: CompareScreenModelInput): CompareScreenModel {

  if (!basket.length) {
    return {
      cards: [],
      summaryText: i18n.t("compare.empty"),
      radiusKm: 5,
      rankedStores: [],
    };
  }

  const result = rankStores({
    basket,
    stores,
    prices,
    userCoords,
    usualStoreId,
    transportMode,
    weights,
  });

  const topStores = result.rankedStores.slice(0, MAX_COMPARE_CARDS);

  const cards: CompareCard[] = topStores.map((store) => {
    const distanceText =
      store.distanceKm !== null
        ? formatDistanceKm(store.distanceKm)
        : i18n.t("distance.unknown");

    const isBest = store.rank === 0;
    const isUsualStore = store.store.storeId === usualStoreId;
    const relativeUpdateText = formatRelativeUpdateTime(store.updatedAt);
    const trustText = isUnknownRelativeTime(relativeUpdateText)
      ? i18n.t("trust.noInfo")
      : i18n.t("trust.withRelative", { relative: relativeUpdateText });
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
        ? i18n.t("card.bestForYou")
        : store.missingCount === 0
        ? i18n.t("card.fullOption")
        : i18n.t("card.partialOption"),
      badge: isBest
        ? "BEST"
        : store.missingCount === 0
        ? "FULL"
        : "MISSING",
      reasonText: buildReasonText(store, { isUsualStore }),
      trustText,
      baselineText,
      isBest,
      color: getStoreColor({
        chainId: store.store.chainId,
        subChainName: store.store.subChainName,
      }),
      isUsualStore,
      isWalkable:
        store.distanceKm !== null && store.distanceKm <= maxWalkingDistanceKm,
    };
  });

  const best = cards[0];
  const bestStore = result.rankedStores[0];
  const summaryText = !best || !bestStore
    ? ""
    : bestStore.savingsVsUsualStore !== null &&
      bestStore.savingsVsUsualStore > 0 &&
      bestStore.store.storeId !== usualStoreId
    ? i18n.t("compare.summarySaves", {
        chain: best.chainName,
        amount: formatCurrency(bestStore.savingsVsUsualStore),
      })
    : bestStore.store.storeId === usualStoreId
    ? i18n.t("compare.summaryStillUsual", { chain: best.chainName })
    : i18n.t("compare.summaryTopRecommendation", { chain: best.chainName });

  return {
    cards,
    summaryText,
    bestStoreId: result.bestStoreId,
    radiusKm: result.radiusKm,
    rankedStores: result.rankedStores,
  };
}
