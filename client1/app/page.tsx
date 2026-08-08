import { Button } from "@/components/ui/button"
import { BookOpen, GraduationCap, UsersRound } from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <main id="home" className="relative flex min-h-[calc(100svh-4.5rem)] items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />

      <section className="relative w-full max-w-6xl rounded-3xl border border-white/70 bg-white/85 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur sm:p-10 lg:p-12">
        <div className="mx-auto flex max-w-3xl animate-in fade-in slide-in-from-bottom-4 flex-col items-center text-center duration-700">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-500/30 sm:h-24 sm:w-24">
            <BookOpen className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={1.8} />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Creative Readers Publication
          </p>
          <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Welcome to Creative Readers Publication School Management System
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            A simple, secure space that brings students, teachers, and guests together for a better learning experience.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-md shadow-blue-950/5 transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/15">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-slate-900">Student</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Access your learning resources, results, timetable, and school updates.</p>
            <Link href="/studenLogin" className="mt-6 flex h-10 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-medium text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700">Continue as Student</Link>
          </div>

          <div className="group rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-md shadow-emerald-950/5 transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/15">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/25">
              <BookOpen className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-slate-900">Teacher</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Manage classes, track student progress, and keep learning on course.</p>
          </div>

          <div className="group rounded-2xl border border-blue-100 bg-gradient-to-br from-sky-50 to-white p-6 shadow-md shadow-blue-950/5 transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/15 sm:col-span-2 lg:col-span-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-500/25">
              <UsersRound className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-slate-900">Guest</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Explore school information and discover what our community has to offer.</p>
            <Button className="mt-6 w-full rounded-xl bg-sky-600 shadow-md shadow-sky-500/20 transition hover:bg-sky-700">Continue as Guest</Button>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <section id="about" className="scroll-mt-24 rounded-2xl bg-slate-50 p-6">
            <p className="text-sm font-semibold text-emerald-600">About us</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Learning made simpler</h2>
            <p className="mt-3 leading-7 text-slate-600">Creative Readers Publication School Management System brings school records, results, and learning updates together in one place.</p>
          </section>

          <section id="contact" className="scroll-mt-24 rounded-2xl bg-blue-600 p-6 text-white">
            <p className="text-sm font-semibold text-blue-100">Contact</p>
            <h2 className="mt-2 text-2xl font-bold">Get in touch with the school</h2>
            <p className="mt-3 leading-7 text-blue-100">For admissions, student records, or school support, please contact the school office.</p>
          </section>
        </div>
      </section>
    </main>
  )
}
