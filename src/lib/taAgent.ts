import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Client for ta-agent data (fundamental analysis and chart datafeed). The data
 * lives in ta-agent, but the browser never talks to it: eyeapp-backend proxies
 * `/api/v1/fa/{marketId}/*` and `/api/v1/ta/{marketId}/*` with its own service
 * account, so requests use the normal eyeapp session (silent refresh included)
 * and the market subscription check.
 */

/** market_id of VN stocks — ta-agent only covers listed Vietnamese companies. */
const TA_AGENT_MARKET_ID = 2;

/** Which backend proxy group a request goes through. */
export type TaAgentService = "fa" | "ta";

/** Error codes the UI branches on. */
export type TaAgentErrorCode = "unauthorized" | "forbidden" | "unreachable" | "http";

export class TaAgentError extends Error {
  readonly code: TaAgentErrorCode;
  readonly status: number;
  /** Backend error code (e.g. "subscription_required"), when there is one. */
  readonly apiCode?: string;

  constructor(code: TaAgentErrorCode, status: number, message: string, apiCode?: string) {
    super(message);
    this.name = "TaAgentError";
    this.code = code;
    this.status = status;
    this.apiCode = apiCode;
  }
}

/**
 * React Query `retry` for FA calls: auth and other 4xx answers won't change on
 * retry, so fail fast and show the reason; network errors and 5xx get one more try.
 */
export function taAgentRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof TaAgentError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 1;
}

type QueryValue = string | number | boolean | null | undefined;

function buildQuery(params?: Record<string, QueryValue>): string {
  if (!params) return "";
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    // "" is kept: the chart's symbol search sends query="" to list every symbol.
    if (value === undefined || value === null) continue;
    query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

/** Map a backend status to the UI's error code. 502/503 mean the FA service itself is down. */
function codeFor(status: number): TaAgentErrorCode {
  if (status === 0 || status === 502 || status === 503 || status === 504) return "unreachable";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  return "http";
}

/** GET a ta-agent resource, `path` relative to `/{service}/{marketId}` (e.g. "/screener"). */
export async function taAgentFetch<T>(
  path: string,
  params?: Record<string, QueryValue>,
  service: TaAgentService = "fa",
): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken ?? undefined;
  try {
    return await apiFetch<T>(`/${service}/${TA_AGENT_MARKET_ID}${path}${buildQuery(params)}`, { accessToken });
  } catch (err) {
    const e = err as Error & { status?: number; code?: string };
    const status = typeof e.status === "number" ? e.status : 0;
    throw new TaAgentError(codeFor(status), status, e.message ?? "Network error", e.code);
  }
}
