"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useTheme } from "@/components/theme-provider"
import { useSelector } from "react-redux"
import {
  Award,
  Box,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  ClipboardList,
  Code2,
  FileText,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorSmartphone,
  Moon,
  Palette,
  School,
  Settings,
  ShoppingBag,
  Sparkles,
  Sun,
  UserCircle2,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import type { RootState } from "@/lib/store"
import { useLogoutMutation } from "@/services/auth/authApi"
import type { AuthUser } from "@/services/auth/authSlice"

const serviceItems = [
  { label: "Web Development", description: "Fast, scalable web experiences", icon: Code2 },
  { label: "Mobile Development", description: "Apps for every screen", icon: MonitorSmartphone },
  { label: "UI/UX Design", description: "Thoughtful digital products", icon: Palette },
]

const productItems = [
  { label: "Categories", description: "Browse by collection", icon: Layers3 },
  { label: "All Products", description: "Explore our full catalogue", icon: Box },
  { label: "Featured Products", description: "Hand-picked for you", icon: ShoppingBag },
]

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  if (pathname.startsWith("/dashboud")) {
    return null
  }

  return (
    <>
    {isHomePage && (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-20 bg-[url('/images/home-night-lake.jpg')] bg-cover bg-center bg-fixed sm:h-36"
      />
    )}
    <header className={isHomePage
      ? "fixed inset-x-3 top-3 z-50 rounded-[24px] border border-teal-200/80 bg-[linear-gradient(rgba(232,246,245,0.84),rgba(232,246,245,0.84)),url('/images/home-night-lake.jpg')] bg-cover bg-center bg-fixed shadow-lg shadow-teal-950/5 backdrop-blur-xl transition-colors dark:border-slate-700/80 dark:bg-slate-950/90 dark:shadow-black/20 sm:inset-x-9 sm:top-8 sm:rounded-[30px]"
      : "fixed inset-x-0 top-0 z-50 rounded-b-2xl border border-white/70 bg-white/80 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition-colors dark:border-slate-700/80 dark:bg-slate-950/85 dark:shadow-black/20"}>
      <div className={`mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 ${isHomePage ? "h-16 max-w-[1600px] sm:h-28 sm:px-8 lg:px-12" : "h-16 max-w-7xl"}`}>
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2 sm:gap-3"
          aria-label="Creative Readers home"
        >
          <span className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-700 to-teal-500 text-white shadow-lg shadow-teal-600/20 transition duration-300 group-hover:scale-105 ${isHomePage ? "h-10 w-10 sm:h-[70px] sm:w-[70px] sm:rounded-[20px]" : "h-10 w-10"}`}>
            <Sparkles className={isHomePage ? "h-5 w-5 sm:h-7 sm:w-7" : "h-5 w-5"} />
          </span>
          <span className="min-w-0">
            <span className={`block whitespace-nowrap leading-none tracking-wide text-slate-900 dark:text-white ${isHomePage ? "text-base sm:text-2xl" : "text-base sm:text-lg"}`} style={{ fontFamily: "var(--font-ranchers), sans-serif" }}>
              my-system HIyo
            </span>
            <span className="mt-1 block text-[10px] font-medium leading-none text-emerald-600 sm:text-xs">
              school-system
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary navigation"
        >
          <NavLink href="/#home" active={isHomePage}>Home</NavLink>
          <NavLink href="/studenLogin">Student Login</NavLink>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {isAuthenticated && user ? (
            <ProfileDropdown user={user} isOpen={profileMenuOpen} setIsOpen={setProfileMenuOpen} homeStyle={isHomePage} />
          ) : (
            <>
              <Link href="/singIn" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">Login</Link>
              <Link href="/singup" className="h-10 pt-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 font-semibold text-white shadow-md shadow-blue-500/25 transition hover:from-blue-700 hover:to-blue-800 hover:shadow-lg">Register</Link>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="animate-in rounded-b-2xl border-t border-slate-100 bg-white px-4 py-4 shadow-xl shadow-slate-900/5 duration-200 fade-in slide-in-from-top-2 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
          <nav
            className="mx-auto max-w-7xl space-y-1"
            aria-label="Mobile navigation"
          >
            <MobileLink
              href="/#home"
              label="Home"
              onClick={() => setMobileMenuOpen(false)}
            />
            <MobileLink
              href="/studenLogin"
              label="Student Login"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800"><ThemeToggle mobile /></div>
            {isAuthenticated && user ? (
              <div className="mt-4 border-t border-slate-100 pt-4"><ProfileDropdown user={user} isOpen={profileMenuOpen} setIsOpen={setProfileMenuOpen} mobile /></div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                <Link href="/singIn" onClick={() => setMobileMenuOpen(false)} className="flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">Login</Link>
                <Link href="/singup" onClick={() => setMobileMenuOpen(false)}><Button className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 font-semibold text-white shadow-md shadow-blue-500/25">Register</Button></Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
    <div aria-hidden="true" className={isHomePage ? "h-[76px] sm:h-36" : "h-16"} />
    </>
  )
}

const roleMenuItems: Record<AuthUser["role"], Array<[string, LucideIcon]>> = {
  ADMIN: [
    ["Dashboard", LayoutDashboard], ["Manage Students", GraduationCap], ["Manage Teachers", UsersRound], ["Manage Classes", School], ["Manage Subjects", BookOpen], ["Manage Exams", ClipboardList], ["Reports", FileText],
  ],
  TEACHER: [
    ["Teacher Dashboard", LayoutDashboard], ["My Classes", School], ["Attendance", CalendarCheck], ["Assessments", ClipboardList],
  ],
  STUDENT: [
    ["Attendance", CalendarCheck], ["Results", Award], ["Assessments", ClipboardList],
  ],
  CASHIER: [],
  User: [],
}

const commonMenuItems: Array<[string, LucideIcon]> = [["My Profile", UserCircle2], ["Settings", Settings]]
const permissionMenuItems: Array<[string, LucideIcon, string]> = [
  ["Manage Students", GraduationCap, "/dashboud/students"],
  ["Manage Teachers", UsersRound, "/dashboud/teachers"],
  ["Manage Classes", School, "/dashboud/classrooms"],
  ["Manage Subjects", BookOpen, "/dashboud/subjects"],
  ["Manage Exams", ClipboardList, "/dashboud/exams"],
  ["Reports", FileText, "/dashboud/results"],
  ["Attendance", CalendarCheck, "/dashboud/attendance"],
  ["Timetable", CalendarCheck, "/dashboud/timetable"],
  ["Buses", Box, "/dashboud/buses"],
  ["Fees", FileText, "/dashboud/fees"],
  ["Staff", UsersRound, "/dashboud/staff"],
  ["Payroll", FileText, "/dashboud/payroll"],
  ["Issues", ClipboardList, "/dashboud/issues"],
  ["Users", UsersRound, "/dashboud/users"],
]
const permissionMenuRoutes = Object.fromEntries(
  permissionMenuItems.map(([label, , href]) => [label, href])
) as Record<string, string>
const commonMenuRoutes: Record<string, string> = {
  Dashboard: "/dashboud",
  "My Profile": "/dashboud/profile",
  Settings: "/dashboud/settings",
}
const adminMenuRoutes: Record<string, string> = {
  Dashboard: "/dashboud",
  "Manage Students": "/dashboud/students",
  "Manage Teachers": "/dashboud/teachers",
  "Manage Classes": "/dashboud/classrooms",
  "Manage Subjects": "/dashboud/subjects",
  "Manage Exams": "/dashboud/exams",
  Reports: "/dashboud/results",
  "My Profile": "/dashboud/profile",
  Settings: "/dashboud/settings",
}

function ThemeToggle({ mobile = false }: { mobile?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return <button type="button" onClick={() => setTheme(isDark ? "light" : "dark")} className={mobile ? "flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" : "flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"} aria-label="Toggle dark mode">{mobile && <span>{isDark ? "Light mode" : "Dark mode"}</span>}{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
}

function ProfileDropdown({ user, isOpen, setIsOpen, mobile = false, homeStyle = false }: { user: AuthUser; isOpen: boolean; setIsOpen: (value: boolean) => void; mobile?: boolean; homeStyle?: boolean }) {
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [logout, { isLoading }] = useLogoutMutation()
  const name = user.fullName ?? user.username ?? user.email
  const initials = name.slice(0, 1).toUpperCase()
  const permittedRoleItems: Array<[string, LucideIcon]> =
    user.role === "User" || user.role === "CASHIER"
      ? [
          ["Dashboard", LayoutDashboard],
          ...permissionMenuItems
            .filter(([, , href]) => user.permissions?.includes(href))
            .map(([label, Icon]) => [label, Icon] as [string, LucideIcon]),
        ]
      : roleMenuItems[user.role]
  const menuItems = [...permittedRoleItems, ...commonMenuItems].filter((item, index, items) => items.findIndex(([label]) => label === item[0]) === index)

  useEffect(() => {
    if (!isOpen) return
    const closeMenu = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedProfileMenu = Array.from(document.querySelectorAll("[data-profile-dropdown]")).some((menu) => menu.contains(target))
      if (!clickedProfileMenu) setIsOpen(false)
    }
    document.addEventListener("mousedown", closeMenu)
    return () => document.removeEventListener("mousedown", closeMenu)
  }, [isOpen, setIsOpen])

  const handleItem = (label: string) => {
    setIsOpen(false)
    if (user.role === "ADMIN") {
      const href = adminMenuRoutes[label]
      if (href) router.push(href)
      return
    }
    if (user.role === "User" || user.role === "CASHIER") {
      const href = commonMenuRoutes[label] ?? permissionMenuRoutes[label]
      if (href) router.push(href)
      return
    }
    if (label.includes("Dashboard")) router.push("/dashboud")
    if (user.role === "STUDENT" && ["Attendance", "Results", "Assessments"].includes(label)) router.push("/studenLogin")
  }

  const handleLogout = async () => {
    await logout().unwrap().catch(() => undefined)
    setIsOpen(false)
    router.push("/singIn")
  }

  return (
    <div ref={menuRef} data-profile-dropdown className={mobile ? "w-full" : "relative"}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={mobile ? "flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-3 text-left transition hover:bg-blue-50" : `flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-blue-50 ${homeStyle ? "gap-3" : ""}`} aria-expanded={isOpen} aria-haspopup="menu">
        <span className="flex min-w-0 items-center gap-3"><span className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-700 to-teal-500 text-sm font-bold text-white shadow-sm ${homeStyle && !mobile ? "h-12 w-12 rounded-2xl" : "h-9 w-9"}`}>{initials}</span>{homeStyle && !mobile ? <span className="min-w-0 text-left"><span className="block text-xs font-medium text-slate-400">{user.role === "ADMIN" ? "Administrator" : user.role.toLowerCase()}</span><span className="block max-w-40 truncate text-sm font-semibold text-slate-700">{name}</span></span> : <span className="max-w-32 truncate text-sm font-semibold text-slate-700">{name}</span>}</span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div role="menu" className={mobile ? "mt-2 origin-top animate-in space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg duration-200 fade-in slide-in-from-top-2" : "absolute right-0 top-[calc(100%+0.6rem)] z-50 w-64 origin-top-right animate-in space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 duration-200 fade-in zoom-in-95"}>
        <div className="border-b border-slate-100 px-3 py-2"><p className="truncate text-sm font-bold text-slate-800">{name}</p><p className="mt-0.5 text-xs font-medium text-emerald-600">{user.role.toLowerCase()}</p></div>
        {menuItems.map(([label, Icon]) => <button key={label} type="button" role="menuitem" onClick={() => handleItem(label)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"><Icon className="h-4 w-4" />{label}</button>)}
        <div className="border-t border-slate-100 pt-1"><button type="button" role="menuitem" disabled={isLoading} onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"><LogOut className="h-4 w-4" />{isLoading ? "Logging out..." : "Logout"}</button></div>
      </div>}
    </div>
  )
}

function NavLink({
  href,
  children,
  active = false,
}: {
  href: string
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white ${active ? "bg-teal-50 text-teal-700 dark:bg-slate-800 dark:text-teal-300" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"}`}
    >
      {children}
    </Link>
  )
}

function DesktopDropdown({
  label,
  items,
}: {
  label: string
  items: typeof serviceItems | typeof productItems
}) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown className="h-4 w-4 transition duration-200 group-open:rotate-180" />
      </summary>
      <div className="absolute top-[calc(100%+0.7rem)] left-0 w-80 origin-top-left animate-in rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-xl shadow-slate-900/10 backdrop-blur-xl duration-200 zoom-in-95 fade-in">
        <p className="px-3 pt-1 pb-2 text-xs font-bold tracking-[0.16em] text-slate-400 uppercase">
          {label}
        </p>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href="#"
              className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-blue-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-sm shadow-blue-500/20">
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-800">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {item.description}
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </details>
  )
}

function MobileLink({
  href,
  label,
  onClick,
}: {
  href: string
  label: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      {label}
    </Link>
  )
}

function MobileDropdown({
  label,
  items,
}: {
  label: string
  items: typeof serviceItems | typeof productItems
}) {
  return (
    <details className="group rounded-xl">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown className="h-4 w-4 transition duration-200 group-open:rotate-180" />
      </summary>
      <div className="animate-in space-y-1 px-2 pb-2 duration-200 fade-in slide-in-from-top-1">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href="#"
              className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50"
            >
              <Icon className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-slate-600">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </details>
  )
}

export default Header
