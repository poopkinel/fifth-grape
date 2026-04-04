import { formatCurrency } from "@/src/utils/format";
import { RankedStore } from "./types";

const MIN_MEANINGFUL_BASELINE_DELTA = 1;

export function buildReasonText(store: Pick<
  RankedStore,
  "rank" | "missingCount" | "savingsVsNext" | "savingsVsUsualStore"
>, options?: {
  isUsualStore?: boolean;
}): string {
  if (store.rank === 0 && store.savingsVsUsualStore !== null && store.savingsVsUsualStore > 0) {
    return `חוסך ${formatCurrency(store.savingsVsUsualStore)} לעומת הסופר הרגיל שלך`;
  }

  if (store.rank === 0 && options?.isUsualStore) {
    return "נשארת הבחירה הטובה ביותר לסל הנוכחי";
  }

  if (store.rank === 0 && store.savingsVsUsualStore !== null && store.savingsVsUsualStore < 0) {
    if (store.missingCount === 0) {
      return "הכול נמצא כאן, בלי לפצל קנייה";
    }

    return "קרוב יותר עם פחות חוסרים";
  }

  if (store.rank === 0 && store.savingsVsNext !== null && store.savingsVsNext > 0) {
    return `חוסך ${formatCurrency(store.savingsVsNext)} לעומת האפשרות הבאה`;
  }

  if (store.rank === 0) {
    return "הבחירה הכי טובה עבורך";
  }

  if (store.missingCount === 0) {
    return "כל המוצרים נמצאים כאן";
  }

  return `חסרים ${store.missingCount} מוצרים`;
}

export function buildBaselineText(
  savingsVsUsualStore: number | null
): string | undefined {
  if (savingsVsUsualStore === null) return undefined;
  if (Math.abs(savingsVsUsualStore) < MIN_MEANINGFUL_BASELINE_DELTA) return undefined;

  if (savingsVsUsualStore > 0) {
    return `חוסך ${formatCurrency(savingsVsUsualStore)} לעומת הסופר הרגיל שלך`;
  }

  if (savingsVsUsualStore < 0) {
    return `עולה ${formatCurrency(Math.abs(savingsVsUsualStore))} יותר מהסופר הרגיל שלך`;
  }

  return "זו אותה עלות כמו הסופר הרגיל שלך";
}
