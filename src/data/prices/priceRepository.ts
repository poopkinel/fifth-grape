import { demoPrices } from "@/src/constants/demoData/prices";
import { DATA_SOURCE } from "@/src/data/config/dataSource";
import { StoreProductPrice } from "@/src/domain/pricing/types";
import { realPrices } from "@/src/lib/constants/realPrices";

export function getAllPrices(): StoreProductPrice[] {
  return DATA_SOURCE === "real-local" ? realPrices : demoPrices;
}