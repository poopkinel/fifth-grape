import { useMarketData } from "@/src/data/market/useMarketData";
import { useTheme } from "@/src/theme";
import { formatCurrency } from "@/src/utils/format";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import ClusteredMapView from "react-native-map-clustering";
import { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { BasketItem } from "../../basket/types";
import { useUserLocation } from "../../location/useUserLocation";
import { usePreferenceStore } from "../../preferences/store";
import { getMapScreenModel } from "../selectors";

type Props = {
  items: BasketItem[];
  onOpenStore: (storeId: string) => void;
  /**
   * When set, the map opens centered + zoomed in on this store. Tap
   * navigation from the compare/store-details screens passes this so the
   * user lands on the pin they were just looking at instead of the cluster
   * fitted to all results. Default behavior (omitted) lands on the best
   * recommended store at city-level zoom.
   */
  focusStoreId?: string;
};

export default function StoreMapScene({ items, onOpenStore, focusStoreId }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { userCoords, hasPermission } = useUserLocation();
  const usualStoreId = usePreferenceStore((state) => state.usualStoreId);
  const transportMode = usePreferenceStore((state) => state.transportMode);
  const weights = usePreferenceStore((state) => state.weights[transportMode]);
  const { data, isLoading, error } = useMarketData(
    items.map((item) => item.productId),
  );
  const mapRef = useRef<any>(null);
  const isFocused = useIsFocused();

  const mapModel = data
    ? getMapScreenModel({
        basket: items,
        userCoords,
        usualStoreId,
        stores: data.stores,
        prices: data.prices,
        transportMode,
        weights,
      })
    : { markers: [], bestStoreId: undefined };

  const [selectedStoreId, setSelectedStoreId] = useState(
    focusStoreId ?? mapModel.bestStoreId ?? mapModel.markers[0]?.storeId ?? "",
  );

  useEffect(() => {
    setSelectedStoreId((current) => {
      if (mapModel.markers.some((store) => store.storeId === current)) {
        return current;
      }
      return focusStoreId ?? mapModel.bestStoreId ?? mapModel.markers[0]?.storeId ?? "";
    });
  }, [focusStoreId, mapModel.bestStoreId, mapModel.markers]);

  const selectedStore =
    mapModel.markers.find((s) => s.storeId === selectedStoreId) ??
    mapModel.markers[0];

  // Animate the map ONCE — when markers first arrive — to land on the right
  // store at the right zoom. Re-running on every selectedStoreId change would
  // yank the camera back to a fixed delta on every marker tap, which feels
  // like an unwanted zoom-out for users who'd panned/zoomed in.
  const hasAnimatedOnceRef = useRef(false);
  useEffect(() => {
    if (hasAnimatedOnceRef.current) return;
    if (!selectedStore) return;
    // focused arrival from recommendations → tight street-level zoom on the
    // tapped store. Cold map tab open → city-level so the cluster is visible.
    const delta = focusStoreId ? 0.008 : 0.04;
    mapRef.current?.animateToRegion(
      {
        latitude: selectedStore.lat,
        longitude: selectedStore.lng,
        latitudeDelta: delta,
        longitudeDelta: delta,
      },
      400,
    );
    hasAnimatedOnceRef.current = true;
  }, [selectedStore, focusStoreId]);

  if (isLoading || !data) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ color: theme.textSecondary }}>{t("map.loading")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ color: theme.textSecondary }}>{t("map.loadError")}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 14 }}>
      <View style={{ backgroundColor: theme.card, borderRadius: 22, padding: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {mapModel.markers.map((store) => {
            const isActive = selectedStoreId === store.storeId;
            return (
              <TouchableOpacity
                key={store.storeId}
                onPress={() => {
                  setSelectedStoreId(store.storeId);
                  // Pan only — preserves current zoom level. animateToRegion
                  // would also overwrite latitudeDelta/longitudeDelta and yank
                  // the user back to a fixed zoom on every pill tap.
                  mapRef.current?.animateCamera(
                    { center: { latitude: store.lat, longitude: store.lng } },
                    { duration: 400 },
                  );
                }}
                style={{
                  minWidth: 100,
                  backgroundColor: isActive ? theme.textPrimary : theme.card,
                  borderRadius: 16,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderWidth: isActive ? 0 : 1,
                  borderColor: theme.cardBorder,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 2,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: store.color,
                    }}
                  />
                  <Text
                    style={{
                      fontWeight: isActive ? "700" : "500",
                      color: isActive ? theme.background : theme.textPrimary,
                      fontSize: 13,
                      textAlign: "center",
                    }}
                    numberOfLines={1}
                  >
                    {store.branchName || store.chainName}
                  </Text>
                </View>
                <Text
                  style={{
                    color: isActive ? theme.textMuted : theme.textSecondary,
                    fontSize: 12,
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {store.distanceText}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: theme.card,
          borderRadius: 24,
          overflow: "hidden",
        }}
      >
        {isFocused ? (
          <ClusteredMapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            showsUserLocation={hasPermission}
            style={{ flex: 1 }}
            // Center the initial render on the recommended store when we
            // already have one — animateToRegion fires below for subsequent
            // selection changes, but the first paint should land where the
            // user's eye should be, not on a generic Tel Aviv center.
            initialRegion={
              selectedStore
                ? {
                    latitude: selectedStore.lat,
                    longitude: selectedStore.lng,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04,
                  }
                : {
                    latitude: 32.0853,
                    longitude: 34.7818,
                    latitudeDelta: 0.08,
                    longitudeDelta: 0.08,
                  }
            }
            clusterColor={theme.accentText}
            radius={60}
          >
            {mapModel.markers.map((store) => {
              const isSelected = selectedStore?.storeId === store.storeId;
              return (
                <Marker
                  key={store.storeId}
                  coordinate={{ latitude: store.lat, longitude: store.lng }}
                  onPress={() => setSelectedStoreId(store.storeId)}
                >
                  <View
                    // Halo wrapper — only renders for BEST. White ring on the
                    // dark map gives the pin a strong "this is the answer"
                    // glow without depending on color saturation alone.
                    style={
                      store.isBest
                        ? {
                            padding: 3,
                            borderRadius: 16,
                            backgroundColor: "rgba(255,255,255,0.95)",
                            shadowColor: "#22c55e",
                            shadowOpacity: 0.5,
                            shadowRadius: 10,
                            shadowOffset: { width: 0, height: 0 },
                            elevation: 8,
                          }
                        : null
                    }
                  >
                    <TouchableOpacity
                      onPress={() => setSelectedStoreId(store.storeId)}
                      style={{
                        backgroundColor: store.color,
                        // Best pin gets ~1.3x footprint so it reads as the
                        // primary call-to-action; non-best pins read as
                        // alternatives. Selected non-best pin returns to full
                        // opacity so the user gets clear feedback on tap.
                        paddingHorizontal: store.isBest ? 11 : 8,
                        paddingVertical: store.isBest ? 7 : 5,
                        borderRadius: 12,
                        alignItems: "center",
                        shadowColor: "#000",
                        shadowOpacity: store.isBest ? 0 : 0.15,
                        shadowRadius: 6,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: store.isBest ? 0 : 3,
                        opacity: store.isBest || isSelected ? 1 : 0.7,
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: isSelected ? "white" : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontWeight: "700",
                          fontSize: store.isBest ? 14 : 11,
                          textAlign: "center",
                        }}
                      >
                        {formatCurrency(store.total)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Marker>
              );
            })}
          </ClusteredMapView>
        ) : null}

        {selectedStore ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onOpenStore(selectedStore.storeId)}
            style={{
              position: "absolute",
              left: 12,
              right: 12,
              bottom: 12,
              backgroundColor: theme.card,
              borderRadius: 18,
              paddingVertical: 12,
              paddingHorizontal: 16,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: theme.textPrimary,
                }}
                numberOfLines={1}
              >
                {selectedStore.branchName || selectedStore.chainName}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <Text style={{ color: theme.accentText, fontWeight: "700", fontSize: 14 }}>
                  {formatCurrency(selectedStore.total)}
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                  {selectedStore.distanceText}
                </Text>
                {selectedStore.missingCount > 0 && (
                  <Text style={{ color: theme.warningText, fontSize: 13 }}>
                    {t("map.missingShort", { count: selectedStore.missingCount })}
                  </Text>
                )}
              </View>
            </View>

            <View
              style={{
                backgroundColor: theme.textPrimary,
                borderRadius: 12,
                paddingVertical: 8,
                paddingHorizontal: 14,
              }}
            >
              <Text style={{ color: theme.background, fontWeight: "700", fontSize: 13 }}>
                {t("map.details")}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

