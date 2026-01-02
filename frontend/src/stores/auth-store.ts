import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  exp: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    access_token: string
    setAccessToken: (access_token: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = getCookie("access_token")
  const initToken = cookieState ? cookieState : ''
  return {
    auth: {
      user: null,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      access_token: initToken,
      setAccessToken: (access_token) =>
        set((state) => {
          setCookie("access_token", access_token)
          return { ...state, auth: { ...state.auth, access_token } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie("access_token")
          return { ...state, auth: { ...state.auth, access_token: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie("access_token")
          return {
            ...state,
            auth: { ...state.auth, user: null, access_token: '' },
          }
        }),
    },
  }
})
