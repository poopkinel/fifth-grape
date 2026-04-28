import i18n from "@/src/i18n";

export function formatCurrency(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `₪${rounded}` : `₪${rounded.toFixed(1)}`;
}

export function formatRelativeUpdateTime(value: string): string {
  if (!value) return i18n.t("format.unknown");

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return i18n.t("format.unknown");

  const diffMs = Math.max(Date.now() - timestamp, 0);
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 60) {
    return i18n.t("format.minutesAgo", { count: Math.max(diffMinutes, 1) });
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return i18n.t("format.hoursAgo", { count: diffHours });
  }

  const diffDays = Math.round(diffHours / 24);
  return i18n.t("format.updateDaysAgo", { count: diffDays });
}

export function isUnknownRelativeTime(text: string): boolean {
  return text === i18n.t("format.unknown");
}
