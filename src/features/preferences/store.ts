import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { AppLanguage } from "@/src/i18n";
import { track } from "@/src/lib/analytics";

import { learnWeights } from "./learning";
import { DilemmaAnswer, ScoreWeights, TransportMode } from "./types";
import { getDefaultWeights } from "./weights";

type WeightsByMode = Record<TransportMode, ScoreWeights>;

type PreferenceStore = {
  usualStoreId?: string;
  transportMode: TransportMode;
  weights: WeightsByMode;
  answers: DilemmaAnswer[];
  maxWalkingDistanceKm: number;
  hasCompletedOnboarding: boolean;
  language?: AppLanguage;
  analyticsOptedOut: boolean;
  setUsualStore: (storeId: string) => void;
  clearUsualStore: () => void;
  setTransportMode: (mode: TransportMode) => void;
  setWeights: (mode: TransportMode, weights: ScoreWeights) => void;
  resetWeights: (mode: TransportMode) => void;
  recordAnswer: (answer: DilemmaAnswer) => void;
  clearAnswers: () => void;
  setMaxWalkingDistanceKm: (km: number) => void;
  completeOnboarding: () => void;
  setLanguage: (lang: AppLanguage) => void;
  setAnalyticsOptedOut: (optedOut: boolean) => void;
};

const DEFAULT_MAX_WALKING_KM = 1.2;

const DEFAULT_WEIGHTS: WeightsByMode = {
  foot: getDefaultWeights("foot"),
  car: getDefaultWeights("car"),
};

export const usePreferenceStore = create<PreferenceStore>()(
  persist(
    (set) => ({
      usualStoreId: undefined,
      transportMode: "car",
      weights: DEFAULT_WEIGHTS,
      answers: [],
      maxWalkingDistanceKm: DEFAULT_MAX_WALKING_KM,
      hasCompletedOnboarding: false,
      language: undefined,
      analyticsOptedOut: false,
      setUsualStore: (storeId) => {
        set({ usualStoreId: storeId });
        track("usual_store_set", { store_id: storeId });
      },
      clearUsualStore: () => {
        set({ usualStoreId: undefined });
        track("usual_store_cleared", {});
      },
      setTransportMode: (mode) => set({ transportMode: mode }),
      setWeights: (mode, weights) =>
        set((state) => ({
          weights: { ...state.weights, [mode]: weights },
        })),
      resetWeights: (mode) =>
        set((state) => ({
          weights: { ...state.weights, [mode]: getDefaultWeights(mode) },
        })),
      recordAnswer: (answer) =>
        set((state) => {
          const newAnswers = [...state.answers, answer];
          const learned = learnWeights(answer.transportMode, newAnswers);
          return {
            answers: newAnswers,
            weights: { ...state.weights, [answer.transportMode]: learned },
          };
        }),
      clearAnswers: () =>
        set({
          answers: [],
          weights: {
            foot: getDefaultWeights("foot"),
            car: getDefaultWeights("car"),
          },
        }),
      setMaxWalkingDistanceKm: (km) => set({ maxWalkingDistanceKm: km }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setLanguage: (lang) => set({ language: lang }),
      setAnalyticsOptedOut: (optedOut) => set({ analyticsOptedOut: optedOut }),
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
