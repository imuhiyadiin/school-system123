"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  CalendarCheck2,
  CheckCircle2,
  Download,
  PanelRightOpen,
  Pencil,
  School,
  Fingerprint,
  Upload,
  Save,
  Trash2,
  UsersRound,
  XCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/services/api/client"

type Student = {
  id: string
  fullName: string
  studentID?: string | null
  phone?: string | null
}
type Classroom = {
  id: string
  name: string
  section: string
  teacher?: { fullName: string }
  students: Array<{ student: Student }>
}
type Status = "PRESENT" | "ABSENT" | "HALF_DAY"
type Row = { student: Student; status: Status }
type SavedAttendance = {
  id: string
  studentId: string
  classroomId?: string | null
  status: Status
  date: string
  student?: Student
}
const today = () => new Date().toISOString().slice(0, 10)
const parseCsvLine = (line: string) => {
  const values: string[] = []
  let value = ""
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"' && line[index + 1] === '"' && quoted) {
      value += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === "," && !quoted) {
      values.push(value)
      value = ""
    } else {
      value += character
    }
  }
  values.push(value)
  return values
}
const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`

export default function AttendancePage() {
  const router = useRouter()
  const [classes, setClasses] = useState<Classroom[]>([])
  const [classId, setClassId] = useState("")
  const [classQuery, setClassQuery] = useState("")
  const [date, setDate] = useState(today)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 15
  const [rows, setRows] = useState<Row[]>([])
  const [savedRecords, setSavedRecords] = useState<SavedAttendance[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const selected = classes.find((item) => item.id === classId)
  const filteredClasses = useMemo(() => {
    const search = classQuery.trim().toLowerCase()
    if (!search) return classes
    return classes.filter((item) =>
      `${item.name} ${item.section} ${item.id}`.toLowerCase().includes(search)
    )
  }, [classes, classQuery])
  const buildRows = (
    classroom: Classroom,
    history: Array<{ studentId: string; status: Status }> = []
  ) => {
    const saved = new Map(history.map((item) => [item.studentId, item.status]))
    setRows(
      classroom.students.map(({ student }) => ({
        student,
        status: saved.get(student.id) ?? "PRESENT",
      }))
    )
  }
  const attachStudents = (records: SavedAttendance[], classroom: Classroom) =>
    records.map((record) => ({
      ...record,
      student: classroom.students.find(
        ({ student }) => student.id === record.studentId
      )?.student,
    }))
  useEffect(() => {
    void apiClient
      .get("/classroom")
      .then(({ data }) => {
        const list = (
          Array.isArray(data) ? data : (data?.result ?? [])
        ) as Classroom[]
        setClasses(list)
      })
      .catch(() => setError("Unable to load classrooms."))
  }, [])
  const load = async (id = classId, currentClass = selected) => {
    if (!id || !currentClass) return
    setLoading(true)
    setError("")
    try {
      const { data } = await apiClient.get(`/attendance/classroom/${id}`, {
        params: { date },
      })
      const attendance = ((data.attendance ?? []) as SavedAttendance[]).map((record) => ({
        ...record,
        classroomId: record.classroomId ?? id,
      }))
      buildRows(data.classroom as Classroom, attendance)
      setSavedRecords(attachStudents(attendance, data.classroom as Classroom))
    } catch {
      buildRows(currentClass)
      setSavedRecords([])
    } finally {
      setLoading(false)
    }
  }
  const chooseClass = (id: string) => {
    setClassId(id)
    setMessage("")
    if (id === "all") {
      const allRows = classes.flatMap((classroom) => classroom.students.map(({ student }) => ({ student, status: "PRESENT" as Status })))
      setRows(allRows)
      setLoading(true)
      void Promise.all(classes.map(async (classroom) => {
        const { data } = await apiClient.get(`/attendance/classroom/${classroom.id}`, { params: { date } })
        return ((data.attendance ?? []) as SavedAttendance[]).map((record) => ({
          ...record,
          classroomId: record.classroomId ?? classroom.id,
          student: classroom.students.find(({ student }) => student.id === record.studentId)?.student,
        }))
      }))
        .then((results) => setSavedRecords(results.flat()))
        .catch(() => setError("Unable to load attendance records for all classes."))
        .finally(() => setLoading(false))
      return
    }
    const classroom = classes.find((item) => item.id === id)
    if (classroom) {
      buildRows(classroom)
      setSavedRecords([])
      void load(id, classroom)
    } else {
      setRows([])
      setSavedRecords([])
    }
  }
  useEffect(() => {
    if (classId && selected) void load()
    else if (classId === "all") chooseClass("all")
  }, [date])
  useEffect(() => {
    if (classId === "all") {
      setRows(classes.flatMap((classroom) => classroom.students.map(({ student }) => ({ student, status: "PRESENT" as Status }))))
      setSavedRecords([])
    }
  }, [classes, classId])
  const visible = useMemo(
    () =>
      rows.filter((row) =>
        `${row.student.fullName} ${row.student.studentID ?? ""} ${row.student.id}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [rows, query]
  )
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize))
  const pageRows = visible.slice((page - 1) * pageSize, page * pageSize)
  useEffect(() => {
    setPage((current) => Math.min(current, pageCount))
  }, [pageCount])
  const totals = rows.reduce(
    (sum, row) => ({ ...sum, [row.status]: sum[row.status] + 1 }),
    { PRESENT: 0, ABSENT: 0, HALF_DAY: 0 }
  )
  const total = rows.length
  const rate = (value: number) =>
    total ? `${((value / total) * 100).toFixed(1)}%` : "0%"
  const exportAttendance = () => {
    const lines = [
      ["Student ID", "Student Name", "Status", "Date", "Class ID"],
      ...rows.map((row) => [
        row.student.studentID ?? row.student.id,
        row.student.fullName,
        row.status,
        date,
        classes.find((classroom) => classroom.students.some(({ student }) => student.id === row.student.id))?.id ?? classId,
      ]),
    ]
    const csv = "\uFEFF" + lines.map((line) => line.map(csvCell).join(",")).join("\r\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `attendance-${date}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  const uploadAttendance = async (file?: File) => {
    if (!file) return
    if (!rows.length) {
      setError("Select a class before uploading student IDs.")
      return
    }
    setError("")
    setMessage("")
    try {
      const lines = (await file.text()).split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
      if (!lines.length) throw new Error("The CSV file is empty.")
      const first = parseCsvLine(lines[0])
      const normalizedHeader = first.map((value) => value.trim().toLowerCase().replace(/[ _-]/g, ""))
      const idHeaderIndex = normalizedHeader.findIndex((value) => ["id", "studentid", "studentidentifier"].includes(value))
      const hasHeader = idHeaderIndex >= 0
      const statusHeaderIndex = hasHeader ? normalizedHeader.indexOf("status") : 1
      const dataLines = hasHeader ? lines.slice(1) : lines
      if (!dataLines.length) throw new Error("The CSV file has no student IDs.")
      const statusByStudent = new Map<string, Status>()
      const unmatched: string[] = []
      dataLines.forEach((line, index) => {
        const values = parseCsvLine(line)
        const id = (values[hasHeader ? idHeaderIndex : 0] ?? "").trim()
        if (!id) throw new Error(`Row ${index + (hasHeader ? 2 : 1)}: Student ID is required.`)
        const student = rows.find((row) =>
          [row.student.studentID, row.student.id].some((value) => value?.toLowerCase() === id.toLowerCase())
        )?.student
        if (!student) {
          unmatched.push(id)
          return
        }
        const rawStatus = (values[statusHeaderIndex] ?? "PRESENT").trim().toUpperCase().replace(/[ -]/g, "_")
        const status: Status = rawStatus === "ABSENT" ? "ABSENT" : rawStatus === "HALF_DAY" ? "HALF_DAY" : "PRESENT"
        if (!["PRESENT", "ABSENT", "HALF_DAY"].includes(rawStatus))
          throw new Error(`Row ${index + (hasHeader ? 2 : 1)}: Status must be Present, Absent, or Half Day.`)
        statusByStudent.set(student.id, status)
      })
      if (!statusByStudent.size) throw new Error("No matching student IDs were found in the selected class.")
      setRows((current) => current.map((row) => ({
        ...row,
        status: statusByStudent.get(row.student.id) ?? row.status,
      })))
      setMessage(`${statusByStudent.size} student(s) loaded by ID. Review the attendance and click Save Attendance to store it${unmatched.length ? `; ${unmatched.length} ID(s) did not match this class` : ""}.`)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to read the CSV file.")
    } finally {
      if (uploadInputRef.current) uploadInputRef.current.value = ""
    }
  }
  const changeStatus = (studentId: string, status: Status) =>
    setRows((items) =>
      items.map((item) =>
        item.student.id === studentId ? { ...item, status } : item
      )
    )
  const save = async () => {
    if (!classId || !rows.length)
      return setError("Select a class with students first.")
    setSaving(true)
    setError("")
    try {
      const targetClasses = classId === "all" ? classes : classes.filter((item) => item.id === classId)
      await Promise.all(targetClasses.map((classroom) => {
        const classroomRows = rows.filter((row) => classroom.students.some(({ student }) => student.id === row.student.id))
        return classroomRows.length ? apiClient.post("/attendance/classroom", {
          classroomId: classroom.id,
          date,
          records: classroomRows.map((row) => ({ studentId: row.student.id, status: row.status })),
        }) : Promise.resolve()
      }))
      if (classId === "all") chooseClass("all")
      else await load()
      setMessage("Attendance saved successfully.")
    } catch {
      setError("Failed to save attendance.")
    } finally {
      setSaving(false)
    }
  }
  const updateSaved = async (record: SavedAttendance, status: Status) => {
    setError("")
    try {
      await apiClient.patch(`/attendance/${record.id}`, { status })
      setSavedRecords((items) =>
        items.map((item) =>
          item.id === record.id ? { ...item, status } : item
        )
      )
      changeStatus(record.studentId, status)
      setMessage("Attendance updated successfully.")
    } catch {
      setError("Failed to update attendance.")
    }
  }
  const deleteSaved = async (record: SavedAttendance) => {
    if (
      !window.confirm(
        `Delete attendance for ${record.student?.fullName ?? "this student"}?`
      )
    )
      return
    setError("")
    try {
      await apiClient.delete(`/attendance/${record.id}`)
      setSavedRecords((items) => items.filter((item) => item.id !== record.id))
      setMessage("Attendance deleted successfully.")
    } catch {
      setError("Failed to delete attendance.")
    }
  }
  return (
    <main className="min-h-svh bg-slate-50 p-3 text-slate-900 sm:p-6 lg:p-8">
      <section className="mx-auto max-w-[1720px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:items-center sm:gap-4 sm:px-6 sm:py-5">
          <input
            ref={uploadInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => void uploadAttendance(event.target.files?.[0])}
          />
          <div className="flex items-start gap-3 sm:items-center sm:gap-4">
          <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600 sm:rounded-2xl sm:p-3">
            <CalendarCheck2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">
              Student Attendance
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Mark and manage daily student attendance
            </p>
          </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => uploadInputRef.current?.click()} className="outline whitespace-nowrap">
              <Upload className="h-4 w-4" /> Upload CSV
            </button>
            <button type="button" onClick={exportAttendance} disabled={!rows.length} className="primary whitespace-nowrap disabled:opacity-50">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </header>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-4 sm:p-6">
          <div className="grid flex-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <Card
              icon={UsersRound}
              label="Total Students"
              value={total}
              color="blue"
            />
            <Card
              icon={CheckCircle2}
              label="Present"
              value={`${totals.PRESENT} (${rate(totals.PRESENT)})`}
              color="green"
            />
            <Card
              icon={XCircle}
              label="Absent"
              value={`${totals.ABSENT} (${rate(totals.ABSENT)})`}
              color="red"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSummaryOpen(true)}
              className="outline whitespace-nowrap"
            >
              <PanelRightOpen className="h-4 w-4" />
              View details
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboud/attendance/absent")}
              className="outline whitespace-nowrap text-rose-600"
            >
              Absent students
            </button>
          </div>
        </div>
        <div className="grid gap-4 border-b border-slate-100 p-4 sm:p-6 md:grid-cols-2 xl:grid-cols-5">
          <Label title="Class">
            <select
              value={classId}
              onChange={(event) => chooseClass(event.target.value)}
              className="input"
            >
              <option value="">Select Class</option>
              <option value="all">All Classes</option>
              {filteredClasses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.section}
                </option>
              ))}
            </select>
          </Label>
          <Label title="Search Class">
            <input
              value={classQuery}
              onChange={(event) => setClassQuery(event.target.value)}
              placeholder="Search by class name or ID..."
              className="input"
            />
          </Label>
          <Label title="Section">
            <input
              value={classId === "all" ? "All Sections" : selected?.section ?? ""}
              readOnly
              className="input bg-slate-50"
            />
          </Label>
          <Label title="Date">
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="input"
            />
          </Label>
          <Label title="Search Student">
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder="Search by name, roll number or ID..."
              className="input"
            />
          </Label>
        </div>
        <div className="p-4 sm:p-6">
          <div className="min-w-0 space-y-5">
            <section className="rounded-xl border border-slate-200 p-5">
              <h2 className="mb-4 text-lg font-bold">Mark Attendance</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3 py-3">#</th>
                      <th className="px-3 py-3">Roll Number</th>
                      <th className="px-3 py-3">Student Name</th>
                      <th className="px-3 py-3">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center">
                          Loading students...
                        </td>
                      </tr>
                    ) : (
                      pageRows.map((row, index) => (
                        <tr
                          key={row.student.id}
                          className="border-t border-slate-100"
                        >
                          <td className="px-3 py-3">{(page - 1) * pageSize + index + 1}</td>
                          <td className="px-3 py-3">
                            {row.student.studentID ?? "—"}
                          </td>
                          <td className="px-3 py-3 font-medium">
                            {row.student.fullName}
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={row.status}
                              onChange={(event) =>
                                changeStatus(
                                  row.student.id,
                                  event.target.value as Status
                                )
                              }
                              className="input h-10"
                            >
                              <option value="PRESENT">Present</option>
                              <option value="ABSENT">Absent</option>
                              <option value="HALF_DAY">Half Day</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {visible.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                  <span>
                    Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, visible.length)} of {visible.length} students
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="outline"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </button>
                    <span>Page {page} of {pageCount}</span>
                    <button
                      type="button"
                      className="outline"
                      onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                      disabled={page === pageCount}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() =>
                    setRows((items) =>
                      items.map((item) => ({ ...item, status: "PRESENT" }))
                    )
                  }
                  className="outline"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark All Present
                </button>
                <button
                  onClick={() => void save()}
                  disabled={saving}
                  className="primary"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </section>
            <SavedAttendanceTable
              records={savedRecords}
              classes={classes}
              selectedClassId={classId}
              date={date}
              loading={loading}
              onClassChange={chooseClass}
              onUpdate={updateSaved}
              onDelete={deleteSaved}
            />
            {error && <p className="text-sm text-rose-600">{error}</p>}
            {message && <p className="text-sm text-emerald-600">{message}</p>}
          </div>
        </div>
        {isSummaryOpen && (
          <AttendanceSummaryModal
            selected={selected}
            total={total}
            date={date}
            present={`${totals.PRESENT} (${rate(totals.PRESENT)})`}
            absent={`${totals.ABSENT} (${rate(totals.ABSENT)})`}
            halfDay={`${totals.HALF_DAY} (${rate(totals.HALF_DAY)})`}
            onClose={() => setIsSummaryOpen(false)}
          />
        )}
      </section>
      <style jsx>{`
        .input {
          width: 100%;
          height: 42px;
          border: 1px solid #dbe3f0;
          border-radius: 0.55rem;
          padding: 0 0.8rem;
          outline: none;
        }
        .input:focus {
          border-color: #2563eb;
        }
        .primary,
        .outline {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          border-radius: 0.55rem;
          padding: 0.7rem 1rem;
          font-weight: 600;
          font-size: 0.875rem;
        }
        .primary {
          background: #2563eb;
          color: #fff;
        }
        .primary:disabled {
          opacity: 0.65;
        }
        .outline {
          border: 1px solid #dbe3f0;
          background: #fff;
        }
      `}</style>
    </main>
  )
}

