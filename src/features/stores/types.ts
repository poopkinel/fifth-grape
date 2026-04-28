export type GeocodeStatus = "ok" | "no_results" | null;

export type Store = {
  storeId: string;
  chainId: string;
  chainName: string;
  branchName: string;
  // Brand-level: chainId is the corporate parent; subChain* carries the
  // consumer brand (e.g. yeinot_bitan publishes Sheli + Carrefour + Be'er
  // under one chainId — distinguishable only here). Optional because not
  // every chain populates these in the source XML.
  subChainId?: string | null;
  subChainName?: string | null;
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  geocodeStatus?: GeocodeStatus;
};

export type StoreBasketRow = {
  productId: string;
  name: string;
  quantity: number;
  brand?: string;
  unit?: string;
  emoji?: string;
  imageUrl?: string;
  inStock: boolean;
  unitPrice: number | null;
  totalPrice: number | null;
};

export type StoreBasketDetails = {
  storeId: string;
  chainName: string;
  branchName: string;
  address: string;
  updatedAt: string;
  total: number;
  missingCount: number;
  rows: StoreBasketRow[];
};

export type StoreScreenRow = {
  productId: string;
  name: string;
  subtitle: string;
  emoji?: string;
  imageUrl?: string;
  inStock: boolean;
  totalPrice: number | null;
  statusText: string;
};

export type StoreScreenModel = {
  storeId: string;
  title: string;
  subtitle: string;
  total: number;
  missingCount: number;
  matchedCount: number;
  distanceText: string;
  reasonText: string;
  trustText: string;
  updatedAtText: string;
  baselineText?: string;
  isUsualStore: boolean;
  splitTripText: string;
  rows: StoreScreenRow[];
};
