import { usePreferenceStore } from "@/src/features/preferences/store";
import { applyLanguageAndReload, AppLanguage } from "@/src/i18n";
import { useTheme } from "@/src/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const WALK_PACE_M_PER_MIN = 80;

type Chip = {
  minutes: number;
  km: number;
  meters: number;
};

const CHIPS: Chip[] = [2, 5, 10, 15, 20, 30].map((minutes) => {
  const meters = minutes * WALK_PACE_M_PER_MIN;
  const km = meters / 1000;
  return { minutes, km, meters };
});

const LANGUAGE_CHOICES: { code: AppLanguage; label: string; tagline: string }[] = [
  { code: "he", label: "עברית", tagline: "Hebrew" },
  { code: "en", label: "English", tagline: "אנגלית" },
];

type Step = "language" | "walking";

export default function OnboardingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const setMaxWalkingDistanceKm = usePreferenceStore(
    (state) => state.setMaxWalkingDistanceKm,
  );
  const completeOnboarding = usePreferenceStore(
    (state) => state.completeOnboarding,
  );
  const setLanguage = usePreferenceStore((state) => state.setLanguage);

  const [step, setStep] = useState<Step>("language");

  const handlePickLanguage = async (lang: AppLanguage) => {
    setLanguage(lang);
    if (i18n.language !== lang) {
      // changeLanguage only — full RTL flip happens on next reload via
      // applyLanguageAndReload. For onboarding we usually have the language
      // matching device default already, so this is rare.
      await applyLanguageAndReload(lang);
    }
    setStep("walking");
  };

  const handlePickDistance = (km: number) => {
    setMaxWalkingDistanceKm(km);
    completeOnboarding();
    router.replace("/(tabs)/home");
  };

  const handleSkipDistance = () => {
    completeOnboarding();
    router.replace("/(tabs)/home");
  };

  const formatMeters = (meters: number) => {
    if (meters >= 1000) {
      return t("distance.kilometers", { value: (meters / 1000).toFixed(1) });
    }
    return t("distance.meters", { value: meters });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={["top", "bottom", "left", "right"]}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 24,
          justifyContent: "space-between",
        }}
      >
        {step === "language" ? (
          <>
            <View style={{ gap: 12 }}>
              <Text
                style={{
                  color: theme.textPrimary,
                  fontSize: 26,
                  fontWeight: "700",
                  textAlign: "auto",
                }}
              >
                {t("language.title")}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
                justifyContent: "center",
              }}
            >
              {LANGUAGE_CHOICES.map((choice) => (
                <TouchableOpacity
                  key={choice.code}
                  onPress={() => handlePickLanguage(choice.code)}
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: 18,
                    paddingVertical: 22,
                    paddingHorizontal: 30,
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
                    minWidth: 150,
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Text
                    style={{
                      color: theme.textPrimary,
                      fontSize: 22,
                      fontWeight: "700",
                    }}
                  >
                    {choice.label}
                  </Text>
                  <Text
                    style={{
                      color: theme.textSecondary,
                      fontSize: 13,
                    }}
                  >
                    {choice.tagline}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View />
          </>
        ) : (
          <>
            <View style={{ gap: 12 }}>
              <Text
                style={{
                  color: theme.textPrimary,
                  fontSize: 26,
                  fontWeight: "700",
                  textAlign: "auto",
                }}
              >
                {t("onboarding.walkingTitle")}
              </Text>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 15,
                  textAlign: "auto",
                  lineHeight: 22,
                }}
              >
                {t("onboarding.walkingSubtitle")}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
                justifyContent: "center",
              }}
            >
              {CHIPS.map((chip) => (
                <TouchableOpacity
                  key={chip.minutes}
                  onPress={() => handlePickDistance(chip.km)}
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: 18,
                    paddingVertical: 18,
                    paddingHorizontal: 22,
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
                    minWidth: 132,
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Text
                    style={{
                      color: theme.textPrimary,
                      fontSize: 22,
                      fontWeight: "700",
                    }}
                  >
                    {t("onboarding.minutes", { count: chip.minutes })}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                    ≈ {formatMeters(chip.meters)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ gap: 10, alignItems: "center" }}>
              <TouchableOpacity onPress={handleSkipDistance}>
                <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
                  {t("common.skip")}
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  color: theme.textMuted,
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                {t("onboarding.footnote")}
              </Text>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
