import axios from "axios"

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
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
    const isLoginRequest = ["/auth/login", "/student/login"].includes(error.config?.url)

    if (typeof window !== "undefined" && error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("auth-token")
      localStorage.removeItem("user-data")
      window.dispatchEvent(new Event("auth-unauthorized"))
    }
    return Promise.reject(error)
  },
)
