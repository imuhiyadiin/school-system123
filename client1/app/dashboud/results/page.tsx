"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Download, Plus, Upload, X } from "lucide-react"
import { apiClient } from "@/services/api/client"
import { DataTable, type DataTableColumn } from "../components/DataTable"

type RecordItem = Record<string, unknown>
type Option = {
  id: string
  fullName?: string
  name?: string
  type?: string
  total?: number
  date?: string
  studentID?: string
  section?: string
  grade?: number
  subject?: { name?: string; grade?: number }
  classrooms?: Array<{ classroomId?: string }>
}
type Setup = { classId: string; examId: string }

const columns: DataTableColumn[] = [
  { key: "classroom", label: "Classroom" },
  { key: "student", label: "Student" },
  { key: "subject", label: "Subject" },
  { key: "exam", label: "Exam" },
  { key: "examType", label: "Exam type" },
  { key: "marks", label: "Marks" },
]
const emptySetup: Setup = { classId: "", examId: "" }
const unpack = (data: unknown, key: string): Option[] => {
  const value = data as Record<string, unknown>
  const records = Array.isArray(data)
    ? data
    : (value?.[key] ?? value?.result ?? [])
  return Array.isArray(records) ? (records as Option[]) : []
}
const optionLabel = (option: Option) =>
  option.fullName ?? option.name ?? option.id
