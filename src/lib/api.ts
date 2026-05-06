const API_BASE = `${import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8080"}/api/v1`;

export type ApiError = {
  error: { code: string; message: string };
};

// Registered by AuthInit to break the api → store → api circular import.
// Returns the new access token on success, or null if refresh failed (user gets logged out).
type RefreshFn = () => Promise<string | null>;
let _onRefresh: RefreshFn | null = null;
// Shared promise so concurrent 401s don't fire multiple refresh calls.
let _refreshPromise: Promise<string | null> | null = null;

export function registerRefresh(fn: RefreshFn) {
  _onRefresh = fn;
}

async function doRequest(
  path: string,
  init: RequestInit,
  token?: string,
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { accessToken?: string } = {},
): Promise<T> {
  const { accessToken, ...init } = options;

  let res = await doRequest(path, init, accessToken);

  // On 401 with a bearer token in play, attempt one silent token refresh then retry.
  if (res.status === 401 && accessToken && _onRefresh) {
    if (!_refreshPromise) {
      _refreshPromise = _onRefresh().finally(() => {
        _refreshPromise = null;
      });
    }
    const newToken = await _refreshPromise;
    if (newToken) {
      res = await doRequest(path, init, newToken);
    }
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(
      (data as ApiError)?.error?.message ?? res.statusText,
    ) as Error & {
      status: number;
      code?: string;
    };
    err.status = res.status;
    err.code = (data as ApiError)?.error?.code;
    throw err;
  }

  return data as T;
}
