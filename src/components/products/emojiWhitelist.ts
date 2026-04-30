// Curated set of emojis we'll render verbatim. Anything outside this set
// is treated as untrusted (e.g. an upstream substring-matching mishap that
// labelled a pita 🍓) and the caller falls back to a neutral icon or the
// initials tile.
//
// Inclusion rule: keep emojis whose source keyword unambiguously names a
// concrete consumer item (banana, broccoli, cucumber). Drop emojis that
// represent a *bucket* of mixed products (cleaning supplies under 🧹/🧺,
// hygiene under 🧴, sauces+ketchup+mayo+canned under 🥫) because the icon
// then lies about what's inside.

export const EMOJI_WHITELIST: ReadonlySet<string> = new Set([
  // Dairy / eggs
  "🥛", "🧈", "🥚",
  // Bread / bakery
  "🍞", "🥐", "🥖",
  // Meat / fish
  "🍗", "🥩", "🌭", "🍔", "🐟", "🦐",
  // Fruit
  "🍎", "🍌", "🍊", "🍋", "🍓", "🍇", "🍉", "🍈",
  "🍑", "🍐", "🥭", "🥑", "🥝", "🍍",
  // Vegetables
  "🥬", "🥗", "🍅", "🥒", "🥕", "🧅", "🧄", "🥔",
  "🥦", "🍄", "🌽", "🌶️",
  // Drinks
  "🍺", "🍷", "🥃", "☕", "🍵", "🧃", "💧", "🥤",
  // Snacks / sweets / pantry
  "🍫", "🍪", "🍿", "🍦", "🍰", "🌾", "🍯", "🥜", "🫒", "🧂",
  // Prepared
  "🍕", "🍚", "🍝",
  // Non-food household
  "👶", "🐕", "🪥", "🧻",
]);

export function trustedEmoji(emoji: string | null | undefined): string | null {
  if (!emoji) return null;
  return EMOJI_WHITELIST.has(emoji) ? emoji : null;
}
