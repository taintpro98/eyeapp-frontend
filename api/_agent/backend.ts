/**
 * eyeapp-backend calls made by the chat function, always with the end user's
 * own access token: the backend checks the session and the plan, and proxies
 * ta-agent data, so this function never holds ta-agent credentials.
 */

/** market_id of VN stocks — the only market the assistant covers. */
export const VN_MARKET_ID = 2;

export function backendBase(): string {
  return (process.env.BACKEND_URL || process.env.VITE_BACKEND_URL || "http://localhost:8080").replace(/\/+$/, "");
}

export class BackendError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "BackendError";
    this.status = status;
    this.code = code;
  }
}

async function call<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${backendBase()}/api/v1${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const data = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
  if (!res.ok) {
    throw new BackendError(res.status, data?.error?.message ?? res.statusText, data?.error?.code);
  }
  return data as T;
}

/** Throws BackendError (401/403/…) unless the user may use the assistant on this market. */
export function checkAccess(token: string): Promise<{ allowed: boolean }> {
  return call(token, `/ai/${VN_MARKET_ID}/access`);
}

/** POST a tool request to /api/v1/ai/{market}/tools/{name}. */
export function callTool<T = unknown>(token: string, name: "stock-data" | "query" | "screener", body: object): Promise<T> {
  return call(token, `/ai/${VN_MARKET_ID}/tools/${name}`, { method: "POST", body: JSON.stringify(body) });
}
