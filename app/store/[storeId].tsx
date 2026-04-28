import ProductImage from "@/src/components/products/ProductImage";
import { useMarketData } from "@/src/data/market/useMarketData";
import { useBasketStore } from "@/src/features/basket/store";
import { useUserLocation } from "@/src/features/location/useUserLocation";
import { usePreferenceStore } from "@/src/features/preferences/store";
import { getStoreBasketDetails } from "@/src/features/stores/getStoreBasketDetails";
import { getStoreScreenModel } from "@/src/features/stores/selectors";
import { useTheme } from "@/src/theme";
import { formatCurrency } from "@/src/utils/format";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../src/components/ui/AppHeader";

export default function StoreDetailsScreen() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const basket = useBasketStore((state) => state.items);
  const usualStoreId = usePreferenceStore((state) => state.usualStoreId);
  const setUsualStore = usePreferenceStore((state) => state.setUsualStore);
  const clearUsualStore = usePreferenceStore((state) => state.clearUsualStore);
  const transportMode = usePreferenceStore((state) => state.transportMode);
  const weights = usePreferenceStore((state) => state.weights[transportMode]);
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
        <AppHeader
          title={t("store.notFound")}
          subtitle={t("store.loadError")}
        />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={["top", "left", "right", "bottom"]}
      >
        <AppHeader
          title={t("store.loading")}
          subtitle={t("store.loadingSubtitle")}
        />
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.textSecondary }}>
            {t("store.loadingStores")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["top", "left", "right", "bottom"]}>
        <AppHeader
          title={t("store.notFound")}
          subtitle={t("store.loadError")}
        />
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
    transportMode,
    weights,
  });

  if (!storeModel) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["top", "left", "right", "bottom"]}>
        <AppHeader
          title={t("store.notFound")}
          subtitle={t("store.loadError")}
        />
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
            {t("store.basketBreakdown")}
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
              flexDirection: "row",
              gap: 8,
              justifyContent: "space-between",
            }}
          >
            {[
              { label: t("store.totalLabel"), value: formatCurrency(storeModel.total) },
              { label: t("store.distanceLabel"), value: storeModel.distanceText },
              { label: t("store.missingLabel"), value: String(storeModel.missingCount) },
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
            {t("store.whyHere")}
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

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            {storeModel.isUsualStore ? (
              <View style={{ backgroundColor: theme.accentLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ color: theme.accentText, fontWeight: "700", fontSize: 12 }}>
                  {t("card.usualBadge")}
                </Text>
              </View>
            ) : <View />}

            <TouchableOpacity
              onPress={() => storeModel.isUsualStore ? clearUsualStore() : setUsualStore(storeModel.storeId)}
              style={{ backgroundColor: theme.statBg, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: "700" }}>
                {storeModel.isUsualStore ? t("card.removeUsual") : t("card.setUsual")}
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
            {t("store.productBreakdown")}
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
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ marginEnd: 12 }}>
                    <ProductImage
                      imageUrl={item.imageUrl}
                      emoji={item.emoji}
                      size={48}
                      backgroundColor={theme.statBg}
                      borderRadius={12}
                    />
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

                  <View style={{ marginStart: 16 }}>
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
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 20, padding: 16 }}>
            <Text style={{ fontWeight: "700", marginBottom: 6, color: theme.textPrimary }}>
              {t("store.lastUpdated")}
            </Text>
            <Text style={{ color: theme.textSecondary }}>
              {storeModel.updatedAtText}
            </Text>
          </View>

          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 20, padding: 16 }}>
            <Text style={{ fontWeight: "700", marginBottom: 6, color: theme.textPrimary }}>
              {t("store.foundInBasket")}
            </Text>
            <Text style={{ color: theme.textSecondary }}>
              {t("store.foundCount", {
                matched: storeModel.matchedCount,
                total: storeModel.matchedCount + storeModel.missingCount,
              })}
            </Text>
          </View>
        </View>

        <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 16 }}>
          <Text style={{ fontWeight: "700", marginBottom: 6, color: theme.textPrimary }}>
            {t("store.splitTripQuestion")}
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
            {t("store.openMap")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
