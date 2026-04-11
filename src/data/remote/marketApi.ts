import { PriceLookup } from "@/src/data/market/types";
import { Product } from "@/src/features/products/types";
import { apiGet, apiPost } from "./apiClient";
import { normalizeMarketData } from "./normalizeMarketData";
import { PriceLookupResponse, ProductSearchResponse } from "./types";

export async function fetchRemotePriceLookup(
  productIds: string[],
): Promise<PriceLookup> {
  const raw = await apiPost<PriceLookupResponse>("/v1/prices/lookup", {
    productIds,
  });
  const data = normalizeMarketData(raw);

  return {
    stores: data.stores,
    products: data.products,
    prices: data.prices,
    source: "remote",
    fetchedAt: data.generatedAt,
  };
}

export async function fetchRemoteProductSearch(
  query: string,
  limit = 50,
): Promise<Product[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  return apiGet<ProductSearchResponse>(`/v1/products/search?${params}`);
}
