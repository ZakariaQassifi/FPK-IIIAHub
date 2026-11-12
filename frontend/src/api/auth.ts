import { apiFetch } from '@/api/client'

export interface AdminLoginRequest {
  username: string
  password: string
}

export interface AdminLoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export async function adminLogin(
  payload: AdminLoginRequest
): Promise<AdminLoginResponse> {
  return apiFetch<AdminLoginResponse>('/api/v1/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function adminMe(token: string): Promise<{ sub: string; role: string }> {
  const headers = new Headers({ Authorization: `Bearer ${token}` })
  const API_URL = (
    import.meta.env.VITE_API_URL as string | undefined
  )?.replace(/\/$/, '')
  const response = await fetch(`${API_URL}/api/v1/admin/me`, { headers })
  if (!response.ok) {
    throw new Error('Failed to fetch admin profile')
  }
  return response.json()
}
