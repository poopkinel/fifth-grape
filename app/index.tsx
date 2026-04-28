import { usePreferenceStore } from "@/src/features/preferences/store";
import { Redirect } from "expo-router";

export default function Index() {
  const hasCompletedOnboarding = usePreferenceStore(
    (state) => state.hasCompletedOnboarding,
  );
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }
  return <Redirect href="/(tabs)/home" />;
}
