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
import { useTheme } from "@/src/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
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

  if (isLoading || !data) {
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

  const compareModel = getCompareScreenModel({
    basket: items,
    userCoords,
    usualStoreId,
    stores: data.stores,
    prices: data.prices,
    transportMode,
    weights,
    maxWalkingDistanceKm,
  });

  const dilemmaPairs = findDilemmaPairs(compareModel.rankedStores);
  const visiblePair = bannerHidden
    ? null
    : findDilemma(compareModel.rankedStores, skipKey);
  const showCards = hasInteracted || dilemmaPairs.length === 0;

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
    setSkipKey(dilemmaKey(visiblePair));
    setBannerHidden(true);
    setHasInteracted(true);
  };

  const handleSkip = () => {
    if (visiblePair) setSkipKey(dilemmaKey(visiblePair));
    setBannerHidden(true);
    setHasInteracted(true);
  };

  const handleNextDilemma = () => {
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
            onPressMap={() => router.push("/map/compare")}
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
