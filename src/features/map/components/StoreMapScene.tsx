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
};

export default function StoreMapScene({ items, onOpenStore }: Props) {
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
    mapModel.bestStoreId ?? mapModel.markers[0]?.storeId ?? "",
  );

  useEffect(() => {
    setSelectedStoreId((current) => {
      if (mapModel.markers.some((store) => store.storeId === current)) {
        return current;
      }
      return mapModel.bestStoreId ?? mapModel.markers[0]?.storeId ?? "";
    });
  }, [mapModel.bestStoreId, mapModel.markers]);

  const selectedStore =
    mapModel.markers.find((s) => s.storeId === selectedStoreId) ??
    mapModel.markers[0];

  useEffect(() => {
    if (!selectedStore) return;
    mapRef.current?.animateToRegion(
      {
        latitude: selectedStore.lat,
        longitude: selectedStore.lng,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      },
      400,
    );
  }, [selectedStoreId, selectedStore]);

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
                onPress={() => setSelectedStoreId(store.storeId)}
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
                <Text
                  style={{
                    fontWeight: isActive ? "700" : "500",
                    color: isActive ? theme.background : theme.textPrimary,
                    fontSize: 13,
                    marginBottom: 2,
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {store.branchName || store.chainName}
                </Text>
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
            initialRegion={{
              latitude: 32.0853,
              longitude: 34.7818,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            }}
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
                  <TouchableOpacity
                    onPress={() => setSelectedStoreId(store.storeId)}
                    style={{
                      backgroundColor: store.color,
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      borderRadius: 12,
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOpacity: 0.15,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 3,
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: isSelected ? "white" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "700",
                        fontSize: 11,
                        textAlign: "center",
                      }}
                    >
                      {formatCurrency(store.total)}
                    </Text>
                  </TouchableOpacity>
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

