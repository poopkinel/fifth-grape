export type Product = {
  productId: string;
  name: string;
  /**
   * Open Food Facts English name (product_name_en or generic_name_en when
   * the SKU has no localized name). Populated by backend enrich_off.py.
   * Optional: many Israeli SKUs have no OFF entry or no English name there;
   * UI must fall back to `name` (Hebrew).
   */
  nameEn?: string;
  brand?: string;
  unit?: string;
  barcode?: string;
  emoji?: string;
  category?: string;
  imageUrl?: string;
};