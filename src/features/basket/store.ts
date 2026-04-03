// src/features/basket/store.ts

import { demoBasketItems } from "@/src/constants/demoData/basket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BasketItem, SearchProduct } from "./types";

type BasketStore = {
  items: BasketItem[];

  addItem: (product: SearchProduct) => void;
  increaseQuantity: (itemId: string) => void;
  decreaseQuantity: (itemId: string) => void;
  removeItem: (itemId: string) => void;

  clearBasket: () => void;
  resetToDemoBasket: () => void;
};

export const useBasketStore = create<BasketStore>()(
  persist(
    (set) => ({
      items: demoBasketItems,

      addItem: (product) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === product.productId
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

          const newItem: BasketItem = {
            id: product.productId,
            productId: product.productId,
            name: product.name,
            quantity: 1,
            brand: product.brand,
            unit: product.unit,
            barcode: product.barcode,
            emoji: product.emoji,
          };

          return { items: [...state.items, newItem] };
        }),

      increaseQuantity: (itemId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        })),

      decreaseQuantity: (itemId) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === itemId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),

      clearBasket: () => set({ items: [] }),

      resetToDemoBasket: () => set({ items: demoBasketItems }),
    }),
    {
      name: "basket-storage",
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);