import { BasketItem } from "./types";

export function getBasketTotalCount(items: BasketItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getBasketUniqueCount(items: BasketItem[]): number {
  return items.length;
}

export function isBasketEmpty(items: BasketItem[]): boolean {
  return items.length === 0;
}