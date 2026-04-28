import i18n from "@/src/i18n";
import { formatCurrency } from "@/src/utils/format";
import { RankedStore } from "./types";

const MIN_MEANINGFUL_BASELINE_DELTA = 1;

export function buildReasonText(
  store: Pick<
    RankedStore,
    "rank" | "missingCount" | "savingsVsNext" | "savingsVsUsualStore"
  >,
  options?: { isUsualStore?: boolean },
): string {
  if (
    store.rank === 0 &&
    store.savingsVsUsualStore !== null &&
    store.savingsVsUsualStore > 0
  ) {
    return i18n.t("reason.savesVsUsual", {
      amount: formatCurrency(store.savingsVsUsualStore),
    });
  }

  if (store.rank === 0 && options?.isUsualStore) {
    return i18n.t("reason.stillBestUsual");
  }

  if (
    store.rank === 0 &&
    store.savingsVsUsualStore !== null &&
    store.savingsVsUsualStore < 0
  ) {
    if (store.missingCount === 0) {
      return i18n.t("reason.everythingHereNoSplit");
    }
    return i18n.t("reason.closerWithFewerMissing");
  }

  if (store.rank === 0 && store.savingsVsNext !== null && store.savingsVsNext > 0) {
    return i18n.t("reason.savesVsNext", {
      amount: formatCurrency(store.savingsVsNext),
    });
  }

  if (store.rank === 0) {
    return i18n.t("reason.bestForYou");
  }

  if (store.missingCount === 0) {
    return i18n.t("reason.allItemsHere");
  }

  return i18n.t("reason.missingCount", { count: store.missingCount });
}

export function buildBaselineText(
  savingsVsUsualStore: number | null,
): string | undefined {
  if (savingsVsUsualStore === null) return undefined;
  if (Math.abs(savingsVsUsualStore) < MIN_MEANINGFUL_BASELINE_DELTA) return undefined;

  if (savingsVsUsualStore > 0) {
    return i18n.t("baseline.saves", {
      amount: formatCurrency(savingsVsUsualStore),
    });
  }
  if (savingsVsUsualStore < 0) {
    return i18n.t("baseline.costsMore", {
      amount: formatCurrency(Math.abs(savingsVsUsualStore)),
    });
  }
  return i18n.t("baseline.sameCost");
}
