import { useState, useEffect } from 'react'

const TOKEN_KEY = 'fpk_admin_token'
const ROLE_KEY = 'fpk_admin_role'

export interface AdminAuthState {
  token: string | null
  role: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    token: null,
    role: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    const role = localStorage.getItem(ROLE_KEY)
    setState({
      token,
      role,
      isAuthenticated: !!token && !!role,
      isLoading: false,
    })
  }, [])

  const setToken = (token: string, role: string) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(ROLE_KEY, role)
    setState({
      token,
      role,
      isAuthenticated: true,
      isLoading: false,
    })
  }

  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROLE_KEY)
    setState({
      token: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  return { ...state, setToken, clearToken }
}
