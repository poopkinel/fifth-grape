import { useQuery } from "@tanstack/react-query";
import { fetchRemoteProductSearch } from "./marketApi";

const MIN_QUERY_LENGTH = 2;

export function useProductSearch(query: string) {
  const trimmed = query.trim();
  const enabled = trimmed.length >= MIN_QUERY_LENGTH;

  return useQuery({
    queryKey: ["product-search", trimmed],
    queryFn: () => fetchRemoteProductSearch(trimmed),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}
