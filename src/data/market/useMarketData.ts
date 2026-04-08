import { useQuery } from "@tanstack/react-query";
import { getMarketDataSnapshot } from "./marketRepository";

export function useMarketData() {
  return useQuery({
    queryKey: ["market-data"],
    queryFn: getMarketDataSnapshot,
    staleTime: 1000 * 60 * 5,
  });
}