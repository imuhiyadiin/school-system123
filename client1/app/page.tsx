import { Button } from "@/components/ui/button"
import { BookOpen, GraduationCap, UsersRound } from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <main id="home" className="relative flex min-h-[calc(100svh-4.5rem)] items-center justify-center overflow-hidden bg-[linear-gradient(rgba(3,18,36,0.64),rgba(3,18,36,0.78)),url('/images/home-night-lake.jpg')] bg-cover bg-center bg-fixed px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-blue-400/25 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-emerald-400/25 blur-3xl" />

      <section className="relative w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/20 bg-slate-950/35 p-6 shadow-[0_30px_90px_-35px_rgba(0,0,0,0.75)] backdrop-blur-sm sm:p-10 lg:p-12">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500" />
        <div className="mx-auto flex max-w-3xl animate-in fade-in slide-in-from-bottom-4 flex-col items-center text-center duration-700">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.65rem] bg-gradient-to-br from-blue-700 via-blue-600 to-emerald-500 text-white shadow-xl shadow-blue-500/30 ring-8 ring-blue-50 sm:h-24 sm:w-24">
            <BookOpen className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={1.8} />
          </div>

          <p className="mb-3 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 ring-1 ring-emerald-100 sm:text-sm">
            Creative Readers Publication
          </p>
          <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl lg:leading-[1.08]">
            Welcome to Creative Readers Publication School Management System
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100 sm:text-lg sm:leading-8">
            A simple, secure space that brings students, teachers, and guests together for a better learning experience.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-6 shadow-lg shadow-blue-950/5 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/15">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-200/35 transition duration-300 group-hover:scale-150" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-500/25">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h2 className="relative mt-6 text-xl font-bold text-slate-900">Student</h2>
            <p className="relative mt-2 text-sm leading-6 text-slate-600">Access your learning resources, results, timetable, and school updates.</p>
            <Link href="/studenLogin" className="relative mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 px-4 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:from-blue-800 hover:to-blue-700 hover:shadow-lg">Continue as Student</Link>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-6 shadow-lg shadow-emerald-950/5 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/15">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-200/35 transition duration-300 group-hover:scale-150" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-500 text-white shadow-lg shadow-emerald-500/25">
              <BookOpen className="h-7 w-7" />
            </div>
            <h2 className="relative mt-6 text-xl font-bold text-slate-900">Teacher</h2>
            <p className="relative mt-2 text-sm leading-6 text-slate-600">Manage classes, track student progress, and keep learning on course.</p>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-white p-6 shadow-lg shadow-blue-950/5 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-500/15 sm:col-span-2 lg:col-span-1">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sky-200/35 transition duration-300 group-hover:scale-150" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-700 to-sky-500 text-white shadow-lg shadow-sky-500/25">
              <UsersRound className="h-7 w-7" />
            </div>
            <h2 className="relative mt-6 text-xl font-bold text-slate-900">Guest</h2>
            <p className="relative mt-2 text-sm leading-6 text-slate-600">Explore school information and discover what our community has to offer.</p>
            <Button className="relative mt-6 h-11 w-full rounded-xl bg-gradient-to-r from-sky-700 to-sky-600 font-semibold shadow-md shadow-sky-500/20 transition hover:from-sky-800 hover:to-sky-700 hover:shadow-lg">Continue as Guest</Button>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <section id="about" className="scroll-mt-24 rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-sm">
            <p className="text-sm font-semibold text-emerald-600">About us</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Learning made simpler</h2>
            <p className="mt-3 leading-7 text-slate-600">Creative Readers Publication School Management System brings school records, results, and learning updates together in one place.</p>
          </section>

          <section id="contact" className="scroll-mt-24 rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-600 p-6 text-white shadow-xl shadow-blue-500/20">
            <p className="text-sm font-semibold text-blue-100">Contact</p>
            <h2 className="mt-2 text-2xl font-bold">Get in touch with the school</h2>
            <p className="mt-3 leading-7 text-blue-100">For admissions, student records, or school support, please contact the school office.</p>
          </section>
        </div>
      </section>
    </main>
  )
}
