import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mockListItems } from "../../lib/constants/mockData";

export type GroceryListItem = {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  emoji?: string;
  subtitle?: string;
  brand?: string;
  unit?: string;
  barcode?: string;
};

type SearchProduct = {
  productId: string;
  name: string;
  emoji?: string;
  brand?: string;
  unit?: string;
  barcode?: string;
};

type ListStore = {
  items: GroceryListItem[];
  addItem: (product: SearchProduct) => void;
  increaseQuantity: (itemId: string) => void;
  decreaseQuantity: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  resetItems: () => void;
};

export const useListStore = create<ListStore>()(
  persist(
    (set) => ({
      items: mockListItems,

      addItem: (product) =>
        set((state) => {
          const existing = state.items.find(
            (item) => item.productId === product.productId
          );

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === product.productId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          return {
            items: [
              {
                id: `list-item-${product.productId}`,
                productId: product.productId,
                name: product.name,
                quantity: 1,
                emoji: product.emoji,
                subtitle: [product.brand, product.unit].filter(Boolean).join(" • "),
                brand: product.brand,
                unit: product.unit,
                barcode: product.barcode,
              },
              ...state.items,
            ],
          };
        }),

      increaseQuantity: (itemId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
          ),
        })),

      decreaseQuantity: (itemId) =>
        set((state) => {
          const target = state.items.find((item) => item.id === itemId);
          if (!target) return state;

          if (target.quantity <= 1) {
            return {
              items: state.items.filter((item) => item.id !== itemId),
            };
          }

          return {
            items: state.items.map((item) =>
              item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
            ),
          };
        }),

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),

      resetItems: () => set({ items: mockListItems }),
    }),
    {
      name: "grocery-list-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);