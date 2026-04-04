export function formatCurrency(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `₪${rounded}` : `₪${rounded.toFixed(1)}`;
}

export function formatRelativeUpdateTime(value: string): string {
  if (!value) return "לא ידוע";

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) return "לא ידוע";

  const diffMs = Math.max(Date.now() - timestamp, 0);
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 60) {
    return `עודכן לפני ${Math.max(diffMinutes, 1)} דק׳`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `עודכן לפני ${diffHours} שעות`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `עודכן לפני ${diffDays} ימים`;
}
