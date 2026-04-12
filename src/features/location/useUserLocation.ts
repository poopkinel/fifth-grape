import * as Location from "expo-location";
import { useEffect } from "react";
import { create } from "zustand";

export type UserCoords = {
  latitude: number;
  longitude: number;
};

type LocationState = {
  hasPermission: boolean;
  isLoading: boolean;
  userLocation: Location.LocationObject | null;
  userCoords: UserCoords | null;
  hasFetched: boolean;
  fetchLocation: () => Promise<void>;
};

const RETRY_DELAY_MS = 3000;

function coordsFromLocation(
  location: Location.LocationObject,
): UserCoords {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

const useLocationStore = create<LocationState>((set, get) => ({
  hasPermission: false,
  isLoading: true,
  userLocation: null,
  userCoords: null,
  hasFetched: false,

  fetchLocation: async () => {
    if (get().hasFetched) return;
    set({ hasFetched: true });

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === "granted";
      set({ hasPermission: granted });

      if (!granted) {
        set({ isLoading: false });
        return;
      }

      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) {
        set({
          userLocation: lastKnown,
          userCoords: coordsFromLocation(lastKnown),
          isLoading: false,
        });
      }

      const location = await Location.getCurrentPositionAsync({});
      set({
        userLocation: location,
        userCoords: coordsFromLocation(location),
        isLoading: false,
      });
    } catch {
      console.warn("Location unavailable — retrying shortly");
      set({ isLoading: false, hasFetched: false });
      setTimeout(() => {
        void get().fetchLocation();
      }, RETRY_DELAY_MS);
    }
  },
}));

type UseUserLocationResult = {
  hasPermission: boolean;
  isLoading: boolean;
  userLocation: Location.LocationObject | null;
  userCoords: UserCoords | null;
};

export function useUserLocation(): UseUserLocationResult {
  const hasPermission = useLocationStore((state) => state.hasPermission);
  const isLoading = useLocationStore((state) => state.isLoading);
  const userLocation = useLocationStore((state) => state.userLocation);
  const userCoords = useLocationStore((state) => state.userCoords);
  const fetchLocation = useLocationStore((state) => state.fetchLocation);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    hasPermission,
    isLoading,
    userLocation,
    userCoords,
  };
}
