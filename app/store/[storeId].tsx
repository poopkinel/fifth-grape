import { useMarketData } from "@/src/data/market/useMarketData";
import { useBasketStore } from "@/src/features/basket/store";
import { useUserLocation } from "@/src/features/location/useUserLocation";
import { usePreferenceStore } from "@/src/features/preferences/store";
import { getStoreBasketDetails } from "@/src/features/stores/getStoreBasketDetails";
import { getStoreScreenModel } from "@/src/features/stores/selectors";
import { useTheme } from "@/src/theme";
import { formatCurrency } from "@/src/utils/format";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../src/components/ui/AppHeader";

export default function StoreDetailsScreen() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const basket = useBasketStore((state) => state.items);
  const usualStoreId = usePreferenceStore((state) => state.usualStoreId);
  const setUsualStore = usePreferenceStore((state) => state.setUsualStore);
  const clearUsualStore = usePreferenceStore((state) => state.clearUsualStore);
  const { userCoords } = useUserLocation();

  const { data, isLoading, error } = useMarketData(
    basket.map((item) => item.productId),
  );

  if (!storeId) return null;

  if (error) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={["top", "left", "right", "bottom"]}
      >
        <AppHeader title="סניף לא נמצא" subtitle="לא הצלחנו לטעון את פרטי הסניף" />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={["top", "left", "right", "bottom"]}
      >
        <AppHeader title="טוען..." subtitle="מחפש את פרטי הסניף" />
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.textSecondary }}>טוען נתוני חנויות</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["top", "left", "right", "bottom"]}>
        <AppHeader title="סניף לא נמצא" subtitle="לא הצלחנו לטעון את פרטי הסניף" />
      </SafeAreaView>
    );
  }

  const details = getStoreBasketDetails(basket, storeId, data.stores, data.prices);

  const storeModel = getStoreScreenModel({
    basket,
    storeId,
    userCoords,
    usualStoreId,
    stores: data.stores,
    prices: data.prices,
    details,
  });

  if (!storeModel) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["top", "left", "right", "bottom"]}>
        <AppHeader title="סניף לא נמצא" subtitle="לא הצלחנו לטעון את פרטי הסניף" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["top", "left", "right", "bottom"]}>
      <AppHeader title={storeModel.title} subtitle={storeModel.subtitle} />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          paddingBottom: 32,
        }}
      >
        {/* Green stats card — stays green in both modes */}
        <View
          style={{
            backgroundColor: theme.accent,
            borderRadius: 20,
            padding: 16,
          }}
        >
          <Text style={{ color: "#d1fae5", marginBottom: 4 }}>
            פירוט לפי הסל הנוכחי שלך
          </Text>

          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "700",
              marginBottom: 14,
            }}
          >
            {formatCurrency(storeModel.total)}
          </Text>

          <View
            style={{
              flexDirection: "row-reverse",
              gap: 8,
              justifyContent: "space-between",
            }}
          >
            {[
              { label: "סה״כ", value: formatCurrency(storeModel.total) },
              { label: "מרחק", value: storeModel.distanceText },
              { label: "חסרים", value: String(storeModel.missingCount) },
            ].map((stat) => (
              <View
                key={stat.label}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderRadius: 14,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                }}
              >
                <Text
                  style={{
                    color: "#d1fae5",
                    textAlign: "center",
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                >
                  {stat.label}
                </Text>
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontSize: 18,
                    fontWeight: "700",
                  }}
                >
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reason card */}
        <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 16 }}>
          <Text style={{ fontWeight: "700", color: theme.textPrimary, marginBottom: 6 }}>
            למה הסניף הזה
          </Text>
          <Text style={{ color: theme.textPrimary, marginBottom: 6 }}>
            {storeModel.reasonText}
          </Text>
          <Text style={{ color: theme.textSecondary, marginBottom: storeModel.baselineText ? 6 : 16 }}>
            {storeModel.trustText}
          </Text>
          {storeModel.baselineText ? (
            <Text style={{ color: theme.textSecondary, marginBottom: 16 }}>
              {storeModel.baselineText}
            </Text>
          ) : null}

          <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }}>
            {storeModel.isUsualStore ? (
              <View style={{ backgroundColor: theme.accentLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ color: theme.accentText, fontWeight: "700", fontSize: 12 }}>
                  הסופר הרגיל שלך
                </Text>
              </View>
            ) : <View />}

            <TouchableOpacity
              onPress={() => storeModel.isUsualStore ? clearUsualStore() : setUsualStore(storeModel.storeId)}
              style={{ backgroundColor: theme.statBg, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: "700" }}>
                {storeModel.isUsualStore ? "הסר כסופר הרגיל" : "קבע כסופר הרגיל"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Product breakdown */}
        <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              marginBottom: 12,
              color: theme.textPrimary,
            }}
          >
            פירוט המוצרים
          </Text>

          <View style={{ gap: 10 }}>
            {storeModel.rows.map((item) => {
              const missing = !item.inStock;

              return (
                <View
                  key={item.productId}
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: 16,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: missing ? theme.warningBorder : theme.cardBorder,
                    flexDirection: "row-reverse",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ alignItems: "center", marginLeft: 12 }}>
                    <Text style={{ fontSize: 28 }}>{item.emoji ?? "🛒"}</Text>
                  </View>

                  <View style={{ alignItems: "flex-end", flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: "600",
                        color: theme.textPrimary,
                        marginBottom: 4,
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={{
                        color: theme.textSecondary,
                        marginBottom: 2,
                      }}
                    >
                      {item.subtitle}
                    </Text>
                    <Text
                      style={{
                        color: missing ? theme.warningText : theme.textSecondary,
                      }}
                    >
                      {item.statusText}
                    </Text>
                  </View>

                  <View style={{ marginRight: 16 }}>
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 16,
                        color: missing ? theme.warningText : theme.textPrimary,
                      }}
                    >
                      {item.totalPrice == null ? "—" : formatCurrency(item.totalPrice)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Footer info cards */}
        <View style={{ flexDirection: "row-reverse", gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 20, padding: 16 }}>
            <Text style={{ fontWeight: "700", marginBottom: 6, color: theme.textPrimary }}>
              עדכון אחרון
            </Text>
            <Text style={{ color: theme.textSecondary }}>
              {storeModel.updatedAtText}
            </Text>
          </View>

          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 20, padding: 16 }}>
            <Text style={{ fontWeight: "700", marginBottom: 6, color: theme.textPrimary }}>
              נמצאו בסל
            </Text>
            <Text style={{ color: theme.textSecondary }}>
              {storeModel.matchedCount} מתוך {storeModel.matchedCount + storeModel.missingCount} מוצרים
            </Text>
          </View>
        </View>

        <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 16 }}>
          <Text style={{ fontWeight: "700", marginBottom: 6, color: theme.textPrimary }}>
            כדאי לפצל?
          </Text>
          <Text style={{ color: theme.textSecondary }}>
            {storeModel.splitTripText}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/map/compare")}
          style={{
            backgroundColor: theme.textPrimary,
            borderRadius: 16,
            paddingVertical: 16,
          }}
        >
          <Text
            style={{
              color: theme.background,
              textAlign: "center",
              fontWeight: "700",
            }}
          >
            פתח במפה
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
