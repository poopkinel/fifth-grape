import { demoStores } from "@/src/constants/demoData/stores";
import { Store } from "@/src/features/stores/types";

export function getAllStores(): Store[] {
  return demoStores;
}

export function getStoreById(storeId: string): Store | undefined {
  return demoStores.find((s) => s.storeId === storeId);
}