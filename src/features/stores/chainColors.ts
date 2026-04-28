// Per-store accent color, used on map markers and the comparison-card stripe
// so users can distinguish stores from different brands at a glance — including
// the case where multiple consumer brands share a single corporate-parent
// chainId (Yeinot Bitan publishes Sheli, Carrefour, Be'er, Quik all under
// chain_id="yeinot_bitan"; we now disambiguate by subChainName).
//
// Implementation: hash the (chainId, subChainName) composite to a fixed
// palette index. Same brand always lands on the same color across renders;
// different brands within the same chain land on different colors.
//
// Palette deliberately excludes greens — green is reserved for the BEST
// recommendation marker, and mixing in green sub-chains would erode that
// signal.

const PALETTE = [
  "#2563eb", // blue-600
  "#f97316", // orange-500
  "#eab308", // yellow-500
  "#dc2626", // red-600
  "#7c3aed", // violet-600
  "#0891b2", // cyan-600
  "#be123c", // rose-700
  "#d97706", // amber-600
  "#6366f1", // indigo-500
  "#db2777", // pink-600
];

const FALLBACK_COLOR = "#6b7280"; // gray-500, only when chainId is missing

function hashString(s: string): number {
  // djb2 — small, fast, good enough for "consistent palette index"
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pickFromPalette(key: string): string {
  return PALETTE[hashString(key) % PALETTE.length];
}

export function getChainColor(chainId: string | undefined | null): string {
  if (!chainId) return FALLBACK_COLOR;
  return pickFromPalette(chainId);
}

export function getStoreColor(args: {
  chainId: string | undefined | null;
  subChainName?: string | null;
}): string {
  if (!args.chainId) return FALLBACK_COLOR;
  const sub = (args.subChainName ?? "").trim();
  // Composite key: same chainId + brand always picks the same palette slot;
  // different brands within one chainId pick different slots.
  return pickFromPalette(sub ? `${args.chainId}:${sub.toLowerCase()}` : args.chainId);
}
