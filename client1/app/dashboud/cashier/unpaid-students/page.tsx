"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Users, X } from "lucide-react"
import { apiClient } from "@/services/api/client"

type Student = {
  id: string
  studentID?: string | null
  fullName: string
  gender?: string | null
  dob?: string | null
  phone?: string | null
  address?: string | null
  parentName?: string | null
  parentPhone?: string | null
  totalFee?: number | null
  bus?: { fullName?: string } | null
  classrooms?: Array<{
    classroomId?: string
    classroom?: { name?: string; section?: string }
  }>
}
type Classroom = { id: string; name: string; section?: string }
type Fee = { amount: number; isActive: boolean }
type Payment = {
  paymentDate: string
  student?: { studentID?: string | null }
}

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const unpack = <T,>(data: unknown, key: string): T[] => {
  if (Array.isArray(data)) return data as T[]
  if (typeof data === "object" && data !== null) {
    const value = (data as Record<string, unknown>)[key] ??
      (data as Record<string, unknown>).result
    return Array.isArray(value) ? (value as T[]) : []
  }
  return []
}

export default function UnpaidStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [fees, setFees] = useState<Fee[]>([])
  const [classId, setClassId] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const month = new Date().toISOString().slice(0, 7)

  useEffect(() => {
    void Promise.all([
      apiClient.get("/students"),
      apiClient.get("/classroom"),
      apiClient.get("/fees"),
      apiClient.get("/cashier/payments"),
    ])
      .then(([studentResponse, classroomResponse, feeResponse, paymentResponse]) => {
        setStudents(unpack<Student>(studentResponse.data, "students"))
        setClassrooms(unpack<Classroom>(classroomResponse.data, "classrooms"))
        setFees(unpack<Fee>(feeResponse.data, "fees"))
        setPayments(unpack<Payment>(paymentResponse.data, "payments"))
      })
      .catch(() => setError("Unable to load unpaid students."))
      .finally(() => setLoading(false))
  }, [])

  const feeTotal = useMemo(
    () => fees.filter((fee) => fee.isActive).reduce((sum, fee) => sum + Number(fee.amount), 0),
    [fees]
  )
  const unpaidStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          (!classId ||
            student.classrooms?.some(
              (classroom) => classroom.classroomId === classId
            )) &&
          !payments.some(
            (payment) =>
              payment.student?.studentID === student.studentID &&
              payment.paymentDate.slice(0, 7) === month
          )
      ),
    [classId, month, payments, students]
  )
  const outstanding = unpaidStudents.length * feeTotal
  const exportUnpaidStudents = () => {
    const csvValue = (value: string | number) =>
      `"${String(value).replaceAll('"', '""')}"`
    const rows = unpaidStudents.map((student, index) => {
      const classroom = student.classrooms?.[0]?.classroom
      const classroomName = classroom
        ? `${classroom.name ?? ""}${classroom.section ? ` - ${classroom.section}` : ""}`
        : ""
      return [
        index + 1,
        student.fullName,
        student.studentID ?? "",
        classroomName,
        feeTotal.toFixed(2),
      ].map(csvValue).join(",")
    })
    const csv = [
      ["No.", "Student", "Student ID", "Classroom", "Outstanding"]
        .map(csvValue)
        .join(","),
      ...rows,
    ].join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `unpaid-students-${month}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-svh bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <section className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-amber-100 p-3 text-amber-700">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold">Unpaid Students</h1>
              <p className="mt-1 text-sm text-slate-500">Students without a payment for {month}</p>
            </div>
          </div>
          <Link
            href="/dashboud/cashier"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back to fees
          </Link>
        </div>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-amber-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Unpaid students</p>
              <p className="mt-1 text-2xl font-bold text-amber-950">{unpaidStudents.length}</p>
            </div>
            <div className="rounded-xl bg-rose-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-rose-700">Outstanding</p>
              <p className="mt-1 text-2xl font-bold text-rose-800">{money.format(outstanding)}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm font-semibold text-slate-700">
              Classroom
              <select
                value={classId}
                onChange={(event) => setClassId(event.target.value)}
                className="mt-1 block h-10 min-w-52 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-blue-500"
              >
                <option value="">All Classes</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}{classroom.section ? ` - ${classroom.section}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={exportUnpaidStudents}
              disabled={!unpaidStudents.length}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>
        {error ? (
          <p className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
        ) : (
          <div
            className="mt-6 overflow-x-auto rounded-xl border border-slate-200"
            onClickCapture={(event) => {
              const link = (event.target as Element).closest(
                'a[href*="viewStudent="]'
              )
              if (!link) return
              event.preventDefault()
              const id = new URL(link.getAttribute("href") ?? "", window.location.origin).searchParams.get("viewStudent")
              setSelectedStudent(students.find((student) => student.id === id) ?? null)
            }}
          >
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Student ID</th><th className="px-4 py-3">Classroom</th><th className="px-4 py-3">Outstanding</th><th className="px-4 py-3"></th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">Loading unpaid students...</td></tr>
                ) : unpaidStudents.length ? (
                  unpaidStudents.map((student, index) => {
                    const classroom = student.classrooms?.[0]?.classroom
                    return <tr key={student.id} className="border-t border-slate-100"><td className="px-4 py-3">{index + 1}</td><td className="px-4 py-3 font-semibold">{student.fullName}</td><td className="px-4 py-3 text-slate-600">{student.studentID ?? "—"}</td><td className="px-4 py-3 text-slate-600">{classroom?.name ?? "—"}{classroom?.section ? ` - ${classroom.section}` : ""}</td><td className="px-4 py-3 font-semibold text-rose-700">{money.format(feeTotal)}</td><td className="px-4 py-3 text-right"><Link href={`/dashboud/students?viewStudent=${encodeURIComponent(student.id)}`} className="rounded-md border border-amber-300 px-2.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-50">View</Link></td></tr>
                  })
                ) : (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-emerald-700">All students have paid this month.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </main>
  )
}

function StudentDetailsModal({
  student,
  onClose,
}: {
  student: Student
  onClose: () => void
}) {
  const classroom = student.classrooms?.[0]?.classroom
  const value = (item?: string | number | null) =>
    item === null || item === undefined || item === "" ? "—" : String(item)
  const rows: [string, string | number | null | undefined][] = [
    ["Student ID", student.studentID],
    ["Full name", student.fullName],
    ["Gender", student.gender],
    [
      "Date of birth",
      student.dob ? new Date(student.dob).toLocaleDateString() : null,
    ],
    ["Phone", student.phone],
    ["Address", student.address],
    ["Parent name", student.parentName],
    ["Parent phone", student.parentPhone],
    [
      "Classroom",
      classroom
        ? `${classroom.name ?? ""}${classroom.section ? ` - ${classroom.section}` : ""}`
        : null,
    ],
    ["Student bus", student.bus?.fullName],
    [
      "Total fee",
      student.totalFee === null || student.totalFee === undefined
        ? null
        : money.format(Number(student.totalFee)),
    ],
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Student details"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={onClose}
    >
      <section
        className="mx-auto my-8 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-sm font-semibold text-amber-700">Unpaid student</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {student.fullName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Saved student information
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close student details"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <dl className="mt-5 grid gap-x-8 sm:grid-cols-2">
          {rows.map(([label, item]) => (
            <div key={label} className="border-b border-slate-100 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {value(item)}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
