import { useBasketStore } from "@/src/features/basket/store";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import AppHeader from "../../src/components/ui/AppHeader";
import { mockLists } from "../../src/lib/constants/mockData";

export default function HomeScreen() {
  const router = useRouter();
  const items = useBasketStore((state) => state.items);
  const resetToDemoBasket = useBasketStore((state) => state.resetToDemoBasket);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueCount = items.length;

  const hasBasket = totalCount > 0;

  const primaryCtaText = hasBasket ? "המשך לרשימה הפעילה" : "התחל רשימה חדשה";
  const primaryCtaRoute = "/list/1";

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <AppHeader title="איפה הכי זול לקנות את הסל שלך?" subtitle="מה הכי משתלם לידך" />

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
            padding: 18,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "700",
              textAlign: "right",
              fontSize: 16,
              marginBottom: 4,
            }}
          >
            השתמש במיקום שלי
          </Text>
          <Text
            style={{
              color: "#d1fae5",
              textAlign: "right",
              marginBottom: hasBasket ? 14 : 0,
            }}
          >
            תל אביב • רדיוס 5 ק״מ
          </Text>

          {hasBasket ? (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                borderRadius: 16,
                padding: 14,
                marginTop: 2,
              }}
            >
              <Text
                style={{
                  color: "#d1fae5",
                  textAlign: "right",
                  marginBottom: 4,
                  fontSize: 13,
                }}
              >
                הסל הנוכחי שלך
              </Text>
              <Text
                style={{
                  color: "white",
                  textAlign: "right",
                  fontWeight: "700",
                  fontSize: 18,
                  marginBottom: 4,
                }}
              >
                קניות שבועיות
              </Text>
              <Text
                style={{
                  color: "#ecfdf5",
                  textAlign: "right",
                }}
              >
                {uniqueCount} מוצרים שונים • {totalCount} פריטים בסך הכול
              </Text>
            </View>
          ) : null}
        </View>

        {hasBasket ? (
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
                textAlign: "right",
                fontWeight: "700",
                fontSize: 16,
                color: "#111827",
                marginBottom: 6,
              }}
            >
              אפשר להמשיך מאיפה שעצרת
            </Text>
            <Text
              style={{
                textAlign: "right",
                color: "#6b7280",
                marginBottom: 14,
              }}
            >
              הסל שלך נשמר. אפשר להמשיך לערוך או להשוות סניפים קרובים.
            </Text>

            <View style={{ flexDirection: "row-reverse", gap: 10 }}>
              <TouchableOpacity
                onPress={() => router.push("/list/compare")}
                style={{
                  flex: 1,
                  backgroundColor: "#111827",
                  paddingVertical: 14,
                  borderRadius: 14,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontWeight: "700",
                  }}
                >
                  השווה עכשיו
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/list/1")}
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
                  ערוך רשימה
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={resetToDemoBasket}
              style={{
                marginTop: 10,
                backgroundColor: "#fef2f2",
                paddingVertical: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#fecaca",
              }}
            >
              <Text
                style={{
                  color: "#b91c1c",
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                איפוס סל לבדיקה
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View>
          <Text
            style={{
              textAlign: "right",
              fontSize: 16,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 12,
            }}
          >
            הרשימות שלך
          </Text>

          <View style={{ gap: 10 }}>
            {mockLists.map((list) => (
              <TouchableOpacity
                key={list.id}
                onPress={() => router.push(`/list/${list.id}`)}
                style={{
                  backgroundColor: "white",
                  padding: 16,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                }}
              >
                <Text
                  style={{
                    textAlign: "right",
                    fontWeight: "700",
                    fontSize: 16,
                    color: "#111827",
                    marginBottom: 4,
                  }}
                >
                  {list.name}
                </Text>
                <Text
                  style={{
                    textAlign: "right",
                    color: "#6b7280",
                  }}
                >
                  {list.itemCount} מוצרים
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push(primaryCtaRoute as any)}
          style={{
            backgroundColor: "#111827",
            padding: 16,
            borderRadius: 18,
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontWeight: "700",
              fontSize: 16,
            }}
          >
            {primaryCtaText}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}