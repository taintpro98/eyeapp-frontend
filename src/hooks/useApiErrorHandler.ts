import { useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";

type ApiError = { code?: string };

export function useApiErrorHandler() {
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal);

  return useCallback(
    (err: unknown) => {
      const apiErr = err as ApiError;
      if (!apiErr?.code) return;
      if (apiErr.code === "subscription_required") {
        openUpgradeModal({ reasonKey: "subscriptionRequired" });
      } else if (apiErr.code === "feature_required") {
        openUpgradeModal({ reasonKey: "featureRequired" });
      }
    },
    [openUpgradeModal],
  );
}
