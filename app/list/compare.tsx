import { useBasketStore } from "@/src/features/basket/store";
import { getCompareScreenModel } from "@/src/features/compare/selectors";
import { useUserLocation } from "@/src/features/location/useUserLocation";
import { usePreferenceStore } from "@/src/features/preferences/store";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import RecommendationCard from "../../src/components/compare/RecommendationCard";
import AppHeader from "../../src/components/ui/AppHeader";

export default function CompareScreen() {
  const router = useRouter();
  const items = useBasketStore((state) => state.items);
  const setUsualStore = usePreferenceStore((state) => state.setUsualStore);
  const clearUsualStore = usePreferenceStore((state) => state.clearUsualStore);

  const { userCoords } = useUserLocation();
  const compareModel = getCompareScreenModel(userCoords);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
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
            backgroundColor: "#ecfdf5",
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: "#a7f3d0",
          }}
        >
          <Text
            style={{
              textAlign: "right",
              color: "#065f46",
              fontWeight: "700",
              marginBottom: 4,
            }}
          >
            סיכום מהיר
          </Text>

          <Text
            style={{
              textAlign: "right",
              color: "#047857",
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
              card.isUsualStore ? clearUsualStore() : setUsualStore(card.storeId)
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}
