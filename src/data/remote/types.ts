import { Store } from "@/src/features/stores/types";
import { Product } from "@/src/features/products/types";
import { StoreProductPrice } from "@/src/domain/pricing/types";

export type MarketSnapshotResponse = {
  stores: Store[];
  products: Product[];
  prices: StoreProductPrice[];
  generatedAt: string;
};
