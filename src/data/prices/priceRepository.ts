import { StoreProductPrice } from "@/src/domain/pricing/types";
import { demoPrices } from "@/src/constants/demoData/prices";

export function getAllPrices(): StoreProductPrice[] {
  return demoPrices;
}
