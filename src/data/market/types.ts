import { StoreProductPrice } from "@/src/domain/pricing/types";
import { Product } from "@/src/features/products/types";
import { Store } from "@/src/features/stores/types";

export type MarketDataSource = "demo" | "real-local" | "remote";

export type PriceLookup = {
  stores: Store[];
  products: Product[];
  prices: StoreProductPrice[];
  source: MarketDataSource;
  fetchedAt: string;
};
