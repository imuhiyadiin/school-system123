"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
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
} from "lucide-react"
import type { AppDispatch, RootState } from "@/lib/store"
import { clearAuth } from "@/services/auth/authSlice"
import { clearStudentDashboard, loadAdminDashboard, loadStudentDashboard, loadTeacherDashboard } from "@/services/dashboard/dashboardSlice"

const adminNavigation = [
  { label: "Dashboard", icon: LayoutDashboard, active: true, href: "/dashboud/dashboard" },
  { label: "Students", icon: GraduationCap, href: "/dashboud/students" },
  { label: "Teachers", icon: UsersRound, href: "/dashboud/teachers" },
  { label: "Classrooms", icon: House, href: "/dashboud/classrooms" },
  { label: "Subjects", icon: BookOpen, href: "/dashboud/subjects" },
  { label: "Exams", icon: ClipboardList, href: "/dashboud/exams" },
  { label: "Results", icon: FileText, href: "/dashboud/results" },
  { label: "Attendance", icon: CheckCircle2, href: "/dashboud/attendance" },
  { label: "Timetable", icon: CalendarDays, href: "/dashboud/timetable" },
  { label: "Cashier", icon: Users, href: "/dashboud/cashier" },
  { label: "Issues", icon: ShieldAlert, href: "/dashboud/issues" },
  { label: "Users", icon: Users, href: "/dashboud/users" },
]

const studentNavigation = [
  { label: "Dashboard", icon: LayoutDashboard, active: true, href: "/dashboud/dashboard" },
  { label: "Profile", icon: GraduationCap, href: "/dashboud/profile" },
  { label: "Subjects", icon: BookOpen, href: "/dashboud/subjects" },
  { label: "Exam Routine", icon: ClipboardList, href: "/dashboud/exam-routine" },
  { label: "Results", icon: FileText, href: "/dashboud/results" },
  { label: "Attendance", icon: CheckCircle2, href: "/dashboud/attendance" },
]

