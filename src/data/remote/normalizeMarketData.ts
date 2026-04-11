import { Product } from "@/src/features/products/types";
import { PriceLookupResponse } from "./types";

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    emoji: product.emoji ?? "🛒",
    category: product.category ?? undefined,
  };
}

export function normalizeMarketData(
  data: PriceLookupResponse,
): PriceLookupResponse {
  return {
    ...data,
    products: data.products.map(normalizeProduct),
  };
}
