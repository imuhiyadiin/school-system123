"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/services/api/client"

type Teacher = { id: string; fullName: string; phone?: string | null }
type Record = { teacherId: string; status: "PRESENT" | "ABSENT" | "ON_LEAVE" }

export default function TeacherAttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [records, setRecords] = useState<Record[]>([])
  const [message, setMessage] = useState("")
  const load = async () => {
    const { data } = await apiClient.get<{
      teachers: Teacher[]
      attendance: Record[]
    }>(`/attendance/teachers?date=${date}`)
    setTeachers(data.teachers ?? [])
    setRecords(
      (data.teachers ?? []).map((teacher) => ({
        teacherId: teacher.id,
        status:
          data.attendance?.find((record) => record.teacherId === teacher.id)
            ?.status ?? "PRESENT",
      }))
    )
  }
  useEffect(() => {
    void load()
  }, [date])
  const setStatus = (teacherId: string, status: Record["status"]) =>
    setRecords((items) =>
      items.map((item) =>
        item.teacherId === teacherId ? { ...item, status } : item
      )
    )
  const save = async () => {
    await apiClient.post("/attendance/teachers", { date, records })
    setMessage("Teacher attendance saved successfully.")
  }
  return (
    <main className="min-h-svh bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-5xl rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Teacher Attendance</h1>
        <p className="mt-1 text-sm text-slate-500">
          Mark daily attendance for all teachers.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <label className="text-sm font-semibold">
            Date{" "}
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="ml-2 rounded-lg border p-2"
            />
          </label>
          <button
            type="button"
            onClick={() => void save()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Save Attendance
          </button>
        </div>
        {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Teacher</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, index) => (
                <tr key={teacher.id} className="border-t">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-semibold">{teacher.fullName}</td>
                  <td className="p-3">{teacher.phone ?? "—"}</td>
                  <td className="p-3">
                    <select
                      value={
                        records.find(
                          (record) => record.teacherId === teacher.id
                        )?.status ?? "PRESENT"
                      }
                      onChange={(event) =>
                        setStatus(
                          teacher.id,
                          event.target.value as Record["status"]
                        )
                      }
                      className="rounded-lg border p-2"
                    >
                      <option value="PRESENT">Present</option>
                      <option value="ABSENT">Absent</option>
                      <option value="ON_LEAVE">On Leave</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
