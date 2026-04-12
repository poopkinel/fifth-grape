import { useQuery } from "@tanstack/react-query";
import { DATA_SOURCE } from "@/src/data/config/dataSource";
import { getPriceLookup } from "./marketRepository";

export function useMarketData(productIds: string[]) {
  const sortedIds = [...productIds].sort();
  const enabled = DATA_SOURCE !== "remote" || sortedIds.length > 0;

  return useQuery({
    queryKey: ["price-lookup", sortedIds],
    queryFn: () => getPriceLookup(sortedIds),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
}
