import { Store } from "@/src/features/stores/types";
import { Product } from "@/src/features/products/types";
import { StoreProductPrice } from "@/src/domain/pricing/types";

export type PriceLookupResponse = {
  stores: Store[];
  products: Product[];
  prices: StoreProductPrice[];
  generatedAt: string;
};

export type ProductSearchResponse = Product[];
