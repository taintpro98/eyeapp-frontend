const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export type ApiError = {
  error: { code: string; message: string }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { accessToken?: string } = {}
): Promise<T> {
  const { accessToken, ...init } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const err = new Error((data as ApiError)?.error?.message ?? res.statusText) as Error & {
      status: number
      code?: string
    }
    err.status = res.status
    err.code = (data as ApiError)?.error?.code
    throw err
  }

  return data as T
}
