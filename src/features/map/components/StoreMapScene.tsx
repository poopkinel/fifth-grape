import { formatCurrency } from "@/src/utils/format";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { BasketItem } from "../../basket/types";
import { useUserLocation } from "../../location/useUserLocation";
import { getMapScreenModel } from "../selectors";

type Props = {
  items: BasketItem[];
  onOpenStore: (storeId: string) => void;
};

export default function StoreMapScene({ items, onOpenStore }: Props) {
  const { userCoords, hasPermission } = useUserLocation();
  const mapModel = getMapScreenModel(items, userCoords);
  const mapRef = useRef<MapView>(null);

  const [selectedStoreId, setSelectedStoreId] = useState(
    mapModel.bestStoreId ?? mapModel.markers[0]?.storeId ?? ""
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

  // Center map when selected store changes
  useEffect(() => {
    if (!selectedStore) return;
    mapRef.current?.animateToRegion(
      {
        latitude: selectedStore.lat,
        longitude: selectedStore.lng,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      },
      400
    );
  }, [selectedStoreId]);

  const isFocused = useIsFocused();

  return (
    <View style={{ flex: 1, padding: 16, gap: 14 }}>

      {/* Store selector tabs — lean: name + distance only */}
      <View style={{ backgroundColor: "white", borderRadius: 22, padding: 12 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {mapModel.markers.map((store) => {
            const isActive = selectedStoreId === store.storeId;
            return (
              <TouchableOpacity
                key={store.storeId}
                onPress={() => setSelectedStoreId(store.storeId)}
                style={{
                  flex: 1,
                  backgroundColor: isActive ? "#111827" : "#ffffff",
                  borderRadius: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  borderWidth: isActive ? 0 : 1,
                  borderColor: "#e5e7eb",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontWeight: isActive ? "700" : "500",
                    color: isActive ? "white" : "#111827",
                    marginBottom: 4,
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {store.chainName}
                </Text>
                <Text
                  style={{
                    color: isActive ? "#cbd5e1" : "#6b7280",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  {store.distanceText}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Map */}
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          borderRadius: 24,
          overflow: "hidden",
        }}
      >
        {isFocused ? (
          <MapView
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
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 16,
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 3,
                      borderWidth: isSelected ? 3 : 0,
                      borderColor: isSelected ? "#111827" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "700",
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    >
                      {formatCurrency(store.total)}
                    </Text>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        fontSize: 11,
                        fontWeight: "500",
                        textAlign: "center",
                        marginTop: 2,
                      }}
                    >
                      {store.chainName}
                    </Text>
                  </TouchableOpacity>
                </Marker>
              );
            })}
          </MapView>
        ) : null}

        {/* Bottom sheet — all detail lives here, not repeated elsewhere */}
        {selectedStore ? (
          <View
            style={{
              position: "absolute",
              left: 12,
              right: 12,
              bottom: 12,
              backgroundColor: "white",
              borderRadius: 22,
              paddingTop: 10,
              paddingHorizontal: 18,
              paddingBottom: 18,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            }}
          >
            {/* Drag handle */}
            <View
              style={{
                width: 36,
                height: 4,
                backgroundColor: "#e5e7eb",
                borderRadius: 999,
                alignSelf: "center",
                marginBottom: 14,
              }}
            />

            <View
              style={{
                flexDirection: "row-reverse",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 14,
                gap: 12,
              }}
            >
              {/* Completeness badge */}
              <View
                style={{
                  backgroundColor: selectedStoreId === mapModel.bestStoreId ? "#d1fae5" : "#fef3c7",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    color: selectedStore.missingCount === 0 ? "#065f46" : "#92400e",
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                >
                  {selectedStoreId === mapModel.bestStoreId
                    ? "הבחירה הטובה ביותר"
                    : `${selectedStore.missingCount} חסרים`}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#111827",
                    marginBottom: 8
                  }}
                >
                  {selectedStore.chainName}
                </Text>

                {/* Three scoring signals as chips — makes "why best" transparent */}
                <View style={{ 
                  flexDirection: "row-reverse", 
                  gap: 6, 
                  flexWrap: "wrap", 
                  justifyContent: "flex-end",
                  width: "100%",
                }}
                  >
                  <ScoreChip
                    icon=""
                    label={formatCurrency(selectedStore.total)}
                  />
                  <ScoreChip icon="📍" label={selectedStore.distanceText} />
                  <ScoreChip icon="" label={selectedStore.missingCount === 0
                    ? "✓ הכל נמצא"
                    : `${selectedStore.missingCount} חסרים`} />
                  <ScoreChip icon="🕐" label={selectedStore.trustText} />
                </View>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => onOpenStore(selectedStore.storeId)}
                style={{
                  flex: 1,
                  backgroundColor: "#111827",
                  paddingVertical: 14,
                  borderRadius: 14,
                }}
              >
                <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
                  פרטים
                </Text>
              </TouchableOpacity>

              {/* <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#f3f4f6",
                  paddingVertical: 14,
                  borderRadius: 14,
                }}
              >
                <Text style={{ color: "#111827", textAlign: "center", fontWeight: "700" }}>
                  נווט לשם
                </Text>
              </TouchableOpacity> */}
            </View>
          </View>
        ) : null}
      </View>

    </View>
  );
}

// Chip showing a single scoring signal, optionally highlighted
function ScoreChip({
  icon,
  label,
  highlight,
  highlightLabel,
}: {
  icon: string;
  label: string;
  highlight?: boolean;
  highlightLabel?: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row-reverse",
        alignItems: "center",
        gap: 4,
        backgroundColor: highlight ? "#d1fae5" : "#f3f4f6",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
      }}
    >
      <Text style={{ fontSize: 12 }}>{icon}</Text>
      <Text
        style={{
          fontSize: 12,
          fontWeight: highlight ? "700" : "500",
          color: highlight ? "#065f46" : "#374151",
        }}
      >
        {highlightLabel ? `${label} · ${highlightLabel}` : label}
      </Text>
    </View>
  );
}
