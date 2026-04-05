import { Text, TouchableOpacity, View } from "react-native";

type SearchResultRowProps = {
  name: string;
  subtitle?: string;
  emoji?: string;
  badge?: string;
  onAdd?: () => void;
};

export default function SearchResultRow({
  name,
  subtitle,
  emoji = "🥛",
  badge,
  onAdd,
}: SearchResultRowProps) {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e5e7eb",
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
              backgroundColor: "#f3f4f6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 22 }}>{emoji}</Text>
          </View>

          <View style={{ flex: 1, alignItems: "flex-start" }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#111827",
                textAlign: "right",
              }}
            >
              {name}
            </Text>

            {subtitle ? (
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: "#6b7280",
                  textAlign: "right",
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
                  backgroundColor: "#ecfdf5",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    color: "#047857",
                    fontSize: 12,
                    fontWeight: "700",
                    textAlign: "right",
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
            backgroundColor: "#111827",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 14,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            הוסף
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}