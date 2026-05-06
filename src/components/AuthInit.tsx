import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { registerRefresh } from "@/lib/api";

/** Refreshes tokens on app load and wires the silent-refresh callback for apiFetch. */
export function AuthInit() {
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const tryRefresh = useAuthStore((s) => s.tryRefresh);

  useEffect(() => {
    // Give apiFetch a way to refresh silently on 401 without a circular import.
    registerRefresh(async () => {
      const ok = await useAuthStore.getState().tryRefresh();
      return ok ? useAuthStore.getState().accessToken : null;
    });

    if (refreshToken) {
      tryRefresh();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- run once on mount

  return null;
}
