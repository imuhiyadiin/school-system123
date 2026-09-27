"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, CalendarCheck2 } from "lucide-react"
import { apiClient } from "@/services/api/client"

type Attendance = { id: string; date: string; status: boolean }

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("user-data")
    if (!savedUser) {
      setIsLoading(false)
      return
    }

    try {
      const student = JSON.parse(savedUser) as { id?: string }
      if (!student.id) {
        setIsLoading(false)
        return
      }
      void apiClient.get<Attendance[]>(`/attendance/student/${student.id}`)
        .then(({ data }) => setAttendance(data))
        .catch(() => setAttendance([]))
        .finally(() => setIsLoading(false))
    } catch {
      setIsLoading(false)
    }
  }, [])

  const sortedAttendance = useMemo(() => [...attendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [attendance])

  return <main className="min-h-svh bg-[#f8fbff] px-5 py-10 text-slate-800 sm:px-8"><section className="mx-auto max-w-2xl">
    <Link href="/alls" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"><ArrowLeft className="h-4 w-4" />Back
  </Link><article className="mt-5 rounded-3xl bg-white p-6 shadow-xl shadow-blue-950/8 ring-1 ring-slate-100 sm:p-8">
  <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><CalendarCheck2 className="h-6 w-6" />
  </span><div><p className="text-sm font-semibold text-emerald-600">Student Portal</p><h1 className="text-xl font-bold text-slate-900">My Attendance</h1></div></div><div className="mt-6 space-y-3">
    {isLoading ? <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Loading attendance...</p> : sortedAttendance.length ? sortedAttendance.map((item) => <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="font-semibold text-slate-700">{new Date(item.date).toLocaleDateString()}</span><span className={`rounded-lg px-3 py-1 text-xs font-bold ${item.status ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{item.status ? "Present" : "Absent"}</span></div>) :
       <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No attendance records are available.</p>}</div></article></section></main>
}
