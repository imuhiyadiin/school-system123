"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"

import type { AppDispatch, RootState } from "@/lib/store"
import { useGetCurrentUserQuery } from "@/services/auth/authApi"
import { restoreSession } from "@/services/auth/authSlice"
import { clearAuth } from "@/services/auth/authSlice"
import { clearStudentDashboard } from "@/services/dashboard/dashboardSlice"

export default function AuthSession({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isInitialized, token, user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    const savedUser = localStorage.getItem("user-data")
    const savedToken = localStorage.getItem("auth-token")
    const user = savedUser ? JSON.parse(savedUser) : null
    const token = savedToken ?? user?.access_token ?? null
    dispatch(restoreSession({ user, token }))
  }, [dispatch])

  useGetCurrentUserQuery(undefined, { skip: !token })

  useEffect(() => {
    const onUnauthorized = () => {
      dispatch(clearStudentDashboard())
      dispatch(clearAuth())
      router.replace("/singIn")
    }
    window.addEventListener("auth-unauthorized", onUnauthorized)
    return () => window.removeEventListener("auth-unauthorized", onUnauthorized)
  }, [dispatch, router])

  useEffect(() => {
    if (!isInitialized || !pathname.startsWith("/dashboud")) return
    if (!isAuthenticated) router.replace("/singIn")
    if (isAuthenticated && user?.role === "TEACHER") {
      if (pathname === "/dashboud") {
        window.location.replace("/dashboud/exams")
      } else if (
        pathname !== "/dashboud/exams" &&
        !pathname.startsWith("/dashboud/exams/") &&
        pathname !== "/dashboud/results"
      ) {
        window.location.replace("/dashboud/exams")
      }
      return
    }
    if (pathname.startsWith("/dashboud/resources") && user?.role !== "ADMIN") router.replace("/dashboud")
  }, [isAuthenticated, isInitialized, pathname, router, user?.role])

  if (pathname.startsWith("/dashboud") && !isInitialized) return null

  return children
}
