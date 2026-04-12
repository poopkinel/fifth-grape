import { DATA_SOURCE } from "@/src/data/config/dataSource";
import { useProductSearch } from "@/src/data/remote/useProductSearch";
import { useBasketStore } from "@/src/features/basket/store";
import { Product } from "@/src/features/products/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ListItemRow from "../../src/components/list/ListItemRow";
import SearchResultRow from "../../src/components/list/SearchResultRow";
import AppHeader from "../../src/components/ui/AppHeader";
import { realProducts } from "../../src/lib/constants/realProducts";

export default function ListScreen() {
  const router = useRouter();

  const items = useBasketStore((state) => state.items);
  const addItem = useBasketStore((state) => state.addItem);
  const increaseQuantity = useBasketStore((state) => state.increaseQuantity);
  const decreaseQuantity = useBasketStore((state) => state.decreaseQuantity);
  const clearBasket = useBasketStore((state) => state.clearBasket);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const [query, setQuery] = useState("");

  const isRemote = DATA_SOURCE === "remote";
  const { data: remoteResults, isLoading: isSearching } = useProductSearch(
    isRemote ? query : "",
  );

  const localResults: Product[] = isRemote
    ? []
    : realProducts.filter((item) => {
        const q = query.trim().toLowerCase();
        if (!q) return false;

        const searchable = [
          item.name,
          item.brand ?? "",
          item.unit ?? "",
          item.barcode ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(q);
      });

  const results: Product[] = isRemote ? (remoteResults ?? []) : localResults;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }} edges={["top", "left", "right"]}>
      <AppHeader title="קניות שבועיות" subtitle={`${totalCount} מוצרים`} />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 12,
          paddingBottom: 120,
        }}
      >
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="הוסף מוצר..."
          placeholderTextColor="#9ca3af"
          style={{
            backgroundColor: "white",
            padding: 14,
            borderRadius: 16,
            textAlign: "right",
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
        />
        {results.length > 0 && (
          <Text
            style={{
              textAlign: "right",
              fontSize: 14,
              fontWeight: "700",
              color: "#6b7280",
              marginBottom: 4,
            }}
          >
            תוצאות חיפוש
          </Text>
        )}
        {query.trim().length > 0 ? (
          <View style={{ gap: 10 }}>
            {results.map((item) => (
              <SearchResultRow
                key={item.productId}
                name={item.name}
                subtitle={[item.brand, item.unit].filter(Boolean).join(" • ")}
                emoji={item.emoji}
                badge={item.brand ?? item.category}
                onAdd={() =>
                  addItem({
                    productId: item.productId,
                    name: item.name,
                    brand: item.brand,
                    unit: item.unit,
                    barcode: item.barcode,
                    emoji: item.emoji,
                  })
                }
              />
            ))}
          </View>
        ) : null}

        {query.trim().length > 0 && results.length === 0 ? (
          <Text style={{ textAlign: "right", color: "#6b7280" }}>
            {isSearching ? "מחפש…" : "לא נמצאו מוצרים"}
          </Text>
        ) : null}
                
        <View
          style={{
            flexDirection: "row-reverse",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              textAlign: "right",
              fontSize: 14,
              fontWeight: "700",
              color: "#111827",
            }}
          >
            ברשימה שלך
          </Text>

          {items.length > 0 ? (
            <TouchableOpacity
              onPress={clearBasket}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: "#f3f4f6",
              }}
            >
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: 13,
                  fontWeight: "700",
                }}
              >
                נקה הכל
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={{ gap: 10, marginTop: 8 }}>
          {items.map((item) => (
            <ListItemRow
              key={item.id}
              name={item.name}
              quantity={item.quantity}
              emoji={item.emoji}
              subtitle={item.subtitle}
              onIncrease={() => increaseQuantity(item.id)}
              onDecrease={() => decreaseQuantity(item.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/list/compare")}
          style={{
            backgroundColor: "#10b981",
            padding: 16,
            borderRadius: 16,
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
            השווה סניפים קרובים
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}