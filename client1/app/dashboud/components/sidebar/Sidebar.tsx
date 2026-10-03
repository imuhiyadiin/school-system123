"use client"

import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  LogOut,
  Moon,
  Settings,
  Sun,
  type LucideIcon,
} from "lucide-react"
import { useState } from "react"

export type SidebarNavItem = {
  label: string
  icon: LucideIcon
  href: string
  children?: { label: string; href: string }[]
  account?: boolean
}

type SidebarProps = {
  navigation: SidebarNavItem[]
  pathname: string
  theme: string | undefined
  collapsed: boolean
  onNavigate: (href: string) => void
  onThemeToggle: () => void
  onSettings: () => void
  onLogout: () => void
}

const menuTitle = (index: number) => {
  if (index === 0) return "Overview"
  if (index === 1) return "Academic"
  if (index === 7) return "Management"
  return ""
}

export function Sidebar({
  navigation,
  pathname,
  theme,
  collapsed,
  onNavigate,
  onThemeToggle,
  onSettings,
  onLogout,
}: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const mainNavigation = navigation.filter((item) => !item.account)
  const accountNavigation = navigation.filter((item) => item.account)
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col overflow-y-auto border-r border-slate-200 bg-white py-5 ${
        collapsed ? "w-16 px-2" : "w-16 px-2 sm:w-72 sm:px-3"
      }`}
    >
      <div className="flex items-center gap-3 px-1 sm:px-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-violet-300 ring-1 ring-zinc-700">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className={collapsed ? "hidden" : "hidden sm:block"}>
          <p className="text-sm leading-tight font-bold text-slate-900">
            Creative Readers
          </p>
          <p className="text-xs text-slate-500">School Management</p>
        </div>
      </div>

      <nav className="mt-8 flex-1 space-y-1">
        {mainNavigation.map((item, index) => {
          const Icon = item.icon
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            Boolean(
              item.children?.some(
                (child) => pathname === child.href.split("?")[0]
              )
            )
          const expanded = expandedItems[item.label] ?? active
          const title = menuTitle(index)
          return (
            <div key={item.label} className={title ? "pt-4 first:pt-0" : ""}>
              {title && (
                <p
                  className={
                    collapsed
                      ? "hidden"
                      : "hidden px-3 pb-2 text-sm font-medium tracking-wide text-slate-500 sm:block"
                  }
                >
                  {title}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  if (item.children) {
                    setExpandedItems((current) => ({
                      ...current,
                      [item.label]: !expanded,
                    }))
                    return
                  }
                  onNavigate(item.href)
                }}
                className={`flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-left text-base font-medium transition sm:justify-start ${
                  active
                    ? "bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700"
                    : "text-slate-700 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={collapsed ? "hidden" : "hidden sm:inline"}>
                  {item.label}
                </span>
                {item.children && !collapsed && (
                  <ChevronDown className={`ml-auto hidden h-4 w-4 transition-transform sm:block ${expanded ? "rotate-180" : ""}`} />
                )}
              </button>
              {item.children && !collapsed && expanded && (
                <div
                  className={`relative mt-1 ml-6 hidden space-y-1 border-l border-slate-200 pl-3 sm:block ${active ? "" : "opacity-80"}`}
                >
                  {item.children.map((child) => (
                    <button
                      key={child.href}
                      type="button"
                      onClick={() => onNavigate(child.href)}
                    className={`block w-full rounded-md px-3 py-1.5 text-left text-sm transition ${pathname === child.href.split("?")[0] ? "bg-zinc-800 text-white" : "text-slate-600 hover:bg-zinc-800 hover:text-white"}`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="border-t border-slate-100 pt-3">
        <p
          className={
            collapsed
              ? "hidden"
              : "hidden px-3 pb-2 text-xs font-semibold tracking-[0.16em] text-slate-500 sm:block"
          }
        >
          ACCOUNT
        </p>
        {accountNavigation.map((item) => {
          const Icon = item.icon
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            Boolean(
              item.children?.some(
                (child) => pathname === child.href.split("?")[0]
              )
            )
          const expanded = expandedItems[item.label] ?? active
          return (
            <div key={item.label}>
              <button
                type="button"
                onClick={() => {
                  if (item.children) {
                    setExpandedItems((current) => ({
                      ...current,
                      [item.label]: !expanded,
                    }))
                    return
                  }
                  onNavigate(item.href)
                }}
                className={`flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-left text-base font-medium transition sm:justify-start ${
                  active
                    ? "bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700"
                    : "text-slate-700 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={collapsed ? "hidden" : "hidden sm:inline"}>
                  {item.label}
                </span>
                {item.children && !collapsed && (
                  <ChevronDown className={`ml-auto hidden h-4 w-4 transition-transform sm:block ${expanded ? "rotate-180" : ""}`} />
                )}
              </button>
              {item.children && !collapsed && expanded && (
                <div className="relative mt-1 ml-6 hidden space-y-1 border-l border-slate-200 pl-3 sm:block">
                  {item.children.map((child) => (
                    <button
                      key={child.href}
                      type="button"
                      onClick={() => onNavigate(child.href)}
                      className={`block w-full rounded-md px-3 py-1.5 text-left text-sm transition ${pathname === child.href.split("?")[0] ? "bg-zinc-800 text-white" : "text-slate-600 hover:bg-zinc-800 hover:text-white"}`}
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
          type="button"
          onClick={onThemeToggle}
          className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 transition hover:bg-zinc-800 hover:text-white sm:justify-start"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className={collapsed ? "hidden" : "hidden sm:inline"}>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </span>
        </button>
        <button
          type="button"
          onClick={onSettings}
          className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 transition hover:bg-zinc-800 hover:text-white sm:justify-start"
        >
          <Settings className="h-5 w-5" />
          <span className={collapsed ? "hidden" : "hidden sm:inline"}>
            Settings
          </span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-rose-400 transition hover:bg-rose-950/40 sm:justify-start"
        >
          <LogOut className="h-5 w-5" />
          <span className={collapsed ? "hidden" : "hidden sm:inline"}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  )
}

export function MobileScrollTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed right-4 bottom-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 sm:hidden"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  )
}
