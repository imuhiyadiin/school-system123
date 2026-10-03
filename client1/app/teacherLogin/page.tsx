"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAuthTeacherLoginMutation } from "@/services/auth/authApi"

export default function TeacherLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [teacherLogin, { isLoading }] = useAuthTeacherLoginMutation()
  const router = useRouter()

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const data = await teacherLogin({ email: email.trim(), password }).unwrap()
      toast.success(data.message)
      router.replace("/dashboud/exams")
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "data" in error &&
        typeof error.data === "object" && error.data !== null && "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : "Unable to sign in. Please check your email and password."
      toast.error(message)
    }
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-10">
      <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-emerald-200/45 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-blue-200/45 blur-3xl" />

      <section className="relative w-full max-w-[420px] rounded-2xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-emerald-950/10 backdrop-blur sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-600 to-blue-600 text-white shadow-lg shadow-emerald-500/30">
            <BookOpen className="h-10 w-10" strokeWidth={1.8} />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">Teacher Login</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Sign in to manage your classes and student progress.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label htmlFor="teacher-email" className="text-sm font-semibold text-slate-700">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
              <input id="teacher-email" name="email" type="email" autoComplete="username" placeholder="Enter your email" value={email} onChange={(event) => setEmail(event.target.value)} required className="h-12 w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="teacher-password" className="text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
              <input id="teacher-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required className="h-12 w-full rounded-xl border border-slate-200 bg-white py-3 pr-12 pl-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-700 hover:to-blue-700 disabled:opacity-70">
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-7 border-t border-slate-100 pt-6 text-center">
          <Link href="/" className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800 hover:underline">Back to Home</Link>
        </div>
      </section>
    </main>
  )
}
