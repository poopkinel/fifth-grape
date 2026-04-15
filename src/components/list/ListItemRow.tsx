import { useTheme } from "@/src/theme";
import { Text, TouchableOpacity, View } from "react-native";

type ListItemRowProps = {
  name: string;
  quantity: number;
  subtitle?: string;
  emoji?: string;
  onIncrease?: () => void;
  onDecrease?: () => void;
  onPress?: () => void;
};

export default function ListItemRow({
  name,
  quantity,
  subtitle,
  emoji = "🛒",
  onIncrease,
  onDecrease,
  onPress,
}: ListItemRowProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
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
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: theme.statBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 22 }}>{emoji}</Text>
          </View>

          <View style={{ flex: 1, alignItems: "flex-start" }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: theme.textPrimary,
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
                }}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <View
          style={{
            flexDirection: "row-reverse",
            alignItems: "center",
            gap: 8,
          }}
        >
          <TouchableOpacity
            onPress={onIncrease}
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              backgroundColor: theme.textPrimary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: theme.background, fontSize: 18, fontWeight: "700" }}>+</Text>
          </TouchableOpacity>

          <View
            style={{
              minWidth: 28,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: theme.textPrimary,
              }}
            >
              {quantity}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onDecrease}
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              backgroundColor: theme.statBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: "700" }}>−</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
