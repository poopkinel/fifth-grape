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
  toLng: number
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
  if (distanceKm === null) return "—";

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} מ׳`;
  }

  if (Number.isInteger(distanceKm)) {
    return `${distanceKm} ק״מ`;
  }

  return `${distanceKm.toFixed(1)} ק״מ`;
}

export function getDistanceInfo(
  userCoords: UserCoords | null,
  store: Store | null
): DistanceInfo {
  if (!userCoords || !store) {
    return {
      distanceKm: null,
      distanceText: "—",
    };
  }

  const distanceKm = getDistanceKm(
    userCoords.latitude,
    userCoords.longitude,
    store.lat,
    store.lng
  );

  return {
    distanceKm,
    distanceText: formatDistanceKm(distanceKm),
  };
}