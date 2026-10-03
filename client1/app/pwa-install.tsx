"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

const DISMISS_KEY = "creative-readers-install-dismissed-session-v1"

export default function PwaInstall() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(true)
  const [showIosHelp, setShowIosHelp] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || ("standalone" in window.navigator && Boolean(window.navigator.standalone))
    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
      || (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1)

    setInstalled(standalone)
    setIsIos(ios)
    let wasDismissed = false
    try {
      wasDismissed = window.sessionStorage.getItem(DISMISS_KEY) === "true"
    } catch {
      // Keep the install prompt available when browser storage is restricted.
    }
    setDismissed(standalone || wasDismissed)

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    const handleInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    window.addEventListener("appinstalled", handleInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleInstalled)
    }
  }, [])

  if (installed || dismissed || (!installPrompt && !isIos)) return null

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "true")
    } catch {
      // Dismissal still applies for this visit if storage is unavailable.
    }
    setDismissed(true)
  }

  const install = async () => {
    if (isIos && !installPrompt) {
      setShowIosHelp((current) => !current)
      return
    }
    if (!installPrompt) return

    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === "accepted") setInstalled(true)
    setInstallPrompt(null)
  }

  return (
    <aside
      aria-label="Install Creative Readers"
      className="fixed bottom-4 right-4 z-[100] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-white"
    >
      <div className="flex items-start gap-3">
        <img src="/icons/icon-192.png" alt="" className="h-11 w-11 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Install Creative Readers</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Get quick access from your home screen.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={install}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        <Download aria-hidden="true" className="h-4 w-4" />
        {isIos && !installPrompt ? "How to install" : "Install app"}
      </button>
      {showIosHelp && (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          In Safari, tap Share, then choose <strong>Add to Home Screen</strong>.
        </p>
      )}
    </aside>
  )
}
