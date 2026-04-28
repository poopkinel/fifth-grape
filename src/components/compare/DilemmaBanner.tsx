import { Dilemma } from "@/src/domain/recommendation/findDilemma";
import { RankedStore } from "@/src/domain/recommendation/types";
import { useTheme } from "@/src/theme";
import { formatDistanceKm } from "@/src/utils/distance";
import { formatCurrency } from "@/src/utils/format";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

const MARKER_COLOR_A = "#8b5cf6";
const MARKER_COLOR_B = "#f59e0b";
const TAP_FEEDBACK_MS = 90;

type LatLng = { latitude: number; longitude: number };

type Props = {
  dilemma: Dilemma;
  onPick: (pickedStoreId: string, rejectedStoreId: string) => void;
  onSkip: () => void;
  expanded?: boolean;
  maxWalkingDistanceKm: number;
  userCoords?: LatLng | null;
};

function computeRegion(points: LatLng[]): Region {
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const PAD = 1.6;
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * PAD, 0.005),
    longitudeDelta: Math.max((maxLng - minLng) * PAD, 0.005),
  };
}

type Outcome = "win" | "loss" | "tie";

function compare(a: number, b: number): Outcome {
  if (a === b) return "tie";
  return a < b ? "win" : "loss";
}

const MAX_MISSING_LIST = 3;

function formatMissingList(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length <= MAX_MISSING_LIST) return names.join(", ");
  const shown = names.slice(0, MAX_MISSING_LIST).join(", ");
  return `${shown} +${names.length - MAX_MISSING_LIST}`;
}

