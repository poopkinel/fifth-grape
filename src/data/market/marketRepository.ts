import { getAllPrices } from "@/src/data/prices/priceRepository";
import { getAllProducts } from "@/src/data/products/productRepository";
import { getAllStores } from "@/src/data/stores/storeRepository";
import { MarketDataSnapshot } from "./types";

export async function getMarketDataSnapshot(): Promise<MarketDataSnapshot> {
  const [stores, products, prices] = await Promise.all([
    Promise.resolve(getAllStores()),
    Promise.resolve(getAllProducts()),
    Promise.resolve(getAllPrices()),
  ]);

  return {
    stores,
    products,
    prices,
    source: "demo",
    fetchedAt: new Date().toISOString(),
  };
}