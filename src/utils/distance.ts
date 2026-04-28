import i18n from "@/src/i18n";

import { UserCoords } from "../features/location/useUserLocation";
import { Store } from "../features/stores/types";

export type DistanceInfo = {
  distanceKm: number | null;
  distanceText: string;
};

export function getDistanceKm(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number {
  const R = 6371;

  const dLat = ((toLat - fromLat) * Math.PI) / 180;
  const dLon = ((toLng - fromLng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((fromLat * Math.PI) / 180) *
      Math.cos((toLat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistanceKm(distanceKm: number | null): string {
  if (distanceKm === null) return i18n.t("distance.unknown");

  if (distanceKm < 1) {
    return i18n.t("distance.meters", { value: Math.round(distanceKm * 1000) });
  }

  const value = Number.isInteger(distanceKm)
    ? `${distanceKm}`
    : distanceKm.toFixed(1);
  return i18n.t("distance.kilometers", { value });
}

export function getDistanceInfo(
  userCoords: UserCoords | null,
  store: Store | null,
): DistanceInfo {
  if (!userCoords || !store || store.lat == null || store.lng == null) {
    return {
      distanceKm: null,
      distanceText: i18n.t("distance.unknown"),
    };
  }

  const distanceKm = getDistanceKm(
    userCoords.latitude,
    userCoords.longitude,
    store.lat,
    store.lng,
  );

  return {
    distanceKm,
    distanceText: formatDistanceKm(distanceKm),
  };
}
