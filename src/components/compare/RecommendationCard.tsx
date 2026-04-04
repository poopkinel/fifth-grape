import { formatCurrency } from "@/src/utils/format";
import { Text, TouchableOpacity, View } from "react-native";

type RecommendationCardProps = {
  title: string;
  chainName: string;
  total: number;
  distanceText: string;
  missingCount: number;
  reasonText: string;
  trustText: string;
  baselineText?: string;
  isBest?: boolean;
  isUsualStore?: boolean;
  onPressDetails?: () => void;
  onPressMap?: () => void;
  onPressSetUsualStore?: () => void;
};

export default function RecommendationCard({
  title,
  chainName,
  total,
  distanceText,
  missingCount,
  reasonText,
  trustText,
  baselineText,
  isBest = false,
  isUsualStore = false,
  onPressDetails,
  onPressMap,
  onPressSetUsualStore,
}: RecommendationCardProps) {
  const bgColor = isBest ? "#10b981" : "#ffffff";
  const textColor = isBest ? "#ffffff" : "#111827";
  const subTextColor = isBest ? "#d1fae5" : "#6b7280";
  const statBg = isBest ? "rgba(255,255,255,0.12)" : "#f3f4f6";
  const borderWidth = isBest ? 0 : 1;
  const borderColor = "#e5e7eb";

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
      <View style={{ alignItems: "flex-end" }}>
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
            textAlign: "right",
          }}
        >
          {chainName}
        </Text>
        <Text
          style={{
            color: textColor,
            textAlign: "right",
            marginTop: 8,
            fontWeight: "600",
          }}
        >
          {reasonText}
        </Text>
        <Text
          style={{
            color: subTextColor,
            textAlign: "right",
            marginTop: 4,
          }}
        >
          {trustText}
        </Text>
        {baselineText ? (
          <Text
            style={{
              color: subTextColor,
              textAlign: "right",
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
            backgroundColor: isBest ? "rgba(255,255,255,0.14)" : "#f3f4f6",
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              color: textColor,
              fontWeight: "700",
              textAlign: "right",
            }}
          >
            {isUsualStore ? "הסופר הרגיל שלך" : "קבע כסופר הרגיל"}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row-reverse",
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
            סה״כ
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
            מרחק
          </Text>
          <Text
            style={{
              color: textColor,
              fontSize: 18,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            {distanceText}
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
            חסרים
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

      <View style={{ flexDirection: "row-reverse", gap: 10 }}>
        <TouchableOpacity
          onPress={onPressDetails}
          style={{
            flex: 1,
            backgroundColor: isBest ? "#ffffff" : "#111827",
            paddingVertical: 14,
            borderRadius: 14,
          }}
        >
          <Text
            style={{
              color: isBest ? "#111827" : "#ffffff",
              textAlign: "center",
              fontWeight: "700",
            }}
          >
            ראה פירוט
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
            borderColor: isBest ? "rgba(255,255,255,0.35)" : "#d1d5db",
          }}
        >
          <Text
            style={{
              color: textColor,
              textAlign: "center",
              fontWeight: "700",
            }}
          >
            למפה
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
