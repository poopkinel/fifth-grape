import { Product } from "@/src/features/products/types";
import { PriceLookupResponse } from "./types";

function normalizeProduct(product: Product): Product {
  // Don't substitute a default emoji here — ProductImage filters against a
  // confidence whitelist and falls through to a brand-initial tile when
  // there's no trustworthy emoji. A blanket "🛒" default would lie about
  // every untagged product.
  return {
    ...product,
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
