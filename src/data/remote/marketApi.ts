import { MarketDataSnapshot } from "@/src/data/market/types";
import { apiGet } from "./apiClient";
import { MarketSnapshotResponse } from "./types";

export async function fetchRemoteMarketSnapshot(): Promise<MarketDataSnapshot> {
  const data = await apiGet<MarketSnapshotResponse>("/v1/market/snapshot");

  return {
    stores: data.stores,
    products: data.products,
    prices: data.prices,
    source: "remote",
    fetchedAt: data.generatedAt,
  };
}
