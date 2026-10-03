import axios from "axios"

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, "")
const apiBaseUrl = normalizedApiUrl.endsWith("/api")
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
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
