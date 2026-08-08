import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type AuthUser = {
  id: string
  email: string
  fullName?: string
  username?: string
  role: "ADMIN" | "TEACHER" | "STUDENT" | "CASHIER" | "User"
  createdAt?: string
  access_token?: string
}

type AuthState = {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  isInitialized: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isInitialized: false,
}

function persistSession(user: AuthUser | null, token: string | null) {
  if (typeof window === "undefined") return

  if (user && token) {
    localStorage.setItem("user-data", JSON.stringify({ ...user, access_token: token }))
    localStorage.setItem("auth-token", token)
    window.dispatchEvent(new Event("auth-change"))
    return
  }

  localStorage.removeItem("user-data")
  localStorage.removeItem("auth-token")
  window.dispatchEvent(new Event("auth-change"))
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.error = null
      persistSession(action.payload.user, action.payload.token)
    },
    setCurrentUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = { ...state.user, ...action.payload }
      state.isAuthenticated = Boolean(state.token)
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    restoreSession: (state, action: PayloadAction<{ user: AuthUser | null; token: string | null }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = Boolean(action.payload.user && action.payload.token)
      state.isInitialized = true
    },
    clearAuth: (state) => {
      state.user = null
      state.token = null
      state.error = null
      state.isAuthenticated = false
      state.isLoading = false
      state.isInitialized = true
      persistSession(null, null)
    },
  },
})

export const { clearAuth, restoreSession, setAuthError, setAuthLoading, setCredentials, setCurrentUser } = authSlice.actions

export default authSlice.reducer
