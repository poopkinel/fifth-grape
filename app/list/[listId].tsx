import { DATA_SOURCE } from "@/src/data/config/dataSource";
import { useProductSearch } from "@/src/data/remote/useProductSearch";
import { useBasketStore } from "@/src/features/basket/store";
import { Product } from "@/src/features/products/types";
import { useTheme } from "@/src/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ListItemRow from "../../src/components/list/ListItemRow";
import SearchResultRow from "../../src/components/list/SearchResultRow";
import AppHeader from "../../src/components/ui/AppHeader";
import { realProducts } from "../../src/lib/constants/realProducts";

export default function ListScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["top", "left", "right"]}>
      <AppHeader
        title={t("list.headerTitle")}
        subtitle={t("list.headerSubtitle", { count: totalCount })}
      />

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
          placeholder={t("list.searchPlaceholder")}
          placeholderTextColor={theme.textMuted}
          style={{
            backgroundColor: theme.inputBg,
            color: theme.textPrimary,
            padding: 14,
            borderRadius: 16,
            textAlign: "auto",
            borderWidth: 1,
            borderColor: theme.cardBorder,
          }}
        />
        {results.length > 0 && (
          <Text
            style={{
              textAlign: "auto",
              fontSize: 14,
              fontWeight: "700",
              color: theme.textSecondary,
              marginBottom: 4,
            }}
          >
            {t("list.searchResults")}
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
                imageUrl={item.imageUrl}
                badge={item.brand ?? item.category}
                onAdd={() =>
                  addItem({
                    productId: item.productId,
                    name: item.name,
                    brand: item.brand,
                    unit: item.unit,
                    barcode: item.barcode,
                    emoji: item.emoji,
                    imageUrl: item.imageUrl,
                  })
                }
              />
            ))}
          </View>
        ) : null}

        {query.trim().length > 0 && results.length === 0 ? (
          <Text style={{ textAlign: "auto", color: theme.textSecondary }}>
            {isSearching ? t("list.searching") : t("list.noResults")}
          </Text>
        ) : null}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              textAlign: "auto",
              fontSize: 14,
              fontWeight: "700",
              color: theme.textPrimary,
            }}
          >
            {t("list.yourList")}
          </Text>

          {items.length > 0 ? (
            <TouchableOpacity
              onPress={clearBasket}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: theme.statBg,
              }}
            >
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 13,
                  fontWeight: "700",
                }}
              >
                {t("list.clearAll")}
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
              imageUrl={item.imageUrl}
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
          backgroundColor: theme.card,
          borderTopWidth: 1,
          borderTopColor: theme.cardBorder,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/list/compare")}
          style={{
            backgroundColor: theme.accent,
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
            {t("list.compareNearby")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
