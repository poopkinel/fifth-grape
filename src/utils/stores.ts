import { Store } from "../features/stores/types";
import { realStores } from "../lib/constants/realStores";

export function getStoreById(storeId: string): Store | null {
  return realStores.find((s) => s.storeId === storeId) ?? null;
}