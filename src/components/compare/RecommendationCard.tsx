import { formatCurrency } from "@/src/utils/format";
import { Text, TouchableOpacity, View } from "react-native";

type RecommendationCardProps = {
  title: string;
  chainName: string;
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
  onPressDetails?: () => void;
  onPressMap?: () => void;
  onPressSetUsualStore?: () => void;
};

export default function RecommendationCard({
  title,
  chainName,
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
              backgroundColor: isBest ? "rgba(255,255,255,0.14)" : "#ecfdf5",
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}
          >
            <Text
              style={{
                color: isBest ? "#ffffff" : "#047857",
                fontWeight: "700",
                
                fontSize: 12,
              }}
            >
              הסופר הרגיל שלך
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
            backgroundColor: isUsualStore ? "transparent" : isBest ? "rgba(255,255,255,0.14)" : "#f3f4f6",
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
            {isUsualStore ? "הסר מהרגיל" : "קבע כסופר הרגיל"}
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
