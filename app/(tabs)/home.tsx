import AppHeader from "@/src/components/ui/AppHeader";
import ProductImage from "@/src/components/products/ProductImage";
import { useMarketData } from "@/src/data/market/useMarketData";
import { useBasketStore } from "@/src/features/basket/store";
import { getHomeScreenModel } from "@/src/features/home/selectors";
import { useUserLocation } from "@/src/features/location/useUserLocation";
import { usePreferenceStore } from "@/src/features/preferences/store";
import { realProducts } from "@/src/lib/constants/realProducts";
import { useTheme } from "@/src/theme";
import { useRouter } from "expo-router";
import { Settings as SettingsIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const POPULAR_PRODUCT_IDS = [
  "milk-tnuva-3-1l",
  "eggs-l-12",
  "bread-white-standard",
  "chicken-breast-kg",
  "tomatoes-kg",
  "bananas-kg",
];

const popularProducts = realProducts.filter((p) =>
  POPULAR_PRODUCT_IDS.includes(p.productId),
);

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const items = useBasketStore((state) => state.items);
  const addItem = useBasketStore((state) => state.addItem);
  const usualStoreId = usePreferenceStore((state) => state.usualStoreId);
  const transportMode = usePreferenceStore((state) => state.transportMode);
  const weights = usePreferenceStore((state) => state.weights[transportMode]);
  const { userCoords } = useUserLocation();
  const { data } = useMarketData(items.map((item) => item.productId));

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueCount = items.length;
  const hasBasket = uniqueCount > 0;

  const basketEditorRoute = "/list/1";
  const compareRoute = "/list/compare";

  const homeModel =
    hasBasket && data
      ? getHomeScreenModel({
          basket: items,
          stores: data.stores,
          prices: data.prices,
          userCoords,
          usualStoreId,
          transportMode,
          weights,
        })
      : null;

  const recommendation = homeModel?.recommendation ?? null;

  // Persisted basket items snapshot emoji/imageUrl at add-time, so a
  // server-side re-tagging wouldn't show until the user re-adds. Prefer
  // fresh values from market data when available, fall back to persisted
  // ones offline / pre-load.
  const freshProductByProductId = new Map(
    data?.products.map((p) => [p.productId, p]) ?? [],
  );
  const basketThumbnails = items.slice(0, 5).map((item) => {
    const fresh = freshProductByProductId.get(item.productId);
    return {
      productId: item.productId,
      imageUrl: fresh?.imageUrl ?? item.imageUrl,
      emoji: fresh?.emoji ?? item.emoji,
      name: item.name,
      brand: item.brand,
    };
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={["top"]}
    >
      <AppHeader
        title={t("home.title")}
        subtitle={t("home.subtitle")}
        trailing={
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            hitSlop={12}
            accessibilityLabel={t("settings.title")}
          >
            <SettingsIcon size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 20,
          paddingBottom: 40,
          alignItems: "stretch",
        }}
      >
        {/* Location + Basket Summary Card — stays green in both modes */}
        <View
          style={{
            backgroundColor: theme.accent,
            padding: 22,
            borderRadius: 24,
            alignItems: "stretch",
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "700",
              fontSize: 16,
              marginBottom: 4,
            }}
          >
            {t("home.useMyLocation")}
          </Text>

          <Text
            style={{
              color: "#d1fae5",
              marginBottom: hasBasket ? 14 : 0,
            }}
          >
            {t("home.locationHeader", { city: t("city.telAviv"), radius: 5 })}
          </Text>

          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: 18,
              padding: 18,
              marginTop: 6,
            }}
          >
            {hasBasket ? (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 6,
                    marginBottom: 10,
                  }}
                >
                  {basketThumbnails.map((thumb) => (
                    <ProductImage
                      key={thumb.productId}
                      imageUrl={thumb.imageUrl}
                      emoji={thumb.emoji}
                      name={thumb.name}
                      brand={thumb.brand}
                      size={36}
                      backgroundColor="rgba(255,255,255,0.18)"
                    />
                  ))}
                </View>
                <Text
                  style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: 22,
                    marginBottom: 4,
                  }}
                >
                  {t("home.uniqueProducts", { count: uniqueCount })}
                </Text>
                <Text style={{ color: "#ecfdf5", marginBottom: 14 }}>
                  {t("home.totalItems", { count: totalCount })}
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: 22,
                    marginBottom: 4,
                  }}
                >
                  {t("home.emptyBasket")}
                </Text>
                <Text style={{ color: "#ecfdf5", marginBottom: 14 }}>
                  {t("home.emptyBasketSubtitle")}
                </Text>
              </>
            )}

            <TouchableOpacity
              onPress={() => router.push(basketEditorRoute as any)}
              style={{
                backgroundColor: "white",
                paddingVertical: 12,
                borderRadius: 14,
              }}
            >
              <Text
                style={{
                  color: theme.accentTextDark,
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                {hasBasket ? t("home.editBasket") : t("home.startBasket")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommendation Card */}
        {recommendation ? (
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: theme.accentBorder,
              gap: 14,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push(`/store/${recommendation.storeId}`)}
              activeOpacity={0.7}
              style={{ gap: 14 }}
            >
              <View>
                <Text
                  style={{
                    color: theme.accentText,
                    fontSize: 13,
                    fontWeight: "700",
                    marginBottom: 4,
                  }}
                >
                  {t("home.ourRecommendation")}
                </Text>
                <Text
                  style={{
                    color: theme.textPrimary,
                    fontSize: 22,
                    fontWeight: "700",
                  }}
                >
                  {recommendation.chainName}
                </Text>
                <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
                  {recommendation.branchName}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: theme.accentLight,
                    borderRadius: 14,
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text
                    style={{
                      color: theme.accentText,
                      fontSize: 12,
                      textAlign: "center",
                      marginBottom: 4,
                    }}
                  >
                    {t("home.totalLabel")}
                  </Text>
                  <Text
                    style={{
                      color: theme.accentTextDark,
                      fontSize: 18,
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                  >
                    {recommendation.totalText}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    backgroundColor: theme.statBg,
                    borderRadius: 14,
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text
                    style={{
                      color: theme.textSecondary,
                      fontSize: 12,
                      textAlign: "center",
                      marginBottom: 4,
                    }}
                  >
                    {t("home.distanceLabel")}
                  </Text>
                  <Text
                    style={{
                      color: theme.textPrimary,
                      fontSize: 18,
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                  >
                    {recommendation.distanceText}
                  </Text>
                </View>

                {recommendation.missingCount > 0 && (
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: theme.warningBg,
                      borderRadius: 14,
                      paddingVertical: 12,
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.warningTextDark,
                        fontSize: 12,
                        textAlign: "center",
                        marginBottom: 4,
                      }}
                    >
                      {t("home.missingLabel")}
                    </Text>
                    <Text
                      style={{
                        color: theme.warningText,
                        fontSize: 18,
                        fontWeight: "700",
                        textAlign: "center",
                      }}
                    >
                      {recommendation.missingCount}
                    </Text>
                  </View>
                )}
              </View>

              {recommendation.reasonText ? (
                <Text
                  style={{
                    color: theme.accentText,
                    fontWeight: "600",
                  }}
                >
                  {recommendation.reasonText}
                </Text>
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(compareRoute as any)}
              style={{
                backgroundColor: theme.textPrimary,
                paddingVertical: 14,
                borderRadius: 14,
              }}
            >
              <Text
                style={{
                  color: theme.background,
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                {t("home.compareAlternatives")}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Quick Add Products — only when basket is empty */}
        {!hasBasket ? (
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: theme.cardBorder,
            }}
          >
            <Text
              style={{
                fontWeight: "700",
                fontSize: 18,
                color: theme.textPrimary,
                marginBottom: 4,
              }}
            >
              {t("home.popularProducts")}
            </Text>
            <Text
              style={{
                color: theme.textSecondary,
                marginBottom: 14,
              }}
            >
              {t("home.popularSubtitle")}
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {popularProducts.map((product) => (
                <TouchableOpacity
                  key={product.productId}
                  onPress={() =>
                    addItem({
                      productId: product.productId,
                      name: product.name,
                      brand: product.brand,
                      unit: product.unit,
                      barcode: product.barcode,
                      emoji: product.emoji,
                    })
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: theme.statBg,
                    borderRadius: 14,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      backgroundColor: theme.card,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{product.emoji}</Text>
                  </View>
                  <Text
                    style={{
                      color: theme.textPrimary,
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {product.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

      </ScrollView>
    </SafeAreaView>
  );
}
