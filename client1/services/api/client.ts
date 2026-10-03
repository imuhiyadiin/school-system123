import axios from "axios"

export const apiClient = axios.create({
  // Use the frontend origin; next.config.ts proxies /api requests to the backend.
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth-token")
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = ["/auth/login", "/student/login", "/teacher/login"].includes(error.config?.url ?? "")

    if (typeof window !== "undefined" && error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("auth-token")
      localStorage.removeItem("user-data")
      window.dispatchEvent(new Event("auth-unauthorized"))
    }
    return Promise.reject(error)
  },
)
