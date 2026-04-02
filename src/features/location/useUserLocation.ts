import * as Location from "expo-location";
import { useEffect, useMemo, useState } from "react";

export type UserCoords = {
  latitude: number;
  longitude: number;
};

type UseUserLocationResult = {
  hasPermission: boolean;
  isLoading: boolean;
  userLocation: Location.LocationObject | null;
  userCoords: UserCoords | null;
};

export function useUserLocation(): UseUserLocationResult {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (!mounted) return;

        const granted = status === "granted";
        setHasPermission(granted);

        if (!granted) {
          setIsLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});

        if (!mounted) return;

        setUserLocation(location);
      } catch (error) {
        console.error("Failed to get user location", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const userCoords = useMemo(() => {
    if (!userLocation) return null;

    return {
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
    };
  }, [userLocation]);

  return {
    hasPermission,
    isLoading,
    userLocation,
    userCoords,
  };
}