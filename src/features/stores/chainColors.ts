// Per-chain accent color, used on map markers and the comparison-card stripe
// so users can distinguish stores from different chains at a glance — including
// when two stores from different chains share lat/lng (a real case: malls and
// dual-banner buildings).
//
// Hex values picked from a Tailwind-derived palette for consistent saturation
// across the set; chain assignments roughly hint at brand identity (Rami Levy
// red, Shufersal blue) but mainly aim for mutual contrast across the 9 chains
// we currently scrape (see backend app/scraper/chains.py).

const CHAIN_COLORS: Record<string, string> = {
  shufersal: "#2563eb",
  yeinot_bitan: "#f97316",
  hazi_hinam: "#eab308",
  rami_levy: "#dc2626",
  yohananof: "#16a34a",
  osher_ad: "#7c3aed",
  tiv_taam: "#0891b2",
  victory: "#be123c",
  mahsani_hashuk: "#475569",
};

const FALLBACK_COLOR = "#6b7280";

export function getChainColor(chainId: string | undefined | null): string {
  if (!chainId) return FALLBACK_COLOR;
  return CHAIN_COLORS[chainId] ?? FALLBACK_COLOR;
}
