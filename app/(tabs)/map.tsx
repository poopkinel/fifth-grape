import StoreMapScene from "@/src/features/map/components/StoreMapScene";
import { useRouter } from "expo-router";
import { View } from "react-native";
import AppHeader from "../../src/components/ui/AppHeader";
import { useListStore } from "../../src/features/lists/store";

export default function MapScreen() {
  const router = useRouter();
  const items = useListStore((state) => state.items);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <AppHeader
        title="מפה"
        subtitle={`השוואה סביבך • ${totalCount} מוצרים`}
      />

      <StoreMapScene 
              items={items}
              onOpenStore={(id) => router.push(`/store/${id}`)}
            />
    </View>
  );
}