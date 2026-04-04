import { useBasketStore } from "@/src/features/basket/store";
import { useUserLocation } from "@/src/features/location/useUserLocation";
import { getStoreScreenModel } from "@/src/features/stores/selectors";
import { formatCurrency } from "@/src/utils/format";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import AppHeader from "../../src/components/ui/AppHeader";

export default function StoreDetailsScreen() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const router = useRouter();
  const basket = useBasketStore((state) => state.items);
  const { userCoords } = useUserLocation();

  if (!storeId) return null;

  const storeModel = getStoreScreenModel(basket, storeId, userCoords);

  if (!storeModel) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        <AppHeader title="סניף לא נמצא" subtitle="לא הצלחנו לטעון את פרטי הסניף" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <AppHeader title={storeModel.title} subtitle={storeModel.subtitle} />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          paddingBottom: 32,
        }}
      >
        <View
          style={{
            backgroundColor: "#10b981",
            borderRadius: 20,
            padding: 16,
          }}
        >
          <Text
            style={{
              color: "#d1fae5",
              textAlign: "right",
              marginBottom: 4,
            }}
          >
            פירוט לפי הסל הנוכחי שלך
          </Text>

          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "700",
              textAlign: "right",
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
            <View
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
                סה״כ
              </Text>
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                {formatCurrency(storeModel.total)}
              </Text>
            </View>

            <View
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
                מרחק
              </Text>
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                {storeModel.distanceText}
              </Text>
            </View>

            <View
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
                חסרים
              </Text>
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                {storeModel.missingCount}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 16,
          }}
        >
          <Text
            style={{
              textAlign: "right",
              fontSize: 16,
              fontWeight: "700",
              marginBottom: 12,
              color: "#111827",
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
                    backgroundColor: "#ffffff",
                    borderRadius: 16,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: missing ? "#fde68a" : "#e5e7eb",
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
                        textAlign: "right",
                        fontWeight: "600",
                        color: "#111827",
                        marginBottom: 4,
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={{
                        textAlign: "right",
                        color: "#6b7280",
                        marginBottom: 2,
                      }}
                    >
                      {item.subtitle}
                    </Text>
                    <Text
                      style={{
                        textAlign: "right",
                        color: missing ? "#b45309" : "#6b7280",
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
                        color: missing ? "#b45309" : "#111827",
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

        <View style={{ flexDirection: "row-reverse", gap: 12 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: 20,
              padding: 16,
            }}
          >
            <Text
              style={{
                textAlign: "right",
                fontWeight: "700",
                marginBottom: 6,
                color: "#111827",
              }}
            >
              עדכון אחרון
            </Text>
            <Text style={{ textAlign: "right", color: "#6b7280" }}>
              {storeModel.updatedAtText}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: 20,
              padding: 16,
            }}
          >
            <Text
              style={{
                textAlign: "right",
                fontWeight: "700",
                marginBottom: 6,
                color: "#111827",
              }}
            >
              כדאי לפצל?
            </Text>
            <Text style={{ textAlign: "right", color: "#6b7280" }}>
              {storeModel.splitTripText}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/map/compare")}
          style={{
            backgroundColor: "#111827",
            borderRadius: 16,
            paddingVertical: 16,
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontWeight: "700",
            }}
          >
            פתח במפה
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}