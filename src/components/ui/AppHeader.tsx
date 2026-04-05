import { Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
};

export default function AppHeader({ title, subtitle }: Props) {
  return (
    <View
      style={{
        padding: 16,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: "#111827",
        }}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={{
            color: "#6b7280",
            marginTop: 4,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}