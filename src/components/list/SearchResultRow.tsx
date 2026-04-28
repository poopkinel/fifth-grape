import ProductImage from "@/src/components/products/ProductImage";
import { useTheme } from "@/src/theme";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

type SearchResultRowProps = {
  name: string;
  subtitle?: string;
  emoji?: string;
  imageUrl?: string;
  badge?: string;
  onAdd?: () => void;
};

export default function SearchResultRow({
  name,
  subtitle,
  emoji = "🥛",
  imageUrl,
  badge,
  onAdd,
}: SearchResultRowProps) {
  const theme = useTheme();
  const { t } = useTranslation();

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

            {badge ? (
              <View
                style={{
                  marginTop: 8,
                  alignSelf: "flex-start",
                  backgroundColor: theme.accentLight,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    color: theme.accentText,
                    fontSize: 12,
                    fontWeight: "700",
                    textAlign: "auto",
                  }}
                >
                  {badge}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

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
      </View>
    </View>
  );
}
