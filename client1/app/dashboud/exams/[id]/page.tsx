"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { apiClient } from "@/services/api/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ExamResult = {
  id: string
  marks: number
  student?: { fullName?: string; studentID?: string } | null
}

type ExamRecord = {
  id: string
  name: string
  type: string
  date: string
  total: number
  minMarks: number
  subject?: { name?: string; grade?: number } | null
  results: ExamResult[]
}
type ClassroomOption = {
  id: string
  name: string
  section?: string | null
  grade: number
}

const examGroupKey = (exam: ExamRecord) =>
  JSON.stringify([
    exam.name,
    exam.type,
    new Date(exam.date).toISOString(),
    exam.total,
    exam.minMarks,
  ])

export default function ExamDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [exams, setExams] = useState<ExamRecord[]>([])
  const [classrooms, setClassrooms] = useState<ClassroomOption[]>([])
  const [selectedClasses, setSelectedClasses] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    const load = async () => {
      try {
        const [examResponse, classroomResponse] = await Promise.all([
          apiClient.get("/exam"),
          apiClient.get("/classroom"),
        ])
        const data = examResponse.data
        const records = (data?.exams ?? data?.result ?? data) as ExamRecord[]
        if (!Array.isArray(records)) throw new Error("Exam records were not returned.")
        const selected = records.find((exam) => String(exam.id) === id)
        if (!selected) throw new Error("Exam not found.")
        const group = records.filter(
          (exam) => examGroupKey(exam) === examGroupKey(selected)
        )
        const detailed = await Promise.all(
          group.map(async (exam) => {
            const response = await apiClient.get(
              `/exam/${encodeURIComponent(String(exam.id))}`
            )
            return response.data?.exam as ExamRecord
          })
        )
        if (active) setExams(detailed)
        const classroomData = classroomResponse.data
        const classroomRecords = (classroomData?.result ?? classroomData?.classrooms ?? classroomData) as ClassroomOption[]
        if (active) setClassrooms(Array.isArray(classroomRecords) ? classroomRecords : [])
      } catch (requestError: unknown) {
        if (!active) return
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Exam details could not be loaded."
        setError(message)
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [id])

  const exam = exams[0]
  const resultCount = exams.reduce((count, item) => count + item.results.length, 0)

  return (
    <main className="min-h-svh bg-slate-50 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboud/exams"
          className="text-sm font-semibold text-blue-700 hover:underline"
        >
          ← Back to exams
        </Link>

        {loading ? (
          <p className="mt-6 rounded-xl border bg-white p-6 text-slate-500">
            Loading exam details…
          </p>
        ) : error || !exam ? (
          <p role="alert" className="mt-6 rounded-xl bg-rose-50 p-4 text-rose-700">
            {error ?? "Exam not found."}
          </p>
        ) : (
          <>
            <header className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold text-blue-700">Exam details</p>
              <h1 className="mt-2 text-3xl font-bold">{exam.name}</h1>
              <p className="mt-2 text-slate-500">
                {exams.length} subject{exams.length === 1 ? "" : "s"} · {resultCount} result{resultCount === 1 ? "" : "s"}
              </p>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Detail label="Exam type" value={exam.type} />
                <Detail label="Exam date" value={new Date(exam.date).toLocaleDateString()} />
                <Detail label="Total marks" value={String(exam.total)} />
                <Detail label="Pass marks" value={String(exam.minMarks)} />
              </dl>
            </header>

            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-bold">Subjects and student results</h2>
              </div>
              <div className="border-b border-slate-100 p-6">
                <h3 className="mb-3 text-sm font-semibold text-slate-700">Subjects in this exam</h3>
                <ul className="flex flex-wrap gap-2">
                  {exams.map((item) => (
                    <li key={item.id} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                      {item.subject?.name ?? "No subject"}
                      {item.subject?.grade ? ` · Grade ${item.subject.grade}` : ""}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader className="bg-rose-50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold text-rose-800">Exam name</TableHead>
                        <TableHead className="font-semibold text-rose-800">Subject</TableHead>
                        <TableHead className="font-semibold text-rose-800">Exam type</TableHead>
                      <TableHead className="font-semibold text-rose-800">Total marks</TableHead>
                      <TableHead className="font-semibold text-rose-800">Exam date</TableHead>
                      <TableHead className="font-semibold text-rose-800">Class</TableHead>
                      <TableHead className="font-semibold text-rose-800">Results</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exams.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-semibold text-blue-700">{item.name}</TableCell>
                          <TableCell>{item.subject?.name ?? "No subject"}{item.subject?.grade ? ` - Grade ${item.subject.grade}` : ""}</TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>{item.total}</TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <select
                              aria-label={`Select class for ${item.subject?.name ?? item.name}`}
                              value={selectedClasses[item.id] ?? ""}
                              onChange={(event) =>
                                setSelectedClasses((current) => ({
                                  ...current,
                                  [item.id]: event.target.value,
                                }))
                              }
                              className="min-w-36 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="">Select class</option>
                              {classrooms.map((classroom) => (
                                  <option key={classroom.id} value={classroom.id}>
                                    {classroom.name}{classroom.section ? ` - ${classroom.section}` : ""} (Grade {classroom.grade})
                                  </option>
                                ))}
                            </select>
                          </TableCell>
                          <TableCell>
                            {selectedClasses[item.id] ? (
                              <Link
                                href={`/dashboud/results?classId=${encodeURIComponent(selectedClasses[item.id])}&examId=${encodeURIComponent(item.id)}`}
                                className="font-semibold text-blue-700 hover:underline"
                              >
                                Enter marks
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">Choose a class</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {resultCount ? (
                <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Subject</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead className="text-right">Marks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exams.flatMap((item) =>
                        item.results.map((result) => (
                          <tr key={result.id} className="border-t border-slate-100">
                            <td className="px-6 py-3 font-medium">
                              {item.subject?.name ?? "—"}
                              {item.subject?.grade ? ` (Grade ${item.subject.grade})` : ""}
                            </td>
                            <td className="px-6 py-3">{result.student?.fullName ?? "—"}</td>
                            <td className="px-6 py-3">{result.student?.studentID ?? "—"}</td>
                            <td className="px-6 py-3">{result.marks} / {item.total}</td>
                          </tr>
                        ))
                      )}
                    </TableBody>
                </Table>
              ) : (
                <p className="p-6 text-sm text-slate-500">
                  No student results have been recorded for these exams yet.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-900">{value}</dd>
    </div>
  )
}
