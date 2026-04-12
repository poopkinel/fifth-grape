import AppHeader from "@/src/components/ui/AppHeader";
import { useMarketData } from "@/src/data/market/useMarketData";
import { useBasketStore } from "@/src/features/basket/store";
import { getHomeScreenModel } from "@/src/features/home/selectors";
import { useUserLocation } from "@/src/features/location/useUserLocation";
import { usePreferenceStore } from "@/src/features/preferences/store";
import { realProducts } from "@/src/lib/constants/realProducts";
import { useRouter } from "expo-router";
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
  const items = useBasketStore((state) => state.items);
  const addItem = useBasketStore((state) => state.addItem);
  const usualStoreId = usePreferenceStore((state) => state.usualStoreId);
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
        })
      : null;

  const recommendation = homeModel?.recommendation ?? null;

  const basketEmojis = items
    .slice(0, 5)
    .map((item) => item.emoji ?? "🛒")
    .join("  ");

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f9fafb" }}
      edges={["top"]}
    >
      <AppHeader
        title="איפה הכי זול לקנות את הסל שלך?"
        subtitle="מה הכי משתלם לידך"
      />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 20,
          paddingBottom: 40,
          alignItems: "stretch",
        }}
      >
        {/* Location + Basket Summary Card */}
        <View
          style={{
            backgroundColor: "#10b981",
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
            השתמש במיקום שלי
          </Text>

          <Text
            style={{
              color: "#d1fae5",
              marginBottom: hasBasket ? 14 : 0,
            }}
          >
            תל אביב • רדיוס 5 ק״מ
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
                <Text style={{ fontSize: 22, marginBottom: 8 }}>
                  {basketEmojis}
                </Text>
                <Text
                  style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: 22,
                    marginBottom: 4,
                  }}
                >
                  {uniqueCount} מוצרים
                </Text>
                <Text style={{ color: "#ecfdf5" }}>
                  {totalCount} פריטים בסך הכול
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
                  אין עדיין סל
                </Text>
                <Text style={{ color: "#ecfdf5" }}>
                  התחל להוסיף מוצרים כדי להשוות סניפים
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Recommendation Card — only when basket has items */}
        {recommendation ? (
          <TouchableOpacity
            onPress={() => router.push(`/store/${recommendation.storeId}`)}
            activeOpacity={0.7}
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: "#a7f3d0",
              gap: 14,
            }}
          >
            <View>
              <Text
                style={{
                  color: "#047857",
                  fontSize: 13,
                  fontWeight: "700",
                  marginBottom: 4,
                }}
              >
                ההמלצה שלנו
              </Text>
              <Text
                style={{
                  color: "#111827",
                  fontSize: 22,
                  fontWeight: "700",
                }}
              >
                {recommendation.chainName}
              </Text>
              <Text style={{ color: "#6b7280", marginTop: 4 }}>
                {recommendation.branchName}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row-reverse",
                gap: 8,
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#ecfdf5",
                  borderRadius: 14,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                }}
              >
                <Text
                  style={{
                    color: "#047857",
                    fontSize: 12,
                    textAlign: "center",
                    marginBottom: 4,
                  }}
                >
                  סה״כ
                </Text>
                <Text
                  style={{
                    color: "#065f46",
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
                  backgroundColor: "#f3f4f6",
                  borderRadius: 14,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                }}
              >
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: 12,
                    textAlign: "center",
                    marginBottom: 4,
                  }}
                >
                  מרחק
                </Text>
                <Text
                  style={{
                    color: "#111827",
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
                    backgroundColor: "#fef3c7",
                    borderRadius: 14,
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "#92400e",
                      fontSize: 12,
                      textAlign: "center",
                      marginBottom: 4,
                    }}
                  >
                    חסרים
                  </Text>
                  <Text
                    style={{
                      color: "#b45309",
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

            <Text
              style={{
                color: "#047857",
                fontWeight: "600",
              }}
            >
              {recommendation.reasonText}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Quick Add Products — only when basket is empty */}
        {!hasBasket ? (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <Text
              style={{
                fontWeight: "700",
                fontSize: 18,
                color: "#111827",
                marginBottom: 4,
              }}
            >
              מוצרים פופולריים
            </Text>
            <Text
              style={{
                color: "#6b7280",
                marginBottom: 14,
              }}
            >
              הוסף מוצרים בלחיצה כדי להתחיל
            </Text>

            <View
              style={{
                flexDirection: "row-reverse",
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
                    flexDirection: "row-reverse",
                    alignItems: "center",
                    backgroundColor: "#f3f4f6",
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
                      backgroundColor: "white",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{product.emoji}</Text>
                  </View>
                  <Text
                    style={{
                      color: "#111827",
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

        {/* CTA Buttons */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 24,
            padding: 20,
            shadowColor: "#000",
            shadowOpacity: 0.04,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 1,
            alignItems: "stretch",
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              fontSize: 18,
              color: "#111827",
              marginBottom: 6,
            }}
          >
            {hasBasket ? "הסל שלך מוכן להשוואה" : "אין עדיין סל"}
          </Text>

          <Text
            style={{
              color: "#6b7280",
              marginBottom: 18,
              lineHeight: 20,
            }}
          >
            {hasBasket
              ? "אפשר לערוך את הסל או להשוות סניפים קרובים לפי מחיר, מרחק וזמינות"
              : "התחל להוסיף מוצרים כדי להשוות סניפים קרובים"}
          </Text>

          <View style={{ flexDirection: "row-reverse", gap: 10 }}>
            <TouchableOpacity
              disabled={!hasBasket}
              onPress={() => router.push(compareRoute as any)}
              style={{
                flex: 1,
                backgroundColor: hasBasket ? "#111827" : "#d1d5db",
                paddingVertical: 16,
                borderRadius: 16,
              }}
            >
              <Text
                style={{
                  color: hasBasket ? "white" : "#6b7280",
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                השווה עכשיו
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(basketEditorRoute as any)}
              style={{
                flex: 1,
                backgroundColor: "#f3f4f6",
                paddingVertical: 14,
                borderRadius: 14,
              }}
            >
              <Text
                style={{
                  color: "#111827",
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                {hasBasket ? "ערוך סל" : "התחל סל"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