const teacherNavigation = [
  { label: "Exams", icon: ClipboardList, href: "/dashboud/exams" },
  { label: "Exam Results", icon: FileText, href: "/dashboud/results" },
  { label: "Attendance", icon: CheckCircle2, href: "/dashboud/attendance" },
]

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const { user, isInitialized } = useSelector((state: RootState) => state.auth)
  const { profile, attendance, results, exams, subjects, timetable, notices, adminStats, isLoading, error, loadedForUserId } = useSelector((state: RootState) => state.studentDashboard)
  const isAdmin = user?.role === "ADMIN"
  const isTeacher = user?.role === "TEACHER"
  const navigation = isAdmin ? adminNavigation : isTeacher ? teacherNavigation : studentNavigation

  useEffect(() => {
    if (!isInitialized || !user || user.id === loadedForUserId || isLoading) return
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
  const attendanceToday = attendance.filter((item) => item.date.slice(0, 10) === today)
  const presentToday = attendanceToday.filter((item) => item.status).length
  const pendingIssues = notices.filter((item) => !item.isResolved).length
  const recentAttendance = attendance.slice(-5).reverse()
  const recentIssues = notices.slice(-5).reverse()
  const recentResults = results.slice(-5).reverse()
  const maxChartValue = isAdmin
    ? Math.max(adminStats?.students ?? 0, adminStats?.teachers ?? 0, adminStats?.subjects ?? 0, adminStats?.results ?? 0, adminStats?.attendance ?? 0, 1)
    : Math.max(attendance.length, results.length, subjects.length, 1)

  const statistics = isAdmin ? [
    { label: "Total Users", value: adminStats?.users, icon: Users, accent: "bg-blue-50 text-blue-600", detail: "From live database" },
    { label: "Total Students", value: adminStats?.students, icon: GraduationCap, accent: "bg-emerald-50 text-emerald-600", detail: "From live database" },
    { label: "Total Teachers", value: adminStats?.teachers, icon: UsersRound, accent: "bg-sky-50 text-sky-600", detail: "From live database" },
    { label: "Total Results", value: adminStats?.results, icon: FileText, accent: "bg-blue-50 text-blue-600", detail: "From live database" },
  ] : isTeacher ? [
    { label: "Student Results", value: results.length, icon: FileText, accent: "bg-sky-50 text-sky-600", detail: "Published exam results" },
    { label: "Students", value: undefined, icon: GraduationCap, accent: "bg-emerald-50 text-emerald-600", detail: "View student records" },
  ] : [
    { label: "Attendance", value: isLoading ? undefined : presentToday, icon: CheckCircle2, accent: "bg-emerald-50 text-emerald-600", detail: `${attendanceToday.length} records today` },
    { label: "Homework", value: undefined, icon: ClipboardList, accent: "bg-blue-50 text-blue-600", detail: "No Data Available" },
    { label: "Results", value: results.length, icon: FileText, accent: "bg-sky-50 text-sky-600", detail: "From live database" },
    { label: "Exam Routine", value: exams.length || timetable.length, icon: CalendarDays, accent: "bg-blue-50 text-blue-600", detail: "From live database" },
    { label: "Notice & Events", value: pendingIssues, icon: Bell, accent: "bg-emerald-50 text-emerald-600", detail: "Student notices" },
    { label: "Subjects", value: subjects.length, icon: BookOpen, accent: "bg-sky-50 text-sky-600", detail: "Current class subjects" },
  ]

  return (
    <main className="dashboard-theme min-h-svh bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-16 flex-col overflow-y-auto border-r border-slate-200 bg-white px-2 py-5 sm:w-64 sm:px-4">
        <div className="flex items-center gap-3 px-1 sm:px-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-500/25">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold leading-tight">Creative Readers</p>
            <p className="text-xs text-slate-500">School Management</p>
          </div>
        </div>

        <nav className="mt-8 flex-1 space-y-1">
          <p className="hidden px-3 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 sm:block">Main menu</p>
          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <button key={item.label} onClick={() => "href" in item && item.href && router.push(item.href as string)} className={`flex w-full justify-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition sm:justify-start ${item.active ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/20" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"}`}>
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            )
          })}
          <div className="pt-5">
            <p className="hidden px-3 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 sm:block">Account</p>
            <button onClick={() => router.push("/dashboud/settings")} className="flex w-full justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 sm:justify-start"><Settings className="h-4.5 w-4.5 shrink-0" /><span className="hidden sm:inline">Settings</span></button>
            <button onClick={logout} className="flex w-full justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 sm:justify-start"><LogOut className="h-4.5 w-4.5 shrink-0" /><span className="hidden sm:inline">Logout</span></button>
          </div>
        </nav>
      </aside>

      <div className="pl-16 sm:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 xl:hidden">
              <button className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100"><Menu className="h-5 w-5" /></button>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white"><BookOpen className="h-5 w-5" /></div>
            </div>
            <div className="hidden max-w-md flex-1 md:block">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                <input type="search" placeholder="Search students, teachers, or records..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" />
              </label>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="rounded-xl p-2.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600" aria-label="Toggle dark mode">{resolvedTheme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}</button>
              <button className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"><Bell className="h-4.5 w-4.5" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-white" /></button>
              <button className="hidden rounded-xl p-2.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 sm:block"><MessageSquare className="h-4.5 w-4.5" /></button>
              <div className="ml-1 flex items-center gap-2 border-l border-slate-200 pl-3 sm:ml-2 sm:gap-3 sm:pl-4">
                <div className="hidden text-right sm:block"><p className="text-sm font-semibold">{profile?.fullName ?? user?.fullName ?? (isAdmin ? "Administrator" : isTeacher ? "Teacher" : "Student")}</p><p className="text-xs text-emerald-600">{isAdmin ? "Admin role" : isTeacher ? "Teacher role" : profile?.classrooms[0] ? `${profile.classrooms[0].classroom.name} · ${profile.classrooms[0].classroom.section}` : "Student ID pending"}</p></div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{(profile?.fullName ?? user?.fullName ?? (isAdmin ? "A" : isTeacher ? "T" : "S")).charAt(0).toUpperCase()}</div>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-sm font-semibold text-emerald-600">{isAdmin ? "Admin Overview" : isTeacher ? "Teacher Overview" : "Student Overview"}</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Good morning, {profile?.fullName ?? user?.fullName ?? (isAdmin ? "Administrator" : isTeacher ? "Teacher" : "Student")}</h1><p className="mt-2 text-sm text-slate-500">{isAdmin ? "Live school statistics from the database" : isTeacher ? "Student exam results available below" : `Student ID: ${profile?.id ?? "Loading..."}${profile?.classrooms[0] ? ` · ${profile.classrooms[0].classroom.name} ${profile.classrooms[0].classroom.section}` : ""}`}</p></div>
            <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"><CalendarDays className="h-4 w-4" />{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</div>
          </div>

          {error && <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statistics.map((item) => {
              const Icon = item.icon

              return <article key={item.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-950/5"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{item.label}</p><p className="mt-2 text-3xl font-bold tracking-tight">{isLoading ? <span className="inline-block h-8 w-14 animate-pulse rounded bg-slate-100" /> : item.value ?? "—"}</p></div><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.accent}`}><Icon className="h-5 w-5" /></div></div><p className="mt-3 text-xs font-medium text-slate-400">{item.detail}</p></article>
            })}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
            <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold">My performance</h2><p className="mt-1 text-sm text-slate-500">Live records from your school account</p></div><button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"><MoreHorizontal className="h-5 w-5" /></button></div><div className="mt-8 flex h-52 items-end justify-around gap-4 border-b border-slate-100 pb-2"><ChartBar label="Attendance" value={isAdmin ? adminStats?.attendance ?? 0 : attendance.length} max={maxChartValue} color="bg-blue-600" /><ChartBar label="Subjects" value={isAdmin ? adminStats?.subjects ?? 0 : subjects.length} max={maxChartValue} color="bg-emerald-500" /><ChartBar label="Results" value={isAdmin ? adminStats?.results ?? 0 : results.length} max={maxChartValue} color="bg-sky-500" /></div><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-blue-600" />Attendance</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-emerald-500" />Subjects</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-sky-500" />Results</span></div></article>
            <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold">Current class</h2><p className="mt-1 text-sm text-slate-500">Your routine and subjects</p></div><ChevronRight className="h-5 w-5 text-slate-400" /></div><div className="mt-5 grid grid-cols-2 gap-3">{timetable.length ? timetable.slice(0, 6).map((item) => <div key={item.id} className="rounded-xl border border-slate-200 px-3 py-3 text-left text-xs font-semibold text-slate-600"><span className="mr-1 text-base leading-none text-blue-600">•</span>{item.day}: {item.subject}</div>) : <EmptyState text="No Data Available" />}</div></article>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
            <DataPanel title="Recent results" subtitle="Latest published records"><div className="space-y-3">{recentResults.length ? recentResults.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3"><div><p className="text-sm font-semibold">Student record</p><p className="mt-0.5 text-xs text-slate-500">ID: {item.studentId.slice(0, 8)}</p></div><span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-sm font-bold text-emerald-700">{item.marks}%</span></div>) : <EmptyState text="No result records available" />}</div></DataPanel>
            <DataPanel title="Recent attendance" subtitle="Latest attendance records"><div className="space-y-3">{recentAttendance.length ? recentAttendance.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3"><div><p className="text-sm font-semibold">Student record</p><p className="mt-0.5 text-xs text-slate-500">{new Date(item.date).toLocaleDateString()}</p></div><span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${item.status ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{item.status ? "Present" : "Absent"}</span></div>) : <EmptyState text="No attendance records today" />}</div></DataPanel>
            <DataPanel title="Recent issues" subtitle="Student support requests"><div className="space-y-3">{recentIssues.length ? recentIssues.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.type}</p><p className="mt-0.5 truncate text-xs text-slate-500">{item.details}</p></div><span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${item.isResolved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{item.isResolved ? "Resolved" : "Pending"}</span></div>) : <EmptyState text="No issue records available" />}</div></DataPanel>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <DataPanel title="Subjects" subtitle="Subjects for your current class"><div className="space-y-3">{subjects.length ? subjects.map((item) => <div key={item.id} className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">{item.name}</div>) : <EmptyState text="No Data Available" />}</div></DataPanel>
            <DataPanel title="Exam routine" subtitle="Upcoming exam schedule"><div className="space-y-3">{exams.length ? exams.map((item) => <div key={item.id} className="flex justify-between rounded-xl bg-slate-50 px-3 py-3 text-sm"><span className="font-semibold text-slate-700">{item.name}</span><span className="text-slate-500">{new Date(item.date).toLocaleDateString()}</span></div>) : <EmptyState text="No Data Available" />}</div></DataPanel>
          </div>
        </section>
      </div>
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Scroll to top" className="fixed right-4 bottom-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 sm:hidden"><ChevronUp className="h-5 w-5" /></button>
    </main>
  )
}

function ChartBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const height = `${Math.max((value / max) * 100, value ? 8 : 2)}%`

  return <div className="flex h-full flex-1 flex-col justify-end text-center"><span className="mb-2 text-sm font-bold text-slate-700">{value}</span><div className={`mx-auto w-full max-w-16 rounded-t-xl ${color} transition-all duration-700`} style={{ height }} /><span className="mt-3 text-xs font-medium text-slate-500">{label}</span></div>
}

function DataPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-start justify-between"><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div><button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"><MoreHorizontal className="h-5 w-5" /></button></div>{children}</article>
}

function EmptyState({ text }: { text: string }) {
  return <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">{text}</div>
}
