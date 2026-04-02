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
        alignItems: "flex-start",
      }}
    >
      <Text
        style={{
          width: "100%",
          fontSize: 18,
          fontWeight: "bold",
          textAlign: "right",
          color: "#111827",
        }}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={{
            width: "100%",
            color: "#6b7280",
            textAlign: "right",
            writingDirection: "rtl",
            marginTop: 4,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}