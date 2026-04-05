import { useBasketStore } from "@/src/features/basket/store";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../src/components/ui/AppHeader";

export default function HomeScreen() {
  const router = useRouter();
  const items = useBasketStore((state) => state.items);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueCount = items.length;

  const hasBasket = uniqueCount > 0;

  // Keep current routes for now, until you rename /list/* to /basket/*.
  const basketEditorRoute = "/list/1";
  const compareRoute = "/list/compare";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }} edges={["top"]}>
      <AppHeader
        title="איפה הכי זול לקנות את הסל שלך?"
        subtitle="מה הכי משתלם לידך"
      />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 20,
          paddingBottom: 40,
          alignItems: "stretch"
        }}
      >
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
            <Text
              style={{
                color: "#d1fae5",
                
                marginBottom: 4,
                fontSize: 13,
              }}
            >
              הסל שלך
            </Text>

            <Text
              style={{
                color: "white",
                
                fontWeight: "700",
                fontSize: 22,
                marginBottom: 4,
              }}
            >
              {hasBasket ? `${uniqueCount} מוצרים` : "אין עדיין סל"}
            </Text>

            <Text
              style={{
                color: "#ecfdf5",
                
              }}
            >
              {hasBasket
                ? `${totalCount} פריטים בסך הכול`
                : "התחל להוסיף מוצרים כדי להשוות סניפים"}
            </Text>
          </View>
        </View>

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