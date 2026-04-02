import { Tabs } from "expo-router";
import { Home, Map } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#10b981",
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