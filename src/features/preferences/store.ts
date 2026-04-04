import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type PreferenceStore = {
  usualStoreId?: string;
  setUsualStore: (storeId: string) => void;
  clearUsualStore: () => void;
};

export const usePreferenceStore = create<PreferenceStore>()(
  persist(
    (set) => ({
      usualStoreId: undefined,
      setUsualStore: (storeId) => set({ usualStoreId: storeId }),
      clearUsualStore: () => set({ usualStoreId: undefined }),
    }),
    {
      name: "preferences-storage",
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
