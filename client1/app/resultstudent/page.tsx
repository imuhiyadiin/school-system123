"use client"

import { useEffect, useState } from "react"
import { AlertCircle, BookOpen, FilePenLine, GraduationCap, Trophy, UserRound } from "lucide-react"
import { apiClient } from "@/services/api/client"

type Student = {
  id?: string
  fullName?: string
  phone?: string
  address?: string
  parentName?: string
  classrooms?: Array<{ classroom?: { grade?: number; section?: string } }>
}

type Subject = { id: string; name: string; grade: number; description?: string | null }
type Result = { id: string; marks: number; schoolYear?: string | null; subject?: { name: string }; exam?: { id: string; name: string; type: string; date?: string } }
type Issue = { id: string; type: string; details: string; isResolved: boolean }

const fallbackStudent: Student = {
  fullName: "Student",
  phone: "Not available",
  address: "Not available",
  parentName: "Not available",
}

export default function ResultStudentPage() {
  const [student, setStudent] = useState<Student>(fallbackStudent)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedExamType, setSelectedExamType] = useState("all")

  useEffect(() => {
    const savedUser = localStorage.getItem("user-data")
    if (!savedUser) {
      setIsLoading(false)
      return
    }

    try {
      const data = JSON.parse(savedUser) as Student
      setStudent(data)
      const grade = data.classrooms?.[0]?.classroom?.grade

      void Promise.all([
        data.id ? apiClient.get<Result[]>(`/result/student/${data.id}`) : Promise.resolve({ data: [] as Result[] }),
        apiClient.get<{ subjects: Subject[] }>("/subject"),
        apiClient.get<Issue[]>("/issue"),
      ]).then(([resultResponse, subjectResponse, issueResponse]) => {
        setResults(resultResponse.data)
        setSubjects(grade ? subjectResponse.data.subjects.filter((subject) => subject.grade === grade) : subjectResponse.data.subjects)
        setIssues(issueResponse.data)
      }).catch(() => undefined).finally(() => setIsLoading(false))
    } catch {
      setStudent(fallbackStudent)
      setIsLoading(false)
    }
  }, [])

  const classroom = student.classrooms?.[0]?.classroom
  const initials = (student.fullName ?? "S").slice(0, 1).toUpperCase()
  const details = [
    ["Full Name", student.fullName ?? "Student"],
    ["Grade", classroom?.grade ? `${classroom.grade}${classroom.section ? ` ${classroom.section}` : ""}` : "Not assigned"],
    ["Roll No", student.id ? student.id.slice(-6).toUpperCase() : "Not available"],
    ["Address", student.address ?? "Not available"],
    ["Guardian's Name", student.parentName ?? "Not available"],
    ["Guardian's Contact", student.phone ?? "Not available"],
  ]
  const resultYear = (result: Result) => result.schoolYear ?? (result.exam?.date ? new Date(result.exam.date).getFullYear().toString() : "")
  const resultYears = Array.from(new Set(results.map(resultYear).filter(Boolean))).sort((a, b) => Number(b) - Number(a))
  const activeYear = selectedYear || resultYears[0] || ""
  const yearResults = activeYear ? results.filter((result) => resultYear(result) === activeYear) : results
  const availableExamTypes = ["MONTHLY", "MIDTERM", "FINAL"].filter((type) => yearResults.some((result) => result.exam?.type === type))
  const filteredResults = selectedExamType === "all" ? yearResults : yearResults.filter((result) => result.exam?.type === selectedExamType)

  return (
    <main className="min-h-svh overflow-hidden bg-[#f8fbff] text-slate-800">
      <section className="relative mx-auto min-h-svh w-full max-w-2xl px-5 pb-12 sm:px-8">
        <div className="absolute -top-32 left-1/2 h-72 w-[145%] -translate-x-1/2 rounded-[0_0_50%_50%] bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm" />

        <div className="relative pt-18 sm:pt-22">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-[5px] border-white bg-white shadow-xl shadow-emerald-950/15 sm:h-36 sm:w-36">
            <div className="flex h-27 w-27 items-center justify-center rounded-full border-[3px] border-emerald-400 bg-emerald-50 text-4xl font-bold text-emerald-600 sm:h-31 sm:w-31">
              {initials}
            </div>
          </div>

          <article className="mt-8 rounded-3xl bg-white p-6 shadow-xl shadow-blue-950/8 ring-1 ring-slate-100 sm:mt-10 sm:p-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><UserRound className="h-6 w-6" /></span>
              <div>
                <p className="text-sm font-semibold text-emerald-600">Student Profile</p>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">ID: {student.id ? student.id.slice(-6).toUpperCase() : "Loading..."}</h1>
              </div>
            </div>

            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              {details.map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <dt className="text-xs font-bold tracking-wide text-blue-600 uppercase">{label}</dt>
                  <dd className="mt-1 break-words text-base font-semibold text-slate-700">{value}</dd>
                </div>
              ))}
            </dl>

            <button type="button" className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-base font-semibold text-white shadow-lg shadow-blue-700/25 transition hover:from-blue-800 hover:to-blue-700 active:scale-[0.99]">
              <FilePenLine className="h-5 w-5" />
              Request Edit
            </button>

            <section className="mt-8 grid gap-6">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Trophy className="h-5 w-5" /></span>
                    <h2 className="text-lg font-bold text-slate-900">My Results</h2>
                  </div>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{filteredResults.length}</span>
                </div>
                {!isLoading && results.length ? <div className="mb-4 grid gap-3 sm:grid-cols-2"><label className="block text-xs font-bold text-slate-600">School year<select value={activeYear} onChange={(event) => { setSelectedYear(event.target.value); setSelectedExamType("all") }} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500">{resultYears.map((year) => <option key={year} value={year}>{year}</option>)}</select></label><label className="block text-xs font-bold text-slate-600">Exam type<select value={selectedExamType} onChange={(event) => setSelectedExamType(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"><option value="all">All exams</option>{availableExamTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label></div> : null}
              {isLoading ? <LoadingRows /> : filteredResults.length ? (
                <div className="space-y-3">
                  {filteredResults.map((result) => <div key={result.id} className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3"><div><p className="font-bold text-slate-800">{result.exam?.name ?? "Exam"}</p><p className="mt-1 text-xs text-slate-500">{result.exam?.type ?? "Exam"}</p></div><span className="rounded-xl bg-blue-700 px-3 py-1.5 text-sm font-bold text-white">{result.marks}%</span></div>)}
                </div>
              ) : <EmptyData text="No results are available for this selection." />}
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><AlertCircle className="h-5 w-5" /></span>
                    <h2 className="text-lg font-bold text-slate-900">My Issues</h2>
                  </div>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{issues.length}</span>
                </div>
              {isLoading ? <LoadingRows /> : issues.length ? (
                <div className="space-y-3">
                  {issues.map((issue) => <div key={issue.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-800">{issue.type}</p><p className="mt-1 text-sm leading-5 text-slate-600">{issue.details}</p></div><span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${issue.isResolved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{issue.isResolved ? "Resolved" : "Pending"}</span></div></div>)}
                </div>
              ) : <EmptyData text="You have no issues or notices." />}
              </div>
            </section>
          </article>
        </div>
      </section>
    </main>
  )
}

function DataSection({ icon: Icon, title, count, children }: { icon: typeof BookOpen; title: string; count: number; children: React.ReactNode }) {
  return <article className="rounded-3xl bg-white p-6 shadow-xl shadow-blue-950/8 ring-1 ring-slate-100 sm:p-8"><div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></span><h2 className="text-lg font-bold text-slate-900">{title}</h2></div><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{count}</span></div>{children}</article>
}

function EmptyData({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{text}</p>
}

function LoadingRows() {
  return <div className="space-y-3"><div className="h-16 animate-pulse rounded-2xl bg-slate-100" /><div className="h-16 animate-pulse rounded-2xl bg-slate-100" /></div>
}