function SavedAttendanceTable({
  records,
  classes,
  selectedClassId,
  date,
  loading,
  onClassChange,
  onUpdate,
  onDelete,
}: {
  records: SavedAttendance[]
  classes: Classroom[]
  selectedClassId: string
  date: string
  loading: boolean
  onClassChange: (id: string) => void
  onUpdate: (record: SavedAttendance, status: Status) => void
  onDelete: (record: SavedAttendance) => void
}) {
  const [studentIdQuery, setStudentIdQuery] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 15
  const filteredRecords = records.filter((record) => {
    const matchesClass = selectedClassId === "all" || record.classroomId === selectedClassId
    const student = record.student
    const matchesStudentId = `${student?.studentID ?? ""} ${record.studentId}`
      .toLowerCase()
      .includes(studentIdQuery.trim().toLowerCase())
    return matchesClass && matchesStudentId
  })
  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / pageSize))
  const pageRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize)
  useEffect(() => {
    setPage((current) => Math.min(current, pageCount))
  }, [pageCount])

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200">
      <div className="space-y-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
          <h2 className="font-bold">Daily Attendance Records</h2>
          <p className="text-sm text-slate-500">
            Saved records for{" "}
            {new Date(`${date}T00:00:00`).toLocaleDateString()}
          </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {filteredRecords.length} records
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 shadow-sm transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">
            <span className="flex items-center gap-2"><School className="h-4 w-4 text-blue-600" />Select Class</span>
            <span className="relative mt-2 block">
              <select
                value={selectedClassId}
                onChange={(event) => onClassChange(event.target.value)}
                className="input bg-slate-50"
              >
                <option value="">Select Class</option>
                <option value="all">All Classes</option>
                {classes.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name} - {classroom.section}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <label className="block min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 shadow-sm transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">
            <span className="flex items-center gap-2"><Fingerprint className="h-4 w-4 text-blue-600" />Search by Student ID</span>
            <span className="relative mt-2 block">
              <input
                value={studentIdQuery}
                onChange={(event) => {
                  setStudentIdQuery(event.target.value)
                  setPage(1)
                }}
                placeholder="Enter student ID..."
                className="input bg-slate-50 pl-3"
              />
            </span>
          </label>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Roll Number</th>
              <th className="px-4 py-3 font-medium">Student Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Loading daily attendance...
                </td>
              </tr>
            ) : filteredRecords.length ? (
              pageRecords.map((record, index) => (
                <tr key={record.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{(page - 1) * pageSize + index + 1}</td>
                  <td className="px-4 py-3">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {record.student?.studentID ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {record.student?.fullName ?? "Unknown student"}
                  </td>
                  <td className="px-4 py-2">
                    <select
                      aria-label={`Update attendance for ${record.student?.fullName ?? "student"}`}
                      value={record.status}
                      onChange={(event) =>
                        onUpdate(record, event.target.value as Status)
                      }
                      className="input h-10 min-w-32"
                    >
                      <option value="PRESENT">Present</option>
                      <option value="ABSENT">Absent</option>
                      <option value="HALF_DAY">Half Day</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdate(record, record.status)}
                        className="rounded-md p-2 text-blue-600 transition hover:bg-blue-50"
                        aria-label={`Update ${record.student?.fullName ?? "attendance"}`}
                        title="Update attendance"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(record)}
                        className="rounded-md p-2 text-rose-600 transition hover:bg-rose-50"
                        aria-label={`Delete ${record.student?.fullName ?? "attendance"}`}
                        title="Delete attendance"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No attendance has been saved for this class and date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredRecords.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
          <span>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredRecords.length)} of {filteredRecords.length} records
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="outline"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>Page {page} of {pageCount}</span>
            <button
              type="button"
              className="outline"
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              disabled={page === pageCount}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
function AbsentStudentsTable({
  records,
  classId,
  classes,
  date,
  onClassChange,
}: {
  records: Array<SavedAttendance & { classroom?: Classroom }>
  classId: string
  classes: Classroom[]
  date: string
  onClassChange: (value: string) => void
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-rose-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 px-5 py-4">
        <div>
          <h2 className="font-bold text-rose-700">Absent Students</h2>
          <p className="text-sm text-slate-500">
            Absent students for{" "}
            {new Date(`${date}T00:00:00`).toLocaleDateString()}
          </p>
        </div>
        <select
          value={classId}
          onChange={(event) => onClassChange(event.target.value)}
          className="input h-10 min-w-44"
        >
          <option value="">All Classes</option>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} - {item.section}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-rose-50 text-rose-800">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Student Name</th>
              <th className="px-4 py-3 font-medium">Student ID</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Class</th>
            </tr>
          </thead>
          <tbody>
            {records.length ? (
              records.map((record, index) => (
                <tr key={record.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-medium">
                    {record.student?.fullName ?? "Unknown student"}
                  </td>
                  <td className="px-4 py-3">
                    {record.student?.studentID ?? "—"}
                  </td>
                  <td className="px-4 py-3">{record.student?.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    {record.classroom
                      ? `${record.classroom.name} - ${record.classroom.section}`
                      : "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No absent students for this date and class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
function Label({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <label className="text-sm font-semibold">
      {title}
      <span className="ml-1 text-rose-500">*</span>
      <span className="mt-2 block">{children}</span>
    </label>
  )
}
function Card({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof UsersRound
  label: string
  value: string | number
  color: "blue" | "green" | "red"
}) {
  const tone = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-emerald-600 bg-emerald-50",
    red: "text-rose-600 bg-rose-50",
  }
  return (
    <section className="flex items-center gap-4 rounded-xl border border-slate-200 p-5">
      <span className={`rounded-xl p-3 ${tone[color]}`}>
        <Icon />
      </span>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-xl font-bold">{value}</p>
      </div>
    </section>
  )
}
function AttendanceSummaryModal({
  selected,
  total,
  date,
  present,
  absent,
  halfDay,
  onClose,
}: {
  selected?: Classroom
  total: number
  date: string
  present: string
  absent: string
  halfDay: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-label="Attendance details" className="w-full max-w-md space-y-6 rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Attendance Details</h2>
          <button type="button" onClick={onClose} className="rounded-lg px-2 text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close details">×</button>
        </div>
        <section className="rounded-xl border border-slate-200 p-5">
          <h3 className="mb-4 font-bold">Class Information</h3>
          <Info label="Class" value={selected?.name ?? "—"} />
          <Info label="Section" value={selected?.section ?? "—"} />
          <Info label="Total Students" value={String(total)} />
          <Info label="Date" value={date} />
          <Info label="Teacher" value={selected?.teacher?.fullName ?? "—"} />
        </section>
        <section className="rounded-xl border border-slate-200 p-5">
          <h3 className="mb-4 font-bold">Attendance Summary</h3>
          <Info label="Present" value={present} />
          <Info label="Absent" value={absent} />
          <Info label="Half Day" value={halfDay} />
        </section>
      </div>
    </div>
  )
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-3 text-sm last:border-0">
      <span>{label}</span>
      <span className="font-semibold text-blue-600">{value}</span>
    </div>
  )
}
