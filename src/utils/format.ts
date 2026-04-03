export function formatCurrency(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `₪${rounded}` : `₪${rounded.toFixed(1)}`;
}