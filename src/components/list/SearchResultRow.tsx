import ProductImage from "@/src/components/products/ProductImage";
import { ItemCoverageStatus } from "@/src/domain/coverage/perItemCoverage";
import { useTheme } from "@/src/theme";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

type SearchResultRowProps = {
  name: string;
  subtitle?: string;
  brand?: string;
  emoji?: string;
  imageUrl?: string;
  coverage?: ItemCoverageStatus;
  quantity?: number;
  onAdd?: () => void;
  onIncrease?: () => void;
  onDecrease?: () => void;
};

export default function SearchResultRow({
  name,
  subtitle,
  brand,
  emoji,
  imageUrl,
  coverage,
  quantity = 0,
  onAdd,
  onIncrease,
  onDecrease,
}: SearchResultRowProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const coverageLabel =
    coverage?.kind === "nearby"
      ? {
          text: t("list.coverageNearby", { count: coverage.nearbyCount }),
          color: theme.accentText,
          bg: theme.accentLight,
        }
      : coverage?.kind === "none_nearby"
        ? {
            text: t("list.coverageNoneNearby"),
            color: theme.warningTextDark,
            bg: theme.warningBg,
          }
        : coverage?.kind === "none_anywhere"
          ? {
              text: t("list.coverageNoneAnywhere"),
              color: theme.warningTextDark,
              bg: theme.warningBg,
            }
          : null;

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: theme.cardBorder,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
          <ProductImage
            imageUrl={imageUrl}
            emoji={emoji}
            name={name}
            brand={brand}
            size={44}
            backgroundColor={theme.statBg}
            borderRadius={14}
          />

          <View style={{ flex: 1, alignItems: "flex-start" }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: theme.textPrimary,
                textAlign: "auto",
              }}
            >
              {name}
            </Text>

            {subtitle ? (
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: theme.textSecondary,
                  textAlign: "auto",
                }}
              >
                {subtitle}
              </Text>
            ) : null}

            {coverageLabel ? (
              <View
                style={{
                  marginTop: 8,
                  alignSelf: "flex-start",
                  backgroundColor: coverageLabel.bg,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    color: coverageLabel.color,
                    fontSize: 12,
                    fontWeight: "700",
                    textAlign: "auto",
                  }}
                >
                  {coverageLabel.text}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {quantity > 0 ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <TouchableOpacity
              onPress={onIncrease}
              hitSlop={10}
              style={{
                width: 26,
                height: 26,
                borderRadius: 9,
                backgroundColor: theme.textPrimary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ color: theme.background, fontSize: 14, fontWeight: "700" }}
              >
                +
              </Text>
            </TouchableOpacity>

            <View style={{ minWidth: 16, alignItems: "center" }}>
              <Text
                style={{ fontSize: 14, fontWeight: "700", color: theme.textPrimary }}
              >
                {quantity}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onDecrease}
              hitSlop={10}
              style={{
                width: 26,
                height: 26,
                borderRadius: 9,
                backgroundColor: theme.statBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ color: theme.textPrimary, fontSize: 14, fontWeight: "700" }}
              >
                −
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={onAdd}
            style={{
              backgroundColor: theme.textPrimary,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 14,
            }}
          >
            <Text
              style={{
                color: theme.background,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              {t("list.add")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
