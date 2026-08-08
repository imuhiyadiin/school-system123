import { type AxiosError, type AxiosRequestConfig } from "axios"
import { createApi } from "@reduxjs/toolkit/query/react"

import { clearAuth, setAuthError, setAuthLoading, setCredentials, setCurrentUser, type AuthUser } from "./authSlice"
import { apiClient } from "@/services/api/client"

const axiosBaseQuery =
  (): import("@reduxjs/toolkit/query").BaseQueryFn<AxiosRequestConfig, unknown, { status?: number; data: unknown }> =>
  async (request) => {
    try {
      const result = await apiClient(request)
      return { data: result.data }
    } catch (axiosError) {
      const error = axiosError as AxiosError
      return { error: { status: error.response?.status, data: error.response?.data ?? { message: "Network error. Please try again." } } }
    }
  }

type AuthResponse = { message: string; user: AuthUser }
type Credentials = { email: string; password: string }
type StudentCredentials = { phone: string; password: string }
type StudentLoginResponse = { message: string; token: string; student: AuthUser }
type RegisterCredentials = Credentials & { name: string }
type CurrentUserResponse = { message: string; user: AuthUser }

function readErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = error.data
    if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") return data.message
  }
  return "Unable to complete the request. Please try again."
}

function getRequestStatus(error: unknown) {
  if (typeof error !== "object" || error === null || !("error" in error)) return undefined
  const requestError = error.error
  if (typeof requestError !== "object" || requestError === null || !("status" in requestError)) return undefined
  return typeof requestError.status === "number" ? requestError.status : undefined
}

function saveSession(dispatch: (action: unknown) => void, response: AuthResponse) {
  const token = response.user.access_token
  if (!token) throw new Error("The server did not return an authentication token.")
  dispatch(setCredentials({ user: response.user, token }))
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    authRegister: builder.mutation<AuthResponse, RegisterCredentials>({
      query: (data) => ({ url: "/auth/register", method: "POST", data }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setAuthLoading(true))
        try {
          saveSession(dispatch, (await queryFulfilled).data)
        } catch (error) {
          dispatch(setAuthError(readErrorMessage(error)))
        } finally {
          dispatch(setAuthLoading(false))
        }
      },
    }),
    authLogin: builder.mutation<AuthResponse, Credentials>({
      query: (data) => ({ url: "/auth/login", method: "POST", data }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setAuthLoading(true))
        try {
          saveSession(dispatch, (await queryFulfilled).data)
        } catch (error) {
          dispatch(setAuthError(readErrorMessage(error)))
        } finally {
          dispatch(setAuthLoading(false))
        }
      },
    }),
    authStudentLogin: builder.mutation<StudentLoginResponse, StudentCredentials>({
      query: (data) => ({ url: "/student/login", method: "POST", data }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setAuthLoading(true))
        try {
          const response = (await queryFulfilled).data
          dispatch(setCredentials({ user: response.student, token: response.token }))
        } catch (error) {
          dispatch(setAuthError(readErrorMessage(error)))
        } finally {
          dispatch(setAuthLoading(false))
        }
      },
    }),
    getCurrentUser: builder.query<CurrentUserResponse, void>({
      query: () => ({ url: "/auth/whoami", method: "GET" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          dispatch(setCurrentUser((await queryFulfilled).data.user))
        } catch (error) {
          if (getRequestStatus(error) === 401) {
            dispatch(clearAuth())
          } else {
            dispatch(setAuthError("Unable to verify your session. Please try again."))
          }
        }
      },
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } finally {
          dispatch(clearAuth())
        }
      },
    }),
  }),
})

export const { useAuthLoginMutation, useAuthRegisterMutation, useAuthStudentLoginMutation, useGetCurrentUserQuery, useLogoutMutation } = authApi
