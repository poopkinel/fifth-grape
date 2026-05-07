import DilemmaBanner from "@/src/components/compare/DilemmaBanner";
import RecommendationCard from "@/src/components/compare/RecommendationCard";
import AppHeader from "@/src/components/ui/AppHeader";
import { useMarketData } from "@/src/data/market/useMarketData";
import {
  dilemmaKey,
  findDilemma,
  findDilemmaPairs,
} from "@/src/domain/recommendation/findDilemma";
import { RankedStore } from "@/src/domain/recommendation/types";
import { useBasketStore } from "@/src/features/basket/store";
import { getCompareScreenModel } from "@/src/features/compare/selectors";
import { useUserLocation } from "@/src/features/location/useUserLocation";
import { usePreferenceStore } from "@/src/features/preferences/store";
import { DilemmaAnswer } from "@/src/features/preferences/types";
import { track } from "@/src/lib/analytics";
import { useTheme } from "@/src/theme";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CompareScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const items = useBasketStore((state) => state.items);
  const setUsualStore = usePreferenceStore((state) => state.setUsualStore);
  const clearUsualStore = usePreferenceStore((state) => state.clearUsualStore);
  const usualStoreId = usePreferenceStore((state) => state.usualStoreId);
  const transportMode = usePreferenceStore((state) => state.transportMode);
  const weights = usePreferenceStore((state) => state.weights[transportMode]);
  const recordAnswer = usePreferenceStore((state) => state.recordAnswer);
  const maxWalkingDistanceKm = usePreferenceStore(
    (state) => state.maxWalkingDistanceKm,
  );

  const [skipKey, setSkipKey] = useState<string | undefined>(undefined);
  const [bannerHidden, setBannerHidden] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const { userCoords } = useUserLocation();
  const { data, isLoading, error } = useMarketData(
    items.map((item) => item.productId),
  );

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const compareModel =
    items.length && data
      ? getCompareScreenModel({
          basket: items,
          userCoords,
          usualStoreId,
          stores: data.stores,
          prices: data.prices,
          transportMode,
          weights,
          maxWalkingDistanceKm,
        })
      : null;

  const dilemmaPairs = compareModel
    ? findDilemmaPairs(compareModel.rankedStores)
    : [];
  const visiblePair =
    bannerHidden || !compareModel
      ? null
      : findDilemma(compareModel.rankedStores, skipKey);
  const showCards = hasInteracted || dilemmaPairs.length === 0;
  const topCard = compareModel?.cards.find((c) => c.isBest) ?? null;
  const visibleKey = visiblePair ? dilemmaKey(visiblePair) : null;
  const topKey = topCard?.storeId ?? null;

  useEffect(() => {
    if (visibleKey) track("dilemma_shown", { transport_mode: transportMode });
  }, [visibleKey, transportMode]);

  useEffect(() => {
    if (!topCard) return;
    track("recommendation_top", {
      store_id: topCard.storeId,
      total: topCard.total,
      distance_km: topCard.distanceKm,
      missing_count: topCard.missingCount,
      is_walkable: topCard.isWalkable,
      basket_unique_count: items.length,
      basket_total_count: totalCount,
    });
    // Fire once per top-recommendation storeId. Re-running on basket churn would
    // over-fire when the best store doesn't change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topKey]);

  if (!items.length) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={["top", "left", "right", "bottom"]}
      >
        <AppHeader
          title={t("compare.title")}
          subtitle={t("compare.subtitleAddBasket")}
        />
      </SafeAreaView>
    );
  }

  const subtitleFor = (radius: number) =>
    t("compare.subtitle", {
      city: t("city.telAviv"),
      radius,
      count: totalCount,
    });

  if (isLoading || !data || !compareModel) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={["top", "left", "right", "bottom"]}
      >
        <AppHeader title={t("compare.title")} subtitle={subtitleFor(5)} />
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.textSecondary }}>
            {t("compare.loading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={["top", "left", "right", "bottom"]}
      >
        <AppHeader title={t("compare.title")} subtitle={subtitleFor(5)} />
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.textSecondary }}>
            {t("compare.loadError")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handlePick = (pickedStoreId: string, rejectedStoreId: string) => {
    if (!visiblePair) return;
    const picked: RankedStore =
      visiblePair.a.store.storeId === pickedStoreId ? visiblePair.a : visiblePair.b;
    const rejected: RankedStore =
      visiblePair.a.store.storeId === rejectedStoreId
        ? visiblePair.a
        : visiblePair.b;
    const answer: DilemmaAnswer = {
      pickedStoreId: picked.store.storeId,
      rejectedStoreId: rejected.store.storeId,
      pickedTotal: picked.total,
      rejectedTotal: rejected.total,
      pickedDistanceKm: picked.distanceKm,
      rejectedDistanceKm: rejected.distanceKm,
      pickedMissingCount: picked.missingCount,
      rejectedMissingCount: rejected.missingCount,
      transportMode,
      answeredAt: Date.now(),
    };
    recordAnswer(answer);
    track("dilemma_picked", {
      picked_store_id: picked.store.storeId,
      rejected_store_id: rejected.store.storeId,
      picked_total: picked.total,
      rejected_total: rejected.total,
      picked_distance_km: picked.distanceKm,
      rejected_distance_km: rejected.distanceKm,
      picked_missing_count: picked.missingCount,
      rejected_missing_count: rejected.missingCount,
      transport_mode: transportMode,
    });
    setSkipKey(dilemmaKey(visiblePair));
    setBannerHidden(true);
    setHasInteracted(true);
  };

  const handleSkip = () => {
    if (visiblePair) {
      setSkipKey(dilemmaKey(visiblePair));
      track("dilemma_skipped", { transport_mode: transportMode });
    }
    setBannerHidden(true);
    setHasInteracted(true);
  };

  const handleNextDilemma = () => {
    track("dilemma_refined", { transport_mode: transportMode });
    setBannerHidden(false);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={["top", "left", "right", "bottom"]}
    >
      <AppHeader
        title={t("compare.title")}
        subtitle={subtitleFor(compareModel.radiusKm)}
      />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          paddingBottom: 32,
          flexGrow: 1,
          justifyContent: !showCards && visiblePair ? "center" : "flex-start",
        }}
      >
        {visiblePair ? (
          <DilemmaBanner
            dilemma={visiblePair}
            onPick={handlePick}
            onSkip={handleSkip}
            expanded={!showCards}
            maxWalkingDistanceKm={maxWalkingDistanceKm}
            userCoords={userCoords}
          />
        ) : null}

        {showCards && compareModel.cards.map((card) => (
          <RecommendationCard
            key={card.storeId}
            title={card.title}
            chainName={card.chainName}
            chainColor={card.color}
            branchName={card.branchName}
            address={card.address}
            total={card.total}
            distanceText={card.distanceText}
            missingCount={card.missingCount}
            reasonText={card.reasonText}
            trustText={card.trustText}
            baselineText={card.baselineText}
            isBest={card.isBest}
            isUsualStore={card.isUsualStore}
            isWalkable={card.isWalkable}
            onPressDetails={() => router.push(`/store/${card.storeId}`)}
            onPressMap={() =>
              router.push(`/map/compare?storeId=${encodeURIComponent(card.storeId)}`)
            }
            onPressSetUsualStore={() =>
              card.isUsualStore
                ? clearUsualStore()
                : setUsualStore(card.storeId)
            }
          />
        ))}

        {dilemmaPairs.length > 0 && !visiblePair ? (
          <TouchableOpacity
            onPress={handleNextDilemma}
            style={{
              alignSelf: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: theme.cardBorder,
            }}
          >
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
              {t("compare.refinePill")}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
