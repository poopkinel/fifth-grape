import { getAllPrices } from "@/src/data/prices/priceRepository";
import { getAllProducts } from "@/src/data/products/productRepository";
import { getAllStores } from "@/src/data/stores/storeRepository";
import { DATA_SOURCE } from "@/src/data/config/dataSource";
import { fetchRemotePriceLookup } from "@/src/data/remote/marketApi";
import { PriceLookup } from "./types";

export async function getPriceLookup(
  productIds: string[],
): Promise<PriceLookup> {
  if (DATA_SOURCE === "remote") {
    if (productIds.length === 0) {
      return {
        stores: [],
        products: [],
        prices: [],
        source: "remote",
        fetchedAt: new Date().toISOString(),
      };
    }
    return fetchRemotePriceLookup(productIds);
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
