export type Store = {
  storeId: string;
  chainId: string;
  chainName: string;
  branchName: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
};

export type StoreBasketRow = {
  productId: string;
  name: string;
  quantity: number;
  brand?: string;
  unit?: string;
  emoji?: string;
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
  distanceText: string;
  updatedAtText: string;
  splitTripText: string;
  rows: StoreScreenRow[];
};