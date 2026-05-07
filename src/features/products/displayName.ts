/**
 * Pick the right product name for the current UI language.
 *
 * `nameEn` is populated from Open Food Facts when available, but most
 * Israeli SKUs aren't on OFF — fall back to the Hebrew `name` (which is
 * always present) when the English variant is missing or empty.
 *
 * Pure function so it can be called inside JSX without a hook. The caller
 * is responsible for being inside a component that re-renders on language
 * change (any component using `useTranslation` does).
 */
export function pickProductName(
  name: string,
  nameEn: string | null | undefined,
  language: string,
): string {
  if (language?.startsWith("en") && nameEn && nameEn.trim()) {
    return nameEn;
  }
  return name;
}
