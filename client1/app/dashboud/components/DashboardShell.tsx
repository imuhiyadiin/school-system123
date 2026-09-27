"use client"

import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  House,
  LayoutDashboard,
  ShieldAlert,
  Users,
  UsersRound,
  PanelLeft,
  Search,
  ContactRound,
  Bus,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useDispatch, useSelector } from "react-redux"
import { useState } from "react"
import type { AppDispatch, RootState } from "@/lib/store"
import { clearAuth } from "@/services/auth/authSlice"
import { clearStudentDashboard } from "@/services/dashboard/dashboardSlice"
import { Button } from "@/components/ui/button"
import { MobileScrollTop, Sidebar } from "./sidebar/Sidebar"

const adminNavigation = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboud" },
  { label: "Students", icon: GraduationCap, href: "/dashboud/students" },
  { label: "Teachers", icon: UsersRound, href: "/dashboud/teachers" },
  { label: "Classrooms", icon: House, href: "/dashboud/classrooms" },
  { label: "Subjects", icon: BookOpen, href: "/dashboud/subjects" },
  { label: "Exams", icon: ClipboardList, href: "/dashboud/exams" },
  { label: "Results", icon: FileText, href: "/dashboud/results" },
  { label: "Attendance", icon: CheckCircle2, href: "/dashboud/attendance" },
  { label: "Buses", icon: Bus, href: "/dashboud/buses" },
  { label: "Fees", icon: Users, href: "/dashboud/fees", account: true },
  {
    label: "Employee Staff",
    icon: ContactRound,
    href: "/dashboud/staff",
  },
  { label: "Issues", icon: ShieldAlert, href: "/dashboud/issues" },
  { label: "Users", icon: Users, href: "/dashboud/users" },
]
const studentNavigation = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboud" },
  { label: "Profile", icon: GraduationCap, href: "/dashboud/profile" },
  { label: "Subjects", icon: BookOpen, href: "/dashboud/subjects" },
  {
    label: "Exam Routine",
    icon: ClipboardList,
    href: "/dashboud/exam-routine",
  },
  { label: "Results", icon: FileText, href: "/dashboud/results" },
  { label: "Attendance", icon: CheckCircle2, href: "/dashboud/attendance" },
]
const teacherNavigation = [
  { label: "Exams", icon: ClipboardList, href: "/dashboud/exams" },
  { label: "Exam Results", icon: FileText, href: "/dashboud/results" },
  { label: "Attendance", icon: CheckCircle2, href: "/dashboud/attendance" },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { user } = useSelector((state: RootState) => state.auth)
  const { resolvedTheme, setTheme } = useTheme()
  if (pathname === "/dashboud") return <>{children}</>
  const baseNavigation =
    user?.role === "ADMIN"
      ? adminNavigation
      : user?.role === "TEACHER"
        ? teacherNavigation
        : user?.role === "User" || user?.role === "CASHIER"
          ? adminNavigation
          : studentNavigation
  const navigation =
    user?.role === "ADMIN" || !user?.permissions?.length
      ? baseNavigation
      : baseNavigation.filter(
          (item) =>
            item.href === "/dashboud" || user.permissions?.includes(item.href)
        )
  const logout = () => {
    dispatch(clearStudentDashboard())
    dispatch(clearAuth())
    router.replace("/singIn")
  }
  return (
    <main className="dashboard-theme min-h-svh bg-slate-50 text-slate-900">
      <Sidebar
        navigation={navigation}
        pathname={pathname}
        theme={resolvedTheme}
        collapsed={isSidebarCollapsed}
        onNavigate={(href) => router.push(href)}
        onThemeToggle={() =>
          setTheme(resolvedTheme === "dark" ? "light" : "dark")
        }
        onSettings={() => router.push("/dashboud/settings")}
        onLogout={logout}
      />
      <div className={isSidebarCollapsed ? "pl-16" : "pl-16 sm:pl-72"}>
        <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <div className="hidden h-8 w-px bg-slate-200 sm:block" />
          <label className="relative hidden max-w-xl flex-1 sm:block">
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search students, teachers, classes..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-14 pl-12 text-base transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
            <kbd className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-slate-400">
              ⌘K
            </kbd>
          </label>
        </header>
        {children}
      </div>
      <MobileScrollTop />
    </main>
  )
}
