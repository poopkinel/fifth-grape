import RecommendationCard from "@/src/components/compare/RecommendationCard";
import AppHeader from "@/src/components/ui/AppHeader";
import { useMarketData } from "@/src/data/market/useMarketData";
import { useBasketStore } from "@/src/features/basket/store";
import { getCompareScreenModel } from "@/src/features/compare/selectors";
import { useUserLocation } from "@/src/features/location/useUserLocation";
import { usePreferenceStore } from "@/src/features/preferences/store";
import { useTheme } from "@/src/theme";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CompareScreen() {
  const router = useRouter();
  const theme = useTheme();
  const items = useBasketStore((state) => state.items);
  const setUsualStore = usePreferenceStore((state) => state.setUsualStore);
  const clearUsualStore = usePreferenceStore((state) => state.clearUsualStore);
  const usualStoreId = usePreferenceStore((state) => state.usualStoreId);

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
          title="התוצאה הכי טובה עבורך"
          subtitle="הוסף מוצרים לסל כדי להתחיל להשוות"
        />
      </SafeAreaView>
    );
  }

  if (isLoading || !data) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={["top", "left", "right", "bottom"]}
      >
        <AppHeader
          title="התוצאה הכי טובה עבורך"
          subtitle={`תל אביב • רדיוס 5 ק״מ • ${totalCount} מוצרים`}
        />
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.textSecondary }}>טוען נתוני מחירים…</Text>
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
        <AppHeader
          title="התוצאה הכי טובה עבורך"
          subtitle={`תל אביב • רדיוס 5 ק״מ • ${totalCount} מוצרים`}
        />
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.textSecondary }}>
            לא הצלחנו לטעון את נתוני המחירים.
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
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={["top", "left", "right", "bottom"]}
    >
      <AppHeader
        title="התוצאה הכי טובה עבורך"
        subtitle={`תל אביב • רדיוס 5 ק״מ • ${totalCount} מוצרים`}
      />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          paddingBottom: 32,
        }}
      >
        <View
          style={{
            backgroundColor: theme.accentLight,
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: theme.accentBorder,
          }}
        >
          <Text
            style={{
              color: theme.accentTextDark,
              fontWeight: "700",
              marginBottom: 4,
            }}
          >
            סיכום מהיר
          </Text>

          <Text
            style={{
              color: theme.accentText,
              lineHeight: 22,
            }}
          >
            {compareModel.summaryText}
          </Text>
        </View>

        {compareModel.cards.map((card) => (
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
            onPressDetails={() => router.push(`/store/${card.storeId}`)}
            onPressMap={() => router.push("/map/compare")}
            onPressSetUsualStore={() =>
              card.isUsualStore
                ? clearUsualStore()
                : setUsualStore(card.storeId)
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
