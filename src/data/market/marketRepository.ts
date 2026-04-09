import { getAllPrices } from "@/src/data/prices/priceRepository";
import { getAllProducts } from "@/src/data/products/productRepository";
import { getAllStores } from "@/src/data/stores/storeRepository";
import { DATA_SOURCE } from "@/src/data/config/dataSource";
import { fetchRemoteMarketSnapshot } from "@/src/data/remote/marketApi";
import { MarketDataSnapshot } from "./types";

export async function getMarketDataSnapshot(): Promise<MarketDataSnapshot> {
  if (DATA_SOURCE === "remote") {
    return fetchRemoteMarketSnapshot();
  }

  const [stores, products, prices] = await Promise.all([
    Promise.resolve(getAllStores()),
    Promise.resolve(getAllProducts()),
    Promise.resolve(getAllPrices()),
  ]);

  return {
    stores,
    products,
    prices,
    source: DATA_SOURCE,
    fetchedAt: new Date().toISOString(),
  };
}