const normalized = (value: unknown) => String(value ?? "").trim().toLowerCase()
const parseCsvRow = (line: string) => {
  const values: string[] = []
  let value = ""
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"'
        index += 1
      } else quoted = !quoted
    } else if (character === "," && !quoted) {
      values.push(value.trim())
      value = ""
    } else value += character
  }
  values.push(value.trim())
  return values
}
const resultSaveErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response
    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response
    ) {
      const data = response.data
      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      )
        return data.message
    }
  }
  return "Unable to save results."
}
const uniqueResultRows = (records: RecordItem[]) => [
  ...new Map(
    records.map((record) => {
      const student = record.student as
        { id?: unknown; fullName?: unknown } | undefined
      const subject = record.subject as
        { id?: unknown; name?: unknown } | undefined
      const exam = record.exam as { name?: unknown; type?: unknown } | undefined
      const key = `${student?.id ?? student?.fullName}-${subject?.id ?? subject?.name}-${exam?.type ?? exam?.name}`
      return [key, { ...record, examType: exam?.type ?? "—" }]
    })
  ).values(),
]

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const linkedClassId = searchParams.get("classId") ?? ""
  const linkedExamId = searchParams.get("examId") ?? ""
  const [results, setResults] = useState<RecordItem[]>([])
  const [classrooms, setClassrooms] = useState<Option[]>([])
  const [students, setStudents] = useState<Option[]>([])
  const [exams, setExams] = useState<Option[]>([])
  const [setup, setSetup] = useState<Setup>(emptySetup)
  const [marks, setMarks] = useState<Record<string, string>>({})
  const [absent, setAbsent] = useState<Record<string, boolean>>({})
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"setup" | "marks">("setup")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [editingResult, setEditingResult] = useState<RecordItem | null>(null)
  const [editMarks, setEditMarks] = useState("")
  const [selectedTableExamId, setSelectedTableExamId] = useState("")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [linkedEntryInitialized, setLinkedEntryInitialized] = useState(false)
  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const [resultResponse, classroomResponse, studentResponse, examResponse] =
        await Promise.all([
          apiClient.get("/result"),
          apiClient.get("/classroom"),
          apiClient.get("/students"),
          apiClient.get("/exam"),
        ])
      setResults(
        uniqueResultRows(unpack(resultResponse.data, "results") as RecordItem[])
      )
      setClassrooms(unpack(classroomResponse.data, "classrooms"))
      setStudents(unpack(studentResponse.data, "students"))
      setExams(unpack(examResponse.data, "exams"))
    } catch {
      setError("Unable to load results.")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
  }, [])
  const classStudents = useMemo(
    () =>
      students.filter((student) =>
        student.classrooms?.some((entry) => entry.classroomId === setup.classId)
      ),
    [students, setup.classId]
  )
  useEffect(() => {
    if (loading || !linkedClassId || !linkedExamId || linkedEntryInitialized) return
    const classroomExists = classrooms.some((item) => item.id === linkedClassId)
    const examExists = exams.some((item) => item.id === linkedExamId)
    if (!classroomExists || !examExists) {
      setError("The selected class or exam is not available for your account.")
      setLinkedEntryInitialized(true)
      return
    }
    setSetup({ classId: linkedClassId, examId: linkedExamId })
    setSelectedTableExamId(linkedExamId)
    setOpen(true)
    setLinkedEntryInitialized(true)
  }, [
    classrooms,
    exams,
    linkedClassId,
    linkedEntryInitialized,
    linkedExamId,
    loading,
  ])
  useEffect(() => {
    if (
      !linkedEntryInitialized ||
      setup.classId !== linkedClassId ||
      setup.examId !== linkedExamId ||
      !open ||
      step !== "setup"
    ) return
    if (!classStudents.length) {
      setError("No students were found in this classroom.")
      return
    }
    setMarks(Object.fromEntries(classStudents.map((student) => [student.id, ""])))
    setAbsent({})
    setStep("marks")
  }, [
    classStudents,
    linkedClassId,
    linkedEntryInitialized,
    linkedExamId,
    open,
    setup.classId,
    setup.examId,
    step,
  ])
  const filteredResults = useMemo(
    () =>
      results.filter(
        (result) =>
          !selectedTableExamId ||
          (result.exam as { id?: unknown } | undefined)?.id ===
            selectedTableExamId
      ),
    [results, selectedTableExamId]
  )
  const selectedClassroom = classrooms.find((item) => item.id === setup.classId)
  const selectedExam = exams.find((item) => item.id === setup.examId)
  const close = () => {
    setOpen(false)
    setStep("setup")
    setSetup(emptySetup)
    setMarks({})
    setAbsent({})
    setError("")
  }
  const startEntry = (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    if (!setup.classId || !setup.examId)
      return setError("Select a classroom and exam type.")
    if (!classStudents.length)
      return setError("No students were found in this classroom.")
    setMarks(
      Object.fromEntries(classStudents.map((student) => [student.id, ""]))
    )
    setAbsent({})
    setStep("marks")
  }
  const saveResults = async () => {
    setError("")
    const presentStudents = classStudents.filter(
      (student) => !absent[student.id]
    )
    const incomplete = presentStudents.some(
      (student) =>
        marks[student.id] === "" || !Number.isFinite(Number(marks[student.id]))
    )
    if (incomplete)
      return setError("Enter marks or mark the student as absent.")
    const totalMarks = selectedExam?.total ?? 100
    if (
      presentStudents.some(
        (student) =>
          Number(marks[student.id]) < 0 ||
          Number(marks[student.id]) > totalMarks
      )
    )
      return setError(
        `Marks cannot be more than the exam total (${totalMarks}).`
      )
    if (!presentStudents.length)
      return setError("Add marks for at least one student.")
    setSaving(true)
    try {
      await Promise.all(
        presentStudents.map((student) =>
          apiClient.post("/result", {
            classId: setup.classId,
            studentId: student.id,
            examId: setup.examId,
            marks: Number(marks[student.id]),
          })
        )
      )
      close()
      await load()
    } catch (error) {
      setError(resultSaveErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }
  const remove = async (record: RecordItem) => {
    if (!confirm("Delete this result?")) return
    try {
      await apiClient.delete(`/result/${String(record.id)}`)
      await load()
    } catch {
      setError("Unable to delete result.")
    }
  }
  const saveEdit = async () => {
    if (
      !editingResult ||
      editMarks === "" ||
      !Number.isFinite(Number(editMarks))
    )
      return
    const exam = editingResult.exam as { total?: unknown } | undefined
    const totalMarks = typeof exam?.total === "number" ? exam.total : 100
    if (Number(editMarks) < 0 || Number(editMarks) > totalMarks)
      return setError(
        `Marks cannot be more than the exam total (${totalMarks}).`
      )
    setSaving(true)
    try {
      await apiClient.patch(`/result/${String(editingResult.id)}`, {
        marks: Number(editMarks),
      })
      setEditingResult(null)
      await load()
    } catch (error) {
      setError(resultSaveErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }
  const uploadResults = async () => {
    if (!uploadFile) return setError("Choose a CSV file first.")
    setError("")
    setMessage("")
    setUploading(true)
    try {
      const lines = (await uploadFile.text())
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
      const [headerLine, ...dataLines] = lines
      const headers = headerLine && parseCsvRow(headerLine).map(normalized)
      const requiredHeaders = ["classroom", "student", "examtype", "marks"]
      if (
        !headers ||
        requiredHeaders.some((header) => !headers.includes(header))
      )
        throw new Error(
          "CSV headers must be: Classroom, Student, Examtype, Marks."
        )
      if (!dataLines.length) throw new Error("The CSV file has no result rows.")
      const entries = dataLines.map((line) => {
        const values = parseCsvRow(line)
        return Object.fromEntries(
          headers.map((header, index) => [header, values[index] ?? ""])
        )
      })
      const resolved = entries.map((entry, index) => {
        const classroom = classrooms.find((item) => {
          const value = normalized(entry.classroom)
          return [item.id, item.name, `${item.name ?? ""}${item.section ?? ""}`, `${item.name ?? ""} ${item.section ?? ""}`, `${item.name ?? ""}-${item.section ?? ""}`, item.grade]
            .some((candidate) => normalized(candidate) === value)
        })
        const student = students.find((item) =>
          [item.id, item.studentID, item.fullName].some(
            (candidate) => normalized(candidate) === normalized(entry.student)
          )
        )
        const matchingExams = exams.filter((item) =>
          [item.id, item.type, item.name, item.subject?.name].some(
            (candidate) => normalized(candidate) === normalized(entry.examtype)
          )
        )
        if (!classroom || !student || matchingExams.length !== 1) {
          const missing = [
            !classroom && `classroom “${entry.classroom}”`,
            !student && `student “${entry.student}”`,
            matchingExams.length !== 1 && `exam type “${entry.examtype}”`,
          ].filter(Boolean).join(", ")
          throw new Error(`Row ${index + 2}: Could not find a unique ${missing}.`)
        }
        if (!Number.isInteger(Number(entry.marks)) || Number(entry.marks) < 0)
          throw new Error(`Row ${index + 2}: Marks must be a whole number.`)
        return { classroom, student, exam: matchingExams[0], marks: Number(entry.marks) }
      })
      const uploads = await Promise.allSettled(
        resolved.map((entry) =>
          apiClient.post("/result", {
            studentId: entry.student.id,
            classId: entry.classroom.id,
            examId: entry.exam.id,
            marks: entry.marks,
          })
        )
      )
      const failed = uploads.filter((item) => item.status === "rejected").length
      const uploaded = uploads.length - failed
      setMessage(
        failed
          ? `${uploaded} result(s) uploaded; ${failed} row(s) could not be uploaded.`
          : `${uploaded} result(s) uploaded successfully.`
      )
      setUploadOpen(false)
      setUploadFile(null)
      await load()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to upload CSV.")
    } finally {
      setUploading(false)
    }
  }
  const editingExam = editingResult?.exam as { total?: unknown } | undefined
  const editingTotal =
    typeof editingExam?.total === "number" ? editingExam.total : 100
  const exportResults = () => {
    const csvValue = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`
    const csv = [
      columns.map((column) => csvValue(column.label)).join(","),
      ...filteredResults.map((record) => columns.map((column) => csvValue(record[column.key])).join(",")),
    ].join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = "results.csv"
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <main className="min-h-svh min-w-0 overflow-x-hidden bg-slate-50 p-3 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1720px]">
        <div className="mb-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-600">
              School Management
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Results</h1>
          </div>
          <div className="grid w-full grid-cols-3 gap-2 sm:w-auto sm:flex sm:items-center">
            <button
              type="button"
              onClick={exportResults}
              className="inline-flex min-w-0 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:gap-1.5 sm:px-3 sm:text-sm"
            >
              <Download className="h-4 w-4" /> Export
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadOpen(true)
                setError("")
              }}
              className="inline-flex min-w-0 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:gap-1.5 sm:px-3 sm:text-sm"
            >
              <Upload className="h-4 w-4" />
              Upload CSV
            </button>
            <button
              type="button"
              onClick={() => {
                setSetup(emptySetup)
                setMarks({})
                setAbsent({})
                setStep("setup")
                setOpen(true)
                setError("")
              }}
              className="inline-flex min-w-0 items-center justify-center gap-1 rounded-lg bg-blue-600 px-2 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 sm:gap-1.5 sm:px-3 sm:text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Result
            </button>
          </div>
        </div>
        {error && !open && (
          <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </p>
        )}
        <section className="min-w-0 rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-bold">Records</h2>
            <div className="flex flex-wrap items-end gap-3">
              <label className="block text-sm font-medium text-slate-700">
                Select exam
                <select
                  value={selectedTableExamId}
                  onChange={(event) =>
                    setSelectedTableExamId(event.target.value)
                  }
                  className="mt-1 block min-w-52 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">All exams</option>
                  {exams.map((exam) => (
                    <option
                      key={exam.id}
                      value={exam.id}
                    >{`${exam.name ?? "Exam"}${exam.type ? ` (${exam.type})` : ""}`}</option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => void load()}
                className="rounded-lg border px-3 py-1.5 text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={filteredResults}
            loading={loading}
            filterFields={{ studentName: true, examType: true }}
            showExport={false}
            onEdit={(record) => {
              setEditingResult(record)
              setEditMarks(String(record.marks ?? ""))
              setError("")
            }}
            onDelete={remove}
          />
        </section>
      </div>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Result form"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {step === "setup" ? "Add Result" : "Enter Student Marks"}
                </h2>
                {step === "marks" && (
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedClassroom?.name ?? "Classroom"} ·{" "}
                    {optionLabel(selectedExam ?? { id: "Exam" })} · Total marks:{" "}
                    {selectedExam?.total ?? 100}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {error && (
              <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </p>
            )}
            {step === "setup" ? (
              <form onSubmit={startEntry}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Classroom"
                    value={setup.classId}
                    onChange={(value) =>
                      setSetup((current) => ({ ...current, classId: value }))
                    }
                    options={classrooms}
                  />
                  <Select
                    label="Exam"
                    value={setup.examId}
                    onChange={(value) =>
                      setSetup((current) => ({ ...current, examId: value }))
                    }
                    options={exams}
                    exam
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-lg border px-4 py-2 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="mb-3 text-sm text-slate-500">
                  Ardayga maqan calaamadee <strong>Absent</strong>; marks looma
                  baahna, natiijooyinka kale ayaana la keydinayaa.
                </p>
                <div className="max-h-[55vh] overflow-y-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Marks</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.map((student, index) => (
                        <tr
                          key={student.id}
                          className={`border-t border-slate-100 ${absent[student.id] ? "bg-amber-50" : ""}`}
                        >
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2 font-medium">
                            {optionLabel(student)}
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min="0"
                              max={selectedExam?.total ?? 100}
                              disabled={absent[student.id]}
                              value={marks[student.id] ?? ""}
                              onChange={(event) =>
                                setMarks((current) => ({
                                  ...current,
                                  [student.id]: event.target.value,
                                }))
                              }
                              placeholder={`0 - ${selectedExam?.total ?? 100}`}
                              className="w-full max-w-44 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <label className="inline-flex items-center gap-2 font-medium text-amber-700">
                              <input
                                type="checkbox"
                                checked={Boolean(absent[student.id])}
                                onChange={(event) => {
                                  const checked = event.target.checked
                                  setAbsent((current) => ({
                                    ...current,
                                    [student.id]: checked,
                                  }))
                                  if (checked)
                                    setMarks((current) => ({
                                      ...current,
                                      [student.id]: "",
                                    }))
                                }}
                              />
                              Absent
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("setup")}
                    className="rounded-lg border px-4 py-2 text-sm font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => void saveResults()}
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save All Results"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {uploadOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Upload results CSV"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Upload Results CSV</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Required columns: Classroom, Student, Examtype, Marks.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUploadOpen(false)
                  setUploadFile(null)
                }}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close upload"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) =>
                setUploadFile(event.target.files?.[0] ?? null)
              }
              className="mt-6 block w-full rounded-lg border border-slate-200 p-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:font-medium"
            />
            {error && (
              <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUploadOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!uploadFile || uploading}
                onClick={() => void uploadResults()}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload Results"}
              </button>
            </div>
          </div>
        </div>
      )}
      {editingResult && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit result"
          className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/40 p-4"
        >
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void saveEdit()
            }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Result</h2>
              <button
                type="button"
                onClick={() => setEditingResult(null)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Update marks for this student result. Maximum: {editingTotal}.
            </p>
            <label className="mt-5 block text-sm font-medium">
              Marks
              <input
                autoFocus
                type="number"
                min="0"
                max={editingTotal}
                value={editMarks}
                onChange={(event) => setEditMarks(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingResult(null)}
                className="rounded-lg border px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={saving || editMarks === ""}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
  exam,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  exam?: boolean
}) {
  if (exam)
    return (
      <ExamSelect
        label={label}
        value={value}
        onChange={onChange}
        options={options}
      />
    )

  return (
    <label className="text-sm font-medium">
      {label}
      <span className="ml-1 text-rose-500">*</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {optionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  )
}

const examYear = (exam: Option) => {
  if (exam.date) {
    const date = new Date(exam.date)
    if (!Number.isNaN(date.getTime())) return String(date.getFullYear())
  }
  return exam.name?.match(/(19|20)\d{2}/)?.[0] ?? "Other"
}

const examTypeName = (type?: string) =>
  ({
    MONTHLY: "Monthly",
    MIDTERM: "Midterm",
    THIRD: "Third Term",
    FINAL: "Final",
    QUIZ: "Quiz",
  })[type ?? ""] ?? type ?? "Other"

const examOptionLabel = (exam: Option) =>
  [
    exam.name ?? "Exam",
    exam.subject?.name,
    exam.subject?.grade ? `Grade ${exam.subject.grade}` : undefined,
  ]
    .filter(Boolean)
    .join(" · ")

function ExamSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Option[]
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.id === value)
  const examsByYear = useMemo(() => {
    const grouped: Record<string, Record<string, Option[]>> = {}
    options.forEach((exam) => {
      const year = examYear(exam)
      const type = exam.type ?? "OTHER"
      ;(grouped[year] ??= {})[type] ??= []
      grouped[year][type].push(exam)
    })
    return grouped
  }, [options])
  const types = ["MONTHLY", "MIDTERM", "THIRD", "FINAL", "QUIZ", "OTHER"]
  const typeBorder = {
    MONTHLY: "border-sky-200 bg-sky-50/50",
    MIDTERM: "border-amber-200 bg-amber-50/50",
    THIRD: "border-orange-200 bg-orange-50/50",
    FINAL: "border-violet-200 bg-violet-50/50",
    QUIZ: "border-emerald-200 bg-emerald-50/50",
    OTHER: "border-slate-200 bg-slate-50",
  } as const

  return (
    <div className="relative text-sm font-medium">
      <span>
        {label}
        <span className="ml-1 text-rose-500">*</span>
      </span>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="mt-1 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left font-normal outline-none transition focus:border-blue-500"
      >
        <span className={selected ? "text-slate-900" : "text-slate-500"}>
        {selected
            ? `${examOptionLabel(selected)} (${examTypeName(selected.type)})`
            : "Select Exam"}
        </span>
        <span className="text-slate-500">⌄</span>
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Exams grouped by year and type"
          className="absolute z-20 mt-1 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
        >
          {Object.keys(examsByYear)
            .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
            .map((year) => (
              <section
                key={year}
                className="mb-3 rounded-xl border-2 border-blue-200 bg-blue-50/40 p-2 last:mb-0"
              >
                <h3 className="px-1 pb-2 text-sm font-bold text-blue-800">
                  Academic year {year}
                </h3>
                <div className="space-y-2">
                  {types
                    .filter((type) => examsByYear[year][type]?.length)
                    .map((type) => (
                      <div
                        key={type}
                        className={`rounded-lg border p-1.5 ${typeBorder[type as keyof typeof typeBorder]}`}
                      >
                        <p className="px-2 pb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                          {examTypeName(type)}
                        </p>
                        {examsByYear[year][type].map((exam) => (
                          <button
                            key={exam.id}
                            type="button"
                            role="option"
                            aria-selected={exam.id === value}
                            onClick={() => {
                              onChange(exam.id)
                              setOpen(false)
                            }}
                            className={`block w-full rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-blue-50 ${exam.id === value ? "bg-blue-600 font-semibold text-white hover:bg-blue-600" : "text-slate-700"}`}
                          >
                            {examOptionLabel(exam)}
                          </button>
                        ))}
                      </div>
                    ))}
                </div>
              </section>
            ))}
          {!options.length && (
            <p className="p-3 text-center text-sm text-slate-500">
              No exams available.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
