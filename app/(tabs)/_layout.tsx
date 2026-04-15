import { useTheme } from "@/src/theme";
import { Tabs } from "expo-router";
import { Home, Map } from "lucide-react-native";

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.tabBarBg,
          borderTopColor: theme.tabBarBorder,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "בית",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "מפה",
          tabBarIcon: ({ color, size }) => <Map color={color} size={size} />,
          lazy: true,
        }}
      />
    </Tabs>
  );
}
