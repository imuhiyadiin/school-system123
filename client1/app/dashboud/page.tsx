"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-provider"
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileText,
  GraduationCap,
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  MoreHorizontal,
  Search,
  Settings,
  ShieldAlert,
  Sun,
  Users,
  UsersRound,
  ContactRound,
  CircleDollarSign,
  Bus,
} from "lucide-react"
import type { AppDispatch, RootState } from "@/lib/store"
import { clearAuth } from "@/services/auth/authSlice"
import {
  clearStudentDashboard,
  loadAdminDashboard,
  loadStudentDashboard,
  loadTeacherDashboard,
} from "@/services/dashboard/dashboardSlice"

const menuTitle = (index: number) => {
  if (index === 0) return "Overview"
  if (index === 1) return "Academic"
  if (index === 7) return "Management"
  return ""
}

const adminNavigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    active: true,
    href: "/dashboud/dashboard",
  },
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
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    active: true,
    href: "/dashboud/dashboard",
  },
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

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const { user, isInitialized } = useSelector((state: RootState) => state.auth)
  const {
    profile,
    attendance,
    results,
    exams,
    subjects,
    timetable,
    notices,
    adminStats,
    isLoading,
    error,
    loadedForUserId,
  } = useSelector((state: RootState) => state.studentDashboard)
  const isAdmin = user?.role === "ADMIN"
  const isTeacher = user?.role === "TEACHER"
  const [expandedSidebarItems, setExpandedSidebarItems] = useState<
    Record<string, boolean>
  >({})
  const baseNavigation = isAdmin
    ? adminNavigation
    : isTeacher
      ? teacherNavigation
      : user?.role === "User" || user?.role === "CASHIER"
        ? adminNavigation
        : studentNavigation
  const navigation =
    isTeacher || isAdmin || !user?.permissions?.length
      ? baseNavigation
      : baseNavigation.filter(
          (item) =>
            item.href === "/dashboud" || user.permissions?.includes(item.href)
        )
  const mainNavigation = navigation.filter(
    (item) => !("account" in item && item.account)
  )
  const accountNavigation = navigation.filter(
    (item) => "account" in item && item.account
  )

  useEffect(() => {
    if (!isInitialized || !user || user.id === loadedForUserId || isLoading)
      return
    if (user.role === "STUDENT") dispatch(loadStudentDashboard(user.id))
    if (user.role === "ADMIN") dispatch(loadAdminDashboard(user.id))
    if (user.role === "TEACHER") dispatch(loadTeacherDashboard(user.id))
  }, [dispatch, isInitialized, isLoading, loadedForUserId, user])

  const logout = () => {
    dispatch(clearStudentDashboard())
    dispatch(clearAuth())
    router.replace("/singIn")
  }

  const today = new Date().toISOString().slice(0, 10)
  const attendanceToday = attendance.filter(
    (item) => item.date.slice(0, 10) === today
  )
  const presentToday = attendanceToday.filter((item) => item.status).length
  const pendingIssues = notices.filter((item) => !item.isResolved).length
  const recentAttendance = attendance.slice(-5).reverse()
  const recentIssues = notices.slice(-5).reverse()
  const recentResults = results.slice(-5).reverse()
  const maxChartValue = isAdmin
    ? Math.max(
        adminStats?.students ?? 0,
        adminStats?.teachers ?? 0,
        adminStats?.subjects ?? 0,
        adminStats?.results ?? 0,
        adminStats?.attendance ?? 0,
        1
      )
    : Math.max(attendance.length, results.length, subjects.length, 1)
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  })

  const statistics = isAdmin
    ? [
        {
          label: "Total Users",
          value: adminStats?.users,
          icon: Users,
          accent: "bg-blue-50 text-blue-600",
          detail: "From live database",
        },
        {
          label: "Total Students",
          value: adminStats?.students,
          icon: GraduationCap,
          accent: "bg-emerald-50 text-emerald-600",
          detail: "From live database",
        },
        {
          label: "Total Teachers",
          value: adminStats?.teachers,
          icon: UsersRound,
          accent: "bg-sky-50 text-sky-600",
          detail: "From live database",
        },
        {
          label: "Total Buses",
          value: adminStats?.buses,
          icon: Bus,
          accent: "bg-amber-50 text-amber-600",
          detail: "Registered buses",
        },
        {
          label: "Students with Bus",
          value: adminStats?.studentsWithBus,
          icon: GraduationCap,
          accent: "bg-violet-50 text-violet-600",
          detail: "Students assigned to a bus",
        },
        {
          label: "Total Results",
          value: adminStats?.results,
          icon: FileText,
          accent: "bg-blue-50 text-blue-600",
          detail: "From live database",
        },
        {
          label: "Total Fees",
          value: money.format(adminStats?.totalFees ?? 0),
          icon: CircleDollarSign,
          accent: "bg-emerald-50 text-emerald-600",
          detail: "Student fees assigned",
        },
        {
          label: "Total Basic Salary",
          value: money.format(adminStats?.totalBasicSalary ?? 0),
          icon: CircleDollarSign,
          accent: "bg-violet-50 text-violet-600",
          detail: "Teachers and staff",
        },
      ]
    : isTeacher
      ? [
          {
            label: "Student Results",
            value: results.length,
            icon: FileText,
            accent: "bg-sky-50 text-sky-600",
            detail: "Published exam results",
          },
          {
            label: "Students",
            value: undefined,
            icon: GraduationCap,
            accent: "bg-emerald-50 text-emerald-600",
            detail: "View student records",
          },
        ]
      : [
          {
            label: "Attendance",
            value: isLoading ? undefined : presentToday,
            icon: CheckCircle2,
            accent: "bg-emerald-50 text-emerald-600",
            detail: `${attendanceToday.length} records today`,
          },
          {
            label: "Homework",
            value: undefined,
            icon: ClipboardList,
            accent: "bg-blue-50 text-blue-600",
            detail: "No Data Available",
          },
          {
            label: "Results",
            value: results.length,
            icon: FileText,
            accent: "bg-sky-50 text-sky-600",
            detail: "From live database",
          },
          {
            label: "Exam Routine",
            value: exams.length || timetable.length,
            icon: CalendarDays,
            accent: "bg-blue-50 text-blue-600",
            detail: "From live database",
          },
          {
            label: "Notice & Events",
            value: pendingIssues,
            icon: Bell,
            accent: "bg-emerald-50 text-emerald-600",
            detail: "Student notices",
          },
          {
            label: "Subjects",
            value: subjects.length,
            icon: BookOpen,
            accent: "bg-sky-50 text-sky-600",
            detail: "Current class subjects",
          },
        ]

  return (
    <main className="dashboard-theme min-h-svh bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-16 flex-col overflow-y-auto border-r border-slate-200 bg-white px-2 py-5 sm:w-72 sm:px-3">
        <div className="flex items-center gap-3 px-1 sm:px-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-violet-300 shadow-lg shadow-black/30 ring-1 ring-zinc-700">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm leading-tight font-bold">Creative Readers</p>
            <p className="text-xs text-slate-500">School Management</p>
          </div>
        </div>

        <nav className="mt-8 flex-1 space-y-1">
          {mainNavigation.map((item, index) => {
            const Icon = item.icon
            const title = menuTitle(index)
            const children =
              "children" in item && Array.isArray(item.children)
                ? (item.children as { label: string; href: string }[])
                : []

            return (
              <div key={item.label} className={title ? "pt-4 first:pt-0" : ""}>
                {title && (
                  <p className="hidden px-3 pb-2 text-sm font-medium text-slate-500 sm:block">
                    {title}
                  </p>
                )}
                <button
                  onClick={() => {
                    if (children.length) {
                      setExpandedSidebarItems((current) => ({
                        ...current,
                        [item.label]: !current[item.label],
                      }))
                      return
                    }
                    router.push(item.href)
                  }}
                  className={`flex w-full justify-center gap-3 rounded-lg px-3 py-2.5 text-left text-base font-medium transition sm:justify-start ${item.label === "Dashboard" ? "bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700" : "text-slate-700 hover:bg-zinc-800 hover:text-white"}`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {children.length > 0 && (
                    <ChevronDown
                      className={`ml-auto hidden h-4 w-4 transition-transform sm:block ${expandedSidebarItems[item.label] ? "rotate-180" : ""}`}
                    />
                  )}
                </button>
                {children.length > 0 && expandedSidebarItems[item.label] && (
                    <div className="relative mt-1 ml-7 hidden space-y-1 border-l border-slate-200 pl-3 sm:block">
                    {children.map((child) => (
                        <button
                          key={child.href}
                          onClick={() => router.push(child.href)}
                          className="block w-full rounded-md px-3 py-1.5 text-left text-sm text-slate-600 transition hover:bg-zinc-800 hover:text-white"
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            )
          })}
          <div className="pt-5">
            <p className="hidden px-3 pb-2 text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase sm:block">
              Account
            </p>
            {accountNavigation.map((item) => {
              const Icon = item.icon
              const children =
                "children" in item && Array.isArray(item.children)
                  ? (item.children as { label: string; href: string }[])
                  : []
              return (
                <div key={item.label}>
                  <button
                    onClick={() => {
                      if (children.length) {
                        setExpandedSidebarItems((current) => ({
                          ...current,
                          [item.label]: !current[item.label],
                        }))
                        return
                      }
                      router.push(item.href)
                    }}
                    className="flex w-full justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-zinc-800 hover:text-white sm:justify-start"
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span className="hidden sm:inline">{item.label}</span>
                    {children.length > 0 && (
                      <ChevronDown
                        className={`ml-auto hidden h-4 w-4 transition-transform sm:block ${expandedSidebarItems[item.label] ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                  {children.length > 0 && expandedSidebarItems[item.label] && (
                    <div className="relative mt-1 ml-7 hidden space-y-1 border-l border-slate-200 pl-3 sm:block">
                      {children.map((child) => (
                        <button
                          key={child.href}
                          onClick={() => router.push(child.href)}
                          className="block w-full rounded-md px-3 py-1.5 text-left text-sm text-slate-600 transition hover:bg-zinc-800 hover:text-white"
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            <button
              onClick={() => router.push("/dashboud/settings")}
              className="flex w-full justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-zinc-800 hover:text-white sm:justify-start"
            >
              <Settings className="h-4.5 w-4.5 shrink-0" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button
              onClick={logout}
              className="flex w-full justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-400 transition hover:bg-rose-950/40 sm:justify-start"
            >
              <LogOut className="h-4.5 w-4.5 shrink-0" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      <div className="pl-16 sm:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 xl:hidden">
              <button className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100">
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-violet-300 ring-1 ring-zinc-700">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <div className="hidden max-w-md flex-1 md:block">
              <label className="relative block">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search students, teachers, or records..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-sm transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </label>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                className="rounded-xl p-2.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                aria-label="Toggle dark mode"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-4.5 w-4.5" />
                ) : (
                  <Moon className="h-4.5 w-4.5" />
                )}
              </button>
              <button className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600">
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </button>
              <button className="hidden rounded-xl p-2.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 sm:block">
                <MessageSquare className="h-4.5 w-4.5" />
              </button>
              <div className="ml-1 flex items-center gap-2 border-l border-slate-200 pl-3 sm:ml-2 sm:gap-3 sm:pl-4">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold">
                    {profile?.fullName ??
                      user?.fullName ??
                      (isAdmin
                        ? "Administrator"
                        : isTeacher
                          ? "Teacher"
                          : "Student")}
                  </p>
                  <p className="text-xs text-emerald-600">
                    {isAdmin
                      ? "Admin role"
                      : isTeacher
                        ? "Teacher role"
                        : profile?.classrooms[0]
                          ? `${profile.classrooms[0].classroom.name} · ${profile.classrooms[0].classroom.section}`
                          : "Student ID pending"}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {(
                    profile?.fullName ??
                    user?.fullName ??
                    (isAdmin ? "A" : isTeacher ? "T" : "S")
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-emerald-600">
                {isAdmin
                  ? "Admin Overview"
                  : isTeacher
                    ? "Teacher Overview"
                    : "Student Overview"}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Good morning,{" "}
                {profile?.fullName ??
                  user?.fullName ??
                  (isAdmin
                    ? "Administrator"
                    : isTeacher
                      ? "Teacher"
                      : "Student")}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {isAdmin
                  ? "Live school statistics from the database"
                  : isTeacher
                    ? "Student exam results available below"
                    : `Student ID: ${profile?.id ?? "Loading..."}${profile?.classrooms[0] ? ` · ${profile.classrooms[0].classroom.name} ${profile.classrooms[0].classroom.section}` : ""}`}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
              <CalendarDays className="h-4 w-4" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statistics.map((item) => {
              const Icon = item.icon

              return (
                <article
                  key={item.label}
                  className="dashboard-stat-card rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-950/5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="dashboard-stat-label text-sm font-medium text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-3xl font-bold tracking-tight">
                        {isLoading ? (
                          <span className="inline-block h-8 w-14 animate-pulse rounded bg-slate-100" />
                        ) : (
                          (item.value ?? "—")
                        )}
                      </p>
                    </div>
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.accent}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-medium text-slate-400">
                    {item.detail}
                  </p>
                </article>
              )
            })}
          </div>

          <div className="mt-6">
            <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">My performance</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Live records from your school account
                  </p>
                </div>
                <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
              <PerformanceChart
                items={[
                  {
                    label: "Attendance",
                    value: isAdmin
                      ? (adminStats?.attendance ?? 0)
                      : attendance.length,
                  },
                  ...(isAdmin
                    ? [{ label: "Students", value: adminStats?.students ?? 0 }]
                    : []),
                  ...(isAdmin
                    ? [{ label: "Buses", value: adminStats?.buses ?? 0 }]
                    : []),
                  {
                    label: "Subjects",
                    value: isAdmin ? (adminStats?.subjects ?? 0) : subjects.length,
                  },
                  {
                    label: "Results",
                    value: isAdmin ? (adminStats?.results ?? 0) : results.length,
                  },
                ]}
              />
              <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-2">
                  <i className="h-2 w-2 rounded-full bg-blue-600" />
                  Attendance
                </span>
                {isAdmin && (
                  <span className="flex items-center gap-2">
                    <i className="h-2 w-2 rounded-full bg-rose-500" />
                    Students
                  </span>
                )}
                {isAdmin && (
                  <span className="flex items-center gap-2">
                    <i className="h-2 w-2 rounded-full bg-amber-500" />
                    Buses
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <i className="h-2 w-2 rounded-full bg-emerald-500" />
                  Subjects
                </span>
                <span className="flex items-center gap-2">
                  <i className="h-2 w-2 rounded-full bg-sky-500" />
                  Results
                </span>
              </div>
            </article>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
            <DataPanel
              title="Recent results"
              subtitle="Latest published records"
            >
              <div className="space-y-3">
                {recentResults.length ? (
                  recentResults.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">Student record</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          ID: {item.studentId.slice(0, 8)}
                        </p>
                      </div>
                      <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-sm font-bold text-emerald-700">
                        {item.marks}%
                      </span>
                    </div>
                  ))
                ) : (
                  <EmptyState text="No result records available" />
                )}
              </div>
            </DataPanel>
            <DataPanel
              title="Recent attendance"
              subtitle="Latest attendance records"
            >
              <div className="space-y-3">
                {recentAttendance.length ? (
                  recentAttendance.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">Student record</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold ${item.status ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                      >
                        {item.status ? "Present" : "Absent"}
                      </span>
                    </div>
                  ))
                ) : (
                  <EmptyState text="No attendance records today" />
                )}
              </div>
            </DataPanel>
            <DataPanel
              title="Recent issues"
              subtitle="Student support requests"
            >
              <div className="space-y-3">
                {recentIssues.length ? (
                  recentIssues.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {item.type}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {item.details}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${item.isResolved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {item.isResolved ? "Resolved" : "Pending"}
                      </span>
                    </div>
                  ))
                ) : (
                  <EmptyState text="No issue records available" />
                )}
              </div>
            </DataPanel>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <DataPanel
              title="Subjects"
              subtitle="Subjects for your current class"
            >
              <div className="space-y-3">
                {subjects.length ? (
                  subjects.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700"
                    >
                      {item.name}
                    </div>
                  ))
                ) : (
                  <EmptyState text="No Data Available" />
                )}
              </div>
            </DataPanel>
            <DataPanel title="Exam routine" subtitle="Upcoming exam schedule">
              <div className="space-y-3">
                {exams.length ? (
                  exams.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between rounded-xl bg-slate-50 px-3 py-3 text-sm"
                    >
                      <span className="font-semibold text-slate-700">
                        {item.name}
                      </span>
                      <span className="text-slate-500">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <EmptyState text="No Data Available" />
                )}
              </div>
            </DataPanel>
          </div>
        </section>
      </div>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        className="fixed right-4 bottom-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 sm:hidden"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </main>
  )
}

function PerformanceChart({
  items,
}: {
  items: Array<{ label: string; value: number }>
}) {
  const max = Math.max(...items.map((item) => item.value), 1)
  const width = 720
  const height = 220
  const baseline = 184
  const points = items.map((item, index) => ({
    x: 56 + (index * 608) / Math.max(items.length - 1, 1),
    y: baseline - (Math.max(item.value / max, 0.08) * 132),
  }))
  const line = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    const previous = points[index - 1]
    const middleX = (previous.x + point.x) / 2
    return `${path} Q ${previous.x} ${previous.y} ${middleX} ${(previous.y + point.y) / 2}`
  }, "")
  const finalPoint = points.at(-1) ?? { x: 664, y: baseline }
  const curve = `${line} T ${finalPoint.x} ${finalPoint.y}`
  const area = `${curve} L ${finalPoint.x} ${baseline} L ${points[0]?.x ?? 56} ${baseline} Z`

  return (
    <div className="dashboard-performance-chart mt-7 overflow-hidden rounded-xl border border-slate-100 p-3 sm:p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="School performance trend chart"
        className="h-72 w-full sm:h-80"
      >
        <defs>
          <linearGradient id="performance-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.34" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[48, 92, 136, baseline].map((y) => (
          <line
            key={y}
            x1="40"
            x2="680"
            y1={y}
            y2={y}
            className="dashboard-chart-grid"
          />
        ))}
        <path d={area} className="dashboard-chart-area" />
        <path d={curve} className="dashboard-chart-line" />
        {points.map((point, index) => (
          <g key={items[index].label}>
            <circle cx={point.x} cy={point.y} r="5" className="dashboard-chart-dot" />
            <text x={point.x} y={baseline + 24} textAnchor="middle" className="dashboard-chart-label">
              {items[index].label}
            </text>
            <text x={point.x} y={point.y - 12} textAnchor="middle" className="dashboard-chart-value">
              {items[index].value}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function DataPanel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="font-bold">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      {children}
    </article>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">
      {text}
    </div>
  )
}
