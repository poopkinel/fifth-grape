import AppHeader from "@/src/components/ui/AppHeader";
import { usePreferenceStore } from "@/src/features/preferences/store";
import { applyLanguageAndReload, AppLanguage } from "@/src/i18n";
import { useTheme } from "@/src/theme";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WALK_PACE_M_PER_MIN = 80;

const WALK_CHIPS = [2, 5, 10, 15, 20, 30].map((minutes) => {
  const meters = minutes * WALK_PACE_M_PER_MIN;
  return { minutes, km: meters / 1000, meters };
});

const LANGUAGE_CHOICES: { code: AppLanguage; label: string }[] = [
  { code: "he", label: "עברית" },
  { code: "en", label: "English" },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  const language = usePreferenceStore((state) => state.language);
  const setLanguage = usePreferenceStore((state) => state.setLanguage);
  const maxWalkingDistanceKm = usePreferenceStore(
    (state) => state.maxWalkingDistanceKm,
  );
  const setMaxWalkingDistanceKm = usePreferenceStore(
    (state) => state.setMaxWalkingDistanceKm,
  );

  const formatMeters = (m: number) =>
    m >= 1000
      ? t("distance.kilometers", { value: (m / 1000).toFixed(1) })
      : t("distance.meters", { value: m });

  const handleLanguage = async (code: AppLanguage) => {
    if (code === language) return;
    setLanguage(code);
    await applyLanguageAndReload(code);
  };

  const renderChip = (
    key: string,
    selected: boolean,
    onPress: () => void,
    primary: string,
    secondary?: string,
  ) => (
    <TouchableOpacity
      key={key}
      onPress={onPress}
      style={{
        backgroundColor: selected ? theme.accent : theme.card,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: selected ? theme.accent : theme.cardBorder,
        minWidth: 110,
        alignItems: "center",
        gap: 2,
      }}
    >
      <Text
        style={{
          color: selected ? "white" : theme.textPrimary,
          fontWeight: "700",
          fontSize: 16,
        }}
      >
        {primary}
      </Text>
      {secondary ? (
        <Text
          style={{
            color: selected ? "rgba(255,255,255,0.85)" : theme.textSecondary,
            fontSize: 12,
          }}
        >
          {secondary}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={["top", "bottom", "left", "right"]}
    >
      <AppHeader title={t("settings.title")} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 28 }}>
        <View style={{ gap: 12 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: theme.textSecondary,
            }}
          >
            {t("settings.languageSection")}
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {LANGUAGE_CHOICES.map((choice) =>
              renderChip(
                `lang-${choice.code}`,
                language === choice.code,
                () => handleLanguage(choice.code),
                choice.label,
              ),
            )}
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: theme.textSecondary,
            }}
          >
            {t("settings.walkingSection")}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
            {t("settings.walkingHint")}
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {WALK_CHIPS.map((chip) =>
              renderChip(
                `walk-${chip.minutes}`,
                Math.abs(maxWalkingDistanceKm - chip.km) < 0.001,
                () => setMaxWalkingDistanceKm(chip.km),
                t("onboarding.minutes", { count: chip.minutes }),
                `≈ ${formatMeters(chip.meters)}`,
              ),
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
