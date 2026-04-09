import { MarketDataSource } from "@/src/data/market/types";

export const DATA_SOURCE: MarketDataSource =
  (process.env.EXPO_PUBLIC_DATA_SOURCE as MarketDataSource) ?? "demo";