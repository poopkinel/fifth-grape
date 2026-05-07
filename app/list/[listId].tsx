import BasketPeekSheet from "@/src/components/basket/BasketPeekSheet";
import { DATA_SOURCE } from "@/src/data/config/dataSource";
import { useMarketData } from "@/src/data/market/useMarketData";
import { useProductSearch } from "@/src/data/remote/useProductSearch";
import { computePerItemCoverage } from "@/src/domain/coverage/perItemCoverage";
import { useBasketStore } from "@/src/features/basket/store";
import { useUserLocation } from "@/src/features/location/useUserLocation";
import { pickProductName } from "@/src/features/products/displayName";
import { Product } from "@/src/features/products/types";
import { useTheme } from "@/src/theme";
import { formatRelativeUpdateTime } from "@/src/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
  const { t, i18n } = useTranslation();

  const items = useBasketStore((state) => state.items);
  const addItem = useBasketStore((state) => state.addItem);
  const increaseQuantity = useBasketStore((state) => state.increaseQuantity);
  const decreaseQuantity = useBasketStore((state) => state.decreaseQuantity);
  const clearBasket = useBasketStore((state) => state.clearBasket);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const { q: incomingQuery } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(incomingQuery ?? "");
  const [showBasket, setShowBasket] = useState(false);

  // Re-prefill when navigating in fresh from /home with a different ?q.
  // expo-router reuses the screen instance, so useState alone wouldn't pick
  // up a new param; this useEffect makes the seed query reactive without
  // overriding the user's own typing on the same visit.
  useEffect(() => {
    if (incomingQuery && incomingQuery !== query) {
      setQuery(incomingQuery);
    }
    // Intentionally not depending on `query` — we don't want this effect
    // re-running every keystroke and clobbering input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingQuery]);

  const isRemote = DATA_SOURCE === "remote";
  const { data: remoteResults, isLoading: isSearching } = useProductSearch(
    isRemote ? query : "",
  );

  const { userCoords } = useUserLocation();

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

  // Single lookup covering both the basket and current search results. The
  // selector then bins each productId into a coverage status used by both
  // ListItemRow and SearchResultRow.
  const productIdsToLookup = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.productId));
    results.forEach((r) => set.add(r.productId));
    return Array.from(set);
  }, [items, results]);

  const { data: marketData } = useMarketData(productIdsToLookup);

  const basketByProductId = useMemo(
    () => new Map(items.map((i) => [i.productId, i])),
    [items],
  );

  const coverageByProductId = useMemo(() => {
    if (!marketData) return null;
    const pseudoBasket = productIdsToLookup.map((productId) => ({
      id: productId,
      productId,
      name: "",
      quantity: 1,
    }));
    return computePerItemCoverage({
      basket: pseudoBasket,
      stores: marketData.stores,
      prices: marketData.prices,
      userCoords,
    });
  }, [productIdsToLookup, marketData, userCoords]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["top", "left", "right"]}>
      <AppHeader
        title={t("list.headerTitle")}
        subtitle={t("list.headerSubtitle", { count: totalCount })}
        trailing={
          <TouchableOpacity
            onPress={() => setShowBasket(true)}
            hitSlop={10}
            accessibilityLabel={t("list.yourList")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: theme.statBg,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
            }}
          >
            <Ionicons name="cart-outline" size={18} color={theme.textPrimary} />
            <Text
              style={{
                color: theme.textPrimary,
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              {totalCount}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 12,
          paddingBottom: 120,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.inputBg,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            paddingEnd: 6,
          }}
        >
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("list.searchPlaceholder")}
            placeholderTextColor={theme.textMuted}
            style={{
              flex: 1,
              color: theme.textPrimary,
              padding: 14,
              textAlign: "auto",
            }}
          />
          <TouchableOpacity
            onPress={() => router.push("/list/scan")}
            accessibilityLabel={t("list.scanBarcode")}
            hitSlop={8}
            style={{
              padding: 8,
              borderRadius: 12,
              backgroundColor: theme.statBg,
              marginEnd: 4,
            }}
          >
            <Ionicons name="barcode-outline" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
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
            {results.map((item) => {
              const basketItem = basketByProductId.get(item.productId);
              const displayName = pickProductName(
                item.name,
                item.nameEn,
                i18n.language,
              );
              return (
                <SearchResultRow
                  key={item.productId}
                  name={displayName}
                  subtitle={[item.brand, item.unit].filter(Boolean).join(" • ")}
                  brand={item.brand}
                  emoji={item.emoji}
                  imageUrl={item.imageUrl}
                  coverage={coverageByProductId?.get(item.productId)?.status}
                  quantity={basketItem?.quantity ?? 0}
                  onAdd={() =>
                    addItem({
                      productId: item.productId,
                      name: item.name,
                      nameEn: item.nameEn,
                      brand: item.brand,
                      unit: item.unit,
                      barcode: item.barcode,
                      emoji: item.emoji,
                      imageUrl: item.imageUrl,
                    })
                  }
                  onIncrease={
                    basketItem
                      ? () => increaseQuantity(basketItem.id)
                      : undefined
                  }
                  onDecrease={
                    basketItem
                      ? () => decreaseQuantity(basketItem.id)
                      : undefined
                  }
                />
              );
            })}
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
              name={pickProductName(item.name, item.nameEn, i18n.language)}
              quantity={item.quantity}
              brand={item.brand}
              emoji={item.emoji}
              imageUrl={item.imageUrl}
              subtitle={item.subtitle}
              coverage={coverageByProductId?.get(item.productId)?.status}
              onIncrease={() => increaseQuantity(item.id)}
              onDecrease={() => decreaseQuantity(item.id)}
            />
          ))}
        </View>

        {items.length > 0 ? (
          <Text
            style={{
              marginTop: 16,
              textAlign: "auto",
              fontSize: 12,
              color: theme.textMuted,
            }}
          >
            {marketData?.fetchedAt
              ? t("list.freshnessFooter", {
                  relative: formatRelativeUpdateTime(marketData.fetchedAt),
                })
              : t("list.freshnessFooterUnknown")}
          </Text>
        ) : null}
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

      <BasketPeekSheet
        visible={showBasket}
        onClose={() => setShowBasket(false)}
      />
    </SafeAreaView>
  );
}
