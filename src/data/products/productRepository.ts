import { demoProducts } from "@/src/constants/demoData/products";
import { Product } from "@/src/features/products/types";

export function getAllProducts(): Product[] {
  return demoProducts;
}