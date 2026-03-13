import { apiFetch } from '@/lib/api'

export type User = {
  id: string
  email: string
  display_name: string
  role: string
  status: string
}

export type Tokens = {
  access_token: string
  refresh_token: string
  expires_in: number
}

export type AuthResponse = {
  user: User
  tokens: Tokens
}

export type RegisterInput = {
  email: string
  password: string
  display_name: string
}

export type LoginInput = {
  email: string
  password: string
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
}

export async function logout(refreshToken?: string): Promise<void> {
  await apiFetch<{ message: string }>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}),
  })
}

export async function getMe(accessToken: string): Promise<{ user: User }> {
  return apiFetch<{ user: User }>('/me', {
    method: 'GET',
    accessToken,
  })
}
