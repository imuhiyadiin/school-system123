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
  X,
  Search,
  ContactRound,
  Bus,
  Bell,
  MessageSquare,
  Moon,
  Sun,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-provider"
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
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
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
    user?.role === "TEACHER" || user?.role === "ADMIN" || !user?.permissions?.length
      ? baseNavigation
      : baseNavigation.filter(
          (item) =>
            item.href === "/dashboud" || user.permissions?.includes(item.href)
        )
  const logout = () => {
    setIsMobileSidebarOpen(false)
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
        mobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onNavigate={(href) => {
          setIsMobileSidebarOpen(false)
          router.push(href)
        }}
        onThemeToggle={() =>
          setTheme(resolvedTheme === "dark" ? "light" : "dark")
        }
        onSettings={() => {
          setIsMobileSidebarOpen(false)
          router.push("/dashboud/settings")
        }}
        onLogout={logout}
      />
      {isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close dashboard menu"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[1px] sm:hidden"
        />
      )}
      <div className={isSidebarCollapsed ? "sm:pl-16" : "sm:pl-72"}>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-3 backdrop-blur sm:h-16 sm:gap-4 sm:px-8">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              if (window.matchMedia("(min-width: 640px)").matches) {
                setIsSidebarCollapsed((collapsed) => !collapsed)
              } else {
                setIsMobileSidebarOpen((open) => !open)
              }
            }}
            aria-label={isMobileSidebarOpen ? "Close dashboard menu" : "Open dashboard menu"}
            aria-controls="dashboard-navigation"
            aria-expanded={isMobileSidebarOpen || !isSidebarCollapsed}
            className="sm:size-8"
          >
            {isMobileSidebarOpen ? <X className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
          <div className="hidden h-8 w-px bg-slate-200 sm:block" />
          <label className="relative hidden max-w-md flex-1 sm:block">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search students, teachers, classes..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-4 pl-10 text-sm transition outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
            <kbd className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-slate-400">
              ⌘K
            </kbd>
          </label>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="rounded-xl p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600" aria-label="Toggle color mode">
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button type="button" aria-label="Notifications" className="relative rounded-xl p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </button>
            <button type="button" aria-label="Messages" className="hidden rounded-xl p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 sm:block">
              <MessageSquare className="h-4 w-4" />
            </button>
            <div className="ml-1 flex items-center gap-2 border-l border-slate-200 pl-3 sm:gap-3 sm:pl-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">{user?.fullName ?? user?.username ?? user?.email ?? "User"}</p>
                <p className="text-xs text-emerald-600">{user?.role ? `${user.role.charAt(0)}${user.role.slice(1).toLowerCase()} role` : "School account"}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {(user?.fullName ?? user?.username ?? user?.email ?? "U").charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <div className="min-w-0">{children}</div>
      </div>
      <MobileScrollTop />
    </main>
  )
}
