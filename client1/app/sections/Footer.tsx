import { BookOpen, Mail, MapPin, Phone } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3 text-white"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400"><BookOpen className="h-5 w-5" /></span><span><span className="block font-bold">Creative Readers</span><span className="text-xs text-emerald-300">Publication School</span></span></Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">A simple school management system for students, teachers, and families.</p>
        </div>

        <div>
          <h2 className="font-bold text-white">Quick links</h2>
          <nav className="mt-4 grid gap-3 text-sm"><Link href="/" className="transition hover:text-emerald-300">Home</Link><Link href="/about" className="transition hover:text-emerald-300">About</Link><Link href="/contact" className="transition hover:text-emerald-300">Contact</Link><Link href="/studenLogin" className="transition hover:text-emerald-300">Student Portal</Link></nav>
        </div>

        <div>
          <h2 className="font-bold text-white">Contact us</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-400"><p className="flex items-center gap-3"><Phone className="h-4 w-4 text-emerald-300" />+252 63 631 5723</p><p className="flex items-center gap-3"><Mail className="h-4 w-4 text-emerald-300" />info@creativereaders.school</p><p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-emerald-300" />Creative Readers Publication School</p></div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500 sm:px-6">© {new Date().getFullYear()} Creative Readers Publication School. All rights reserved.</div>
    </footer>
  )
}
