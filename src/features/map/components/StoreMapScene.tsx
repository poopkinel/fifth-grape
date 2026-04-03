import { formatCurrency } from "@/src/utils/format";
import { useIsFocused } from "@react-navigation/native";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
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

  const [selectedStoreId, setSelectedStoreId] = useState(
    mapModel.defaultSelectedStoreId ?? mapModel.markers[0]?.storeId ?? ""
  );

  const selectedStore =
    mapModel.markers.find((s) => s.storeId === selectedStoreId) ??
    mapModel.markers[0];

  const isFocused = useIsFocused();

  return (
      <View style={{ padding: 16, gap: 12, flex: 1 }}>
        
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 12,
            flexDirection: "row-reverse",
            gap: 8,
          }}
        >
          {mapModel.markers.map((store) => {
            const isActive = selectedStoreId === store.storeId;

            return (
                <TouchableOpacity
                    key={store.storeId}
                    onPress={() => setSelectedStoreId(store.storeId)}
                    style={{
                        backgroundColor: isActive ? "#111827" : "white",
                        padding: 12,
                        borderRadius: 14,
                    }}
                    >
                    <Text style={{ textAlign: "right" }}>
                        {store.chainName}
                    </Text>

                    <Text style={{ textAlign: "right" }}>
                        {store.distanceText}
                    </Text>
                </TouchableOpacity>
              );
          })}
        </View>

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
              provider={PROVIDER_GOOGLE}
              showsUserLocation={hasPermission}
              style={{ flex: 1 }}
              initialRegion={{
                latitude: 32.0853,
                longitude: 34.7818,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08
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
                    <View>
                      <TouchableOpacity
                        onPress={() => setSelectedStoreId(store.storeId)}
                        style={{
                          position: "relative",
                          backgroundColor: store.color,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderRadius: 16,
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
                      </TouchableOpacity>
                    </View>
                  </Marker>
                );
            })}
              
            </MapView>
          ): null}

          {selectedStore ? (
              <View
                style={{
                  position: "absolute",
                  left: 12,
                  right: 12,
                  bottom: 12,
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 16,
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    flexDirection: "row-reverse",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#d1fae5",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 999,
                    }}
                  >
                    <Text
                      style={{
                        color: "#065f46",
                        fontWeight: "700",
                        fontSize: 12,
                      }}
                    >
                      {selectedStore.badge}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#111827",
                        textAlign: "right",
                      }}
                    >
                      {selectedStore.chainName}
                    </Text>
                    <Text
                      style={{
                        color: "#6b7280",
                        textAlign: "right",
                      }}
                    >
                      {selectedStore.distanceText} • {selectedStore.missingCount} חסרים
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row-reverse", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => onOpenStore(selectedStore.storeId)}
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
                      פרטים
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
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
                      נווט לשם
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
        </View>

        <View
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 14,
          }}
        >
          <Text
            style={{
              textAlign: "right",
              fontWeight: "700",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            סניפים באזור
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row-reverse", gap: 10 }}>
              {mapModel.markers.map((store) => (
                <TouchableOpacity
                  key={store.storeId}
                  onPress={() => setSelectedStoreId(store.storeId)}
                  style={{
                    width: 180,
                    backgroundColor: selectedStore?.storeId === store.storeId ? "#ecfdf5" : "#f9fafb",
                    borderRadius: 16,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: selectedStore?.storeId === store.storeId ? "#34d399" : "#e5e7eb",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "right",
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: 4,
                    }}
                  >
                    {store.chainName}
                  </Text>
                  <Text
                    style={{
                      textAlign: "right",
                      color: "#6b7280",
                      marginBottom: 8,
                    }}
                  >
                    {store.distanceText} • {store.missingCount} חסרים
                  </Text>
                  <Text
                    style={{
                      textAlign: "right",
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {formatCurrency(store.total)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    )    
}
