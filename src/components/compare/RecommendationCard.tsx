import { useTheme } from "@/src/theme";
import { formatCurrency } from "@/src/utils/format";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

type RecommendationCardProps = {
  title: string;
  chainName: string;
  chainColor: string;
  branchName: string;
  address?: string;
  total: number;
  distanceText: string;
  missingCount: number;
  reasonText: string;
  trustText: string;
  baselineText?: string;
  isBest?: boolean;
  isUsualStore?: boolean;
  isWalkable?: boolean;
  onPressDetails?: () => void;
  onPressMap?: () => void;
  onPressSetUsualStore?: () => void;
};

export default function RecommendationCard({
  title,
  chainName,
  chainColor,
  branchName,
  address,
  total,
  distanceText,
  missingCount,
  reasonText,
  trustText,
  baselineText,
  isBest = false,
  isUsualStore = false,
  isWalkable = false,
  onPressDetails,
  onPressMap,
  onPressSetUsualStore,
}: RecommendationCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  // Best card stays green in both modes; non-best adapts to theme
  const bgColor = isBest ? theme.accent : theme.card;
  const textColor = isBest ? "#ffffff" : theme.textPrimary;
  const subTextColor = isBest ? "#d1fae5" : theme.textSecondary;
  const statBg = isBest ? "rgba(255,255,255,0.12)" : theme.statBg;
  const borderWidth = isBest ? 0 : 1;
  const borderColor = theme.cardBorder;
  const showReasonText = reasonText !== title;

  return (
    <View
      style={{
        backgroundColor: bgColor,
        borderRadius: 20,
        padding: 16,
        borderWidth,
        borderColor,
        gap: 14,
      }}
    >
      {/* Chain identity stripe — only on non-BEST cards; BEST already wears
          its full-green background as the dominant signal. Helps the user
          tell two stacked-same-address chains apart at a glance. */}
      {!isBest ? (
        <View
          style={{
            height: 4,
            borderRadius: 999,
            backgroundColor: chainColor,
            alignSelf: "stretch",
            marginTop: -4,
            marginBottom: -8,
          }}
        />
      ) : null}
      <View style={{ alignItems: "flex-start" }}>
        <Text
          style={{
            color: subTextColor,
            fontSize: 13,
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: textColor,
            fontSize: 22,
            fontWeight: "700",
          }}
        >
          {chainName}
        </Text>
        <Text
          style={{
            color: textColor,
            fontSize: 14,
            fontWeight: "500",
            marginTop: 4,
            opacity: 0.9,
          }}
        >
          {branchName}
        </Text>
        {address ? (
          <Text
            style={{
              color: subTextColor,
              fontSize: 12,
            }}
          >
            {address}
          </Text>
        ) : null}
        {isUsualStore ? (
          <View
            style={{
              marginTop: 8,
              backgroundColor: isBest ? "rgba(255,255,255,0.14)" : theme.accentLight,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}
          >
            <Text
              style={{
                color: isBest ? "#ffffff" : theme.accentText,
                fontWeight: "700",
                fontSize: 12,
              }}
            >
              {t("card.usualBadge")}
            </Text>
          </View>
        ) : null}
        {showReasonText ? (
          <Text
            style={{
              color: textColor,
              marginTop: 8,
              fontWeight: "600",
            }}
          >
            {reasonText}
          </Text>
        ) : null}
        <Text
          style={{
            color: subTextColor,
            fontSize: 12,
            marginTop: showReasonText ? 4 : 12,
          }}
        >
          {trustText}
        </Text>
        {baselineText ? (
          <Text
            style={{
              color: subTextColor,
              marginTop: 4,
            }}
          >
            {baselineText}
          </Text>
        ) : null}
        <TouchableOpacity
          onPress={onPressSetUsualStore}
          style={{
            alignSelf: "flex-end",
            marginTop: 10,
            backgroundColor: isUsualStore ? "transparent" : isBest ? "rgba(255,255,255,0.14)" : theme.statBg,
            borderRadius: isUsualStore ? 0 : 999,
            paddingHorizontal: isUsualStore ? 0 : 12,
            paddingVertical: isUsualStore ? 0 : 8,
          }}
        >
          <Text
            style={{
              color: isUsualStore ? subTextColor : textColor,
              fontWeight: "700",
            }}
          >
            {isUsualStore ? t("card.removeUsual") : t("card.setUsual")}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: 8,
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: statBg,
            borderRadius: 14,
            paddingVertical: 12,
            paddingHorizontal: 10,
          }}
        >
          <Text
            style={{
              color: subTextColor,
              fontSize: 12,
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            {t("card.totalLabel")}
          </Text>
          <Text
            style={{
              color: textColor,
              fontSize: 18,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            {formatCurrency(total)}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: statBg,
            borderRadius: 14,
            paddingVertical: 12,
            paddingHorizontal: 10,
          }}
        >
          <Text
            style={{
              color: subTextColor,
              fontSize: 12,
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            {t("card.distanceLabel")}
          </Text>
          <Text
            style={{
              color: textColor,
              fontSize: 18,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            {isWalkable ? `🚶 ${distanceText}` : distanceText}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: statBg,
            borderRadius: 14,
            paddingVertical: 12,
            paddingHorizontal: 10,
          }}
        >
          <Text
            style={{
              color: subTextColor,
              fontSize: 12,
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            {t("card.missingLabel")}
          </Text>
          <Text
            style={{
              color: textColor,
              fontSize: 18,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            {missingCount}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          onPress={onPressDetails}
          style={{
            flex: 1,
            backgroundColor: isBest ? "#ffffff" : theme.textPrimary,
            paddingVertical: 14,
            borderRadius: 14,
          }}
        >
          <Text
            style={{
              color: isBest ? "#111827" : theme.background,
              textAlign: "center",
              fontWeight: "700",
            }}
          >
            {t("card.details")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPressMap}
          style={{
            flex: 1,
            backgroundColor: "transparent",
            paddingVertical: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: isBest ? "rgba(255,255,255,0.35)" : theme.cardBorder,
          }}
        >
          <Text
            style={{
              color: textColor,
              textAlign: "center",
              fontWeight: "700",
            }}
          >
            {t("card.openMap")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
