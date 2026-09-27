"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/services/api/client"

type Student = { id: string; fullName: string; studentID?: string | null; parentName?: string | null; parentPhone?: string | null }
type Classroom = { id: string; name: string; section: string }
type Attendance = { id: string; studentId: string; classroomId?: string | null; status: string; date: string; student?: Student }
const today = () => new Date().toISOString().slice(0, 10)

export default function AbsentStudentsPage() {
  const router = useRouter()
  const [date, setDate] = useState(today)
  const [classId, setClassId] = useState("")
  const [classes, setClasses] = useState<Classroom[]>([])
  const [records, setRecords] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void apiClient.get("/classroom").then(({ data }) =>
      setClasses(Array.isArray(data) ? data : (data?.result ?? []))
    )
  }, [])
  useEffect(() => {
    setLoading(true)
    void apiClient
      .get("/attendance")
      .then(({ data }) => setRecords(Array.isArray(data) ? data : (data?.result ?? [])))
      .finally(() => setLoading(false))
  }, [date])

  const absentStudents = useMemo(
    () => records.filter((record) => record.status === "ABSENT" && record.date.slice(0, 10) === date && (!classId || record.classroomId === classId)),
    [classId, date, records]
  )
  const classroom = (id?: string | null) => classes.find((item) => item.id === id)

  return (
    <main className="min-h-svh bg-slate-50 p-3 text-slate-900 sm:p-6 lg:p-8">
      <section className="mx-auto max-w-[1720px] overflow-hidden rounded-xl border border-rose-200 bg-white shadow-sm sm:rounded-2xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-rose-100 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-rose-50 p-3 text-rose-600"><XCircle className="h-6 w-6" /></span>
            <div><h1 className="text-xl font-bold sm:text-2xl">Absent Students</h1><p className="mt-1 text-sm text-slate-500">Students absent on the selected date</p></div>
          </div>
          <button type="button" onClick={() => router.push("/dashboud/attendance")} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />Back to attendance</button>
        </header>
        <div className="grid gap-4 border-b border-slate-100 p-4 sm:p-6 md:grid-cols-2">
          <label className="text-sm font-semibold">Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500" /></label>
          <label className="text-sm font-semibold">Class<select value={classId} onChange={(event) => setClassId(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"><option value="">All Classes</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name} - {item.section}</option>)}</select></label>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-rose-50 text-rose-800"><tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Student Name</th><th className="px-4 py-3">Student ID</th><th className="px-4 py-3">Student Class</th><th className="px-4 py-3">Parent Phone</th><th className="px-4 py-3">Parent Name</th></tr></thead><tbody>{loading ? <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading absent students...</td></tr> : absentStudents.length ? absentStudents.map((record, index) => { const item = classroom(record.classroomId); return <tr key={record.id} className="border-t border-slate-100"><td className="px-4 py-3">{index + 1}</td><td className="px-4 py-3 font-medium">{record.student?.fullName ?? "Unknown student"}</td><td className="px-4 py-3">{record.student?.studentID ?? "—"}</td><td className="px-4 py-3">{item ? `${item.name} - ${item.section}` : "—"}</td><td className="px-4 py-3">{record.student?.parentPhone ?? "—"}</td><td className="px-4 py-3">{record.student?.parentName ?? "—"}</td></tr> }) : <tr><td colSpan={6} className="p-8 text-center text-slate-500">No absent students for this date and class.</td></tr>}</tbody></table></div>
      </section>
    </main>
  )
}
