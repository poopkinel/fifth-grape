export type BasketItem = {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  brand?: string;
  unit?: string;
  barcode?: string;
  emoji?: string;
  subtitle?: string;
};