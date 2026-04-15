import { useTheme } from "@/src/theme";
import { Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
};

export default function AppHeader({ title, subtitle }: Props) {
  const theme = useTheme();

  return (
    <View
      style={{
        padding: 16,
        backgroundColor: theme.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.cardBorder,
      }}
    >
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
  );
}