export default function DilemmaBanner({
  dilemma,
  onPick,
  onSkip,
  expanded = false,
  maxWalkingDistanceKm,
  userCoords,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { a, b } = dilemma;

  const sameChain = a.store.chainName === b.store.chainName;

  const aCoords =
    a.store.lat != null && a.store.lng != null
      ? { latitude: a.store.lat, longitude: a.store.lng }
      : null;
  const bCoords =
    b.store.lat != null && b.store.lng != null
      ? { latitude: b.store.lat, longitude: b.store.lng }
      : null;
  const mapPoints: LatLng[] = [];
  if (aCoords) mapPoints.push(aCoords);
  if (bCoords) mapPoints.push(bCoords);
  if (userCoords) mapPoints.push(userCoords);
  const showMap = aCoords && bCoords && mapPoints.length >= 2;
  const region = showMap ? computeRegion(mapPoints) : null;

  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleMarkerTap = (pickedId: string, rejectedId: string) => {
    setPendingId(pickedId);
    setTimeout(() => onPick(pickedId, rejectedId), TAP_FEEDBACK_MS);
  };

  const renderChoice = (
    store: RankedStore,
    other: RankedStore,
    otherId: string,
    markerColor: string,
  ) => {
    const priceOutcome = compare(store.total, other.total);
    const distOutcome = compare(
      store.distanceKm ?? Infinity,
      other.distanceKm ?? Infinity,
    );
    const missingOutcome = compare(store.missingCount, other.missingCount);

    const priceColor =
      priceOutcome === "win" ? theme.accentText : theme.textSecondary;
    const distColor =
      distOutcome === "win" ? theme.accentText : theme.textSecondary;
    const missingColor =
      missingOutcome === "win"
        ? theme.accentText
        : store.missingCount > 0
          ? theme.warningText
          : theme.textSecondary;

    return (
      <TouchableOpacity
        onPress={() => onPick(store.store.storeId, otherId)}
        style={{
          flex: 1,
          backgroundColor: theme.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.cardBorder,
          overflow: "hidden",
        }}
      >
        <View style={{ height: 5, backgroundColor: markerColor }} />
        <View
          style={{
            paddingVertical: expanded ? 18 : 12,
            paddingHorizontal: expanded ? 14 : 12,
            gap: expanded ? 14 : 10,
          }}
        >
        <View>
          {!sameChain && (
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
                marginBottom: 2,
              }}
              numberOfLines={1}
            >
              {store.store.chainName}
            </Text>
          )}
          <Text
            style={{
              color: theme.textPrimary,
              fontWeight: "700",
              fontSize: expanded ? 16 : 14,
            }}
            numberOfLines={2}
          >
            {store.store.branchName || store.store.chainName}
          </Text>
        </View>

        <View style={{ gap: expanded ? 8 : 4 }}>
          <View>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 11,
                marginBottom: 2,
              }}
            >
              {t("dilemma.priceLabel")}
            </Text>
            <Text
              style={{
                color: priceColor,
                fontWeight: priceOutcome === "win" ? "700" : "500",
                fontSize: expanded ? 22 : 18,
              }}
            >
              {formatCurrency(store.total)}
            </Text>
          </View>
          <View>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 11,
                marginBottom: 2,
              }}
            >
              {store.distanceKm != null && store.distanceKm <= maxWalkingDistanceKm
                ? t("dilemma.walkingDistance")
                : t("dilemma.byCar")}
            </Text>
            <Text
              style={{
                color: distColor,
                fontWeight: distOutcome === "win" ? "700" : "500",
                fontSize: expanded ? 18 : 14,
              }}
            >
              {store.distanceKm != null && store.distanceKm <= maxWalkingDistanceKm
                ? "🚶 "
                : "🚗 "}
              {formatDistanceKm(store.distanceKm)}
            </Text>
          </View>
          {(store.missingCount > 0 || other.missingCount > 0) && (
            <View>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 11,
                  marginBottom: 2,
                }}
              >
                {t("dilemma.availabilityLabel")}
              </Text>
              <Text
                style={{
                  color: missingColor,
                  fontWeight: missingOutcome === "win" ? "700" : "500",
                  fontSize: expanded ? 14 : 13,
                }}
                numberOfLines={expanded ? 3 : 2}
              >
                {store.missingCount === 0
                  ? t("dilemma.allAvailable")
                  : t("dilemma.missingPrefix", {
                      names: formatMissingList(store.missingProducts),
                    })}
              </Text>
            </View>
          )}
        </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        backgroundColor: theme.accentLight,
        borderRadius: 18,
        padding: expanded ? 18 : 14,
        borderWidth: 1,
        borderColor: theme.accentBorder,
        gap: expanded ? 16 : 12,
      }}
    >
      <Text
        style={{
          color: theme.accentTextDark,
          fontWeight: "700",
          fontSize: expanded ? 18 : 15,
        }}
      >
        {t("dilemma.title")}
      </Text>

      {showMap && region ? (
        <View
          style={{
            height: expanded ? 180 : 140,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={region}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            showsUserLocation={!!userCoords}
            toolbarEnabled={false}
            moveOnMarkerPress={false}
          >
            {aCoords && (
              <Marker
                coordinate={aCoords}
                onPress={() => handleMarkerTap(a.store.storeId, b.store.storeId)}
              >
                <View
                  style={{
                    backgroundColor: MARKER_COLOR_A,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 10,
                    opacity: pendingId === a.store.storeId ? 0.5 : 1,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "700", fontSize: 11 }}>
                    {formatCurrency(a.total)}
                  </Text>
                </View>
              </Marker>
            )}
            {bCoords && (
              <Marker
                coordinate={bCoords}
                onPress={() => handleMarkerTap(b.store.storeId, a.store.storeId)}
              >
                <View
                  style={{
                    backgroundColor: MARKER_COLOR_B,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 10,
                    opacity: pendingId === b.store.storeId ? 0.5 : 1,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "700", fontSize: 11 }}>
                    {formatCurrency(b.total)}
                  </Text>
                </View>
              </Marker>
            )}
          </MapView>
        </View>
      ) : null}

      <View style={{ flexDirection: "row", gap: 10 }}>
        {renderChoice(a, b, b.store.storeId, MARKER_COLOR_A)}
        {renderChoice(b, a, a.store.storeId, MARKER_COLOR_B)}
      </View>

      <TouchableOpacity onPress={onSkip} style={{ alignSelf: "flex-end" }}>
        <Text style={{ color: theme.accentText, fontSize: 13 }}>
          {t("common.skip")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
