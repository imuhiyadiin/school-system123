import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, Star, UsersRound } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <main className="min-h-[calc(100svh-4.5rem)] overflow-hidden bg-[#1670c9] text-white">
      <section className="relative mx-auto min-h-[calc(100svh-4.5rem)] max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-[48px] border-white/5" />
        <div className="absolute left-1/2 top-1/2 h-[27rem] w-[27rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-[48px] border-white/5" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700 shadow-lg shadow-blue-950/15">Creative Readers Publication</span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Learn Anywhere, Anytime.<br />Empower Your Future.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">We bring students, teachers, and families together through one simple school management experience.</p>
          <Link href="/studenLogin" className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-blue-700 shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-blue-50"><BookOpen className="h-4 w-4" />Explore student portal<ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="relative mx-auto mt-12 grid max-w-5xl items-center gap-6 lg:grid-cols-[1fr_1.25fr_1fr]">
          <InfoCard icon={Star} title="4.8" text="By students enrolled in our learning environment." />
          <div className="order-first mx-auto flex h-64 w-64 items-center justify-center rounded-[45%] border-8 border-white/20 bg-gradient-to-b from-emerald-200 to-emerald-400 shadow-2xl shadow-blue-950/30 sm:h-80 sm:w-80 lg:order-none">
            <GraduationCap className="h-32 w-32 text-blue-800 sm:h-40 sm:w-40" strokeWidth={1.3} />
          </div>
          <InfoCard icon={UsersRound} title="60K+" text="Learners growing with smarter school tools." />
        </div>

        <div className="relative mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {["Easy access to school information", "Clear results and progress tracking", "Support for students and parents"].map((text) => <div key={text} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><CheckCircle2 className="h-5 w-5 shrink-0 text-yellow-300" /> <span className="text-sm font-semibold text-blue-50">{text}</span></div>)}
        </div>
      </section>
    </main>
  )
}

function InfoCard({ icon: Icon, title, text }: { icon: typeof Star; title: string; text: string }) {
  return <div className="rounded-2xl bg-white p-5 text-slate-800 shadow-xl shadow-blue-950/20"><div className="flex items-center gap-2 text-yellow-500"><Icon className="h-5 w-5 fill-current" /><span className="text-3xl font-bold text-slate-900">{title}</span></div><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></div>
}
