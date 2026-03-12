import type { BootstrapResponse } from '@/types'
import { mockBootstrap } from '@/data/mockBootstrap'

export async function fetchBootstrap(): Promise<BootstrapResponse> {
  await new Promise((r) => setTimeout(r, 400))
  return mockBootstrap
}
