import { useTheme } from "@/src/theme";
import { ReactNode } from "react";
import { Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export default function AppHeader({ title, subtitle, trailing }: Props) {
  const theme = useTheme();

  return (
    <View
      style={{
        padding: 16,
        backgroundColor: theme.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.cardBorder,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: theme.textPrimary,
          }}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={{
              color: theme.textSecondary,
              marginTop: 4,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View>{trailing}</View> : null}
    </View>
  );
}
