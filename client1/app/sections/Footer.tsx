"use client"

import { BookOpen } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Footer() {
  const pathname = usePathname()

  if (pathname.startsWith("/dashboud")) return null

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3 text-white"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400"><BookOpen className="h-5 w-5" /></span><span><span className="block font-bold">Creative Readers</span><span className="text-xs text-emerald-300">Publication School</span></span></Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">A simple school management system for students, teachers, and families.</p>
        </div>

        <div>
          <h2 className="font-bold text-white">Quick links</h2>
          <nav className="mt-4 grid gap-3 text-sm"><Link href="/" className="transition hover:text-emerald-300">Home</Link><Link href="/studenLogin" className="transition hover:text-emerald-300">Student Portal</Link></nav>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500 sm:px-6">© {new Date().getFullYear()} Creative Readers Publication School. All rights reserved.</div>
    </footer>
  )
}
