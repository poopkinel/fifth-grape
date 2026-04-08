import { demoStores } from "@/src/constants/demoData/stores";
import { DATA_SOURCE } from "@/src/data/config/dataSource";
import { Store } from "@/src/features/stores/types";
import { realStores } from "@/src/lib/constants/realStores";

export function getAllStores(): Store[] {
  return DATA_SOURCE === "real-local" ? realStores : demoStores;
}

export function getStoreById(storeId: string): Store | undefined {
  return getAllStores().find((s) => s.storeId === storeId);
}