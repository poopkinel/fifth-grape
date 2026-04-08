import { demoProducts } from "@/src/constants/demoData/products";
import { DATA_SOURCE } from "@/src/data/config/dataSource";
import { Product } from "@/src/features/products/types";
import { realProducts } from "@/src/lib/constants/realProducts";

export function getAllProducts(): Product[] {
  return DATA_SOURCE === "real-local" ? realProducts : demoProducts;
}