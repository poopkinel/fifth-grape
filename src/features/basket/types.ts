export type BasketItem = {
  id: string;
  productId: string;
  name: string;
  /** Snapshotted at add-time so the UI can render the user's current
   *  language without a fresh API lookup; falls back to `name` if absent. */
  nameEn?: string;
  quantity: number;
  brand?: string;
  unit?: string;
  barcode?: string;
  emoji?: string;
  imageUrl?: string;
  subtitle?: string;
};

export type SearchProduct = {
  productId: string;
  name: string;
  nameEn?: string;
  emoji?: string;
  brand?: string;
  unit?: string;
  barcode?: string;
  imageUrl?: string;
};

export type BasketStore = {
  items: BasketItem[];
  addItem: (product: SearchProduct) => void;
  increaseQuantity: (itemId: string) => void;
  decreaseQuantity: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  clearBasket: () => void;
  resetToDemoBasket: () => void;
};