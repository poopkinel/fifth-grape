import { usePreferenceStore } from "@/src/features/preferences/store";
import {
  AppLanguage,
  detectDeviceLanguage,
  initI18n,
  isRtlLanguage,
} from "@/src/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { I18nManager, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const apply = () => {
      if (cancelled) return;
      const persisted = usePreferenceStore.getState().language;
      const language: AppLanguage = persisted ?? detectDeviceLanguage();
      const wantRtl = isRtlLanguage(language);
      initI18n(language);
      if (I18nManager.isRTL !== wantRtl) {
        I18nManager.allowRTL(wantRtl);
        I18nManager.forceRTL(wantRtl);
        Updates.reloadAsync().catch(() => {
          if (!cancelled) setReady(true);
        });
        return;
      }
      setReady(true);
    };

    if (usePreferenceStore.persist.hasHydrated()) {
      apply();
      return () => {
        cancelled = true;
      };
    }

    const unsub = usePreferenceStore.persist.onFinishHydration(apply);
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: "#000" }} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
