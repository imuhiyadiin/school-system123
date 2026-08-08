"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { apiClient } from "@/services/api/client"
import { DataTable, type DataTableColumn } from "./DataTable"

type Field = { name: string; label: string; type?: "text" | "email" | "password" | "number" | "date" | "textarea" | "checkbox" | "select"; required?: boolean; options?: string; values?: string[] }
type CrudPageProps = { title: string; endpoint: string; createEndpoint?: string; unwrap?: string; columns?: DataTableColumn[] }
type Values = Record<string, string | number | boolean>

const fields: Record<string, Field[]> = {
  "/students": [{ name: "email", label: "Email", type: "email", required: true }, { name: "username", label: "Username", required: true }, { name: "fullName", label: "Full name", required: true }, { name: "password", label: "Password", type: "password", required: true }, { name: "gender", label: "Gender", required: true }, { name: "dob", label: "Date of birth", type: "date", required: true }, { name: "phone", label: "Phone", required: true }, { name: "address", label: "Address", type: "textarea", required: true }, { name: "parentName", label: "Parent name", required: true }, { name: "classroomId", label: "Classroom", type: "select", options: "/classroom", required: true }],
  "/teacher": [{ name: "email", label: "Email", type: "email", required: true }, { name: "username", label: "Username", required: true }, { name: "fullName", label: "Full name", required: true }, { name: "password", label: "Password", type: "password", required: true }, { name: "gender", label: "Gender", required: true }, { name: "dob", label: "Date of birth", type: "date", required: true }, { name: "phone", label: "Phone" }, { name: "address", label: "Address", type: "textarea" }],
  "/classroom": [{ name: "name", label: "Classroom name", required: true }, { name: "section", label: "Section", required: true }, { name: "grade", label: "Grade", type: "number", required: true }, { name: "teacherId", label: "Teacher", type: "select", options: "/teacher", required: true }],
  "/subject": [{ name: "name", label: "Subject name", required: true }, { name: "description", label: "Description", type: "textarea" }],
  "/exam": [{ name: "name", label: "Exam name", required: true }, { name: "type", label: "Exam type", type: "select", values: ["QUIZ", "MONTHLY", "MIDTERM", "FINAL"], required: true }, { name: "date", label: "Exam date", type: "date", required: true }],
  "/result": [{ name: "classId", label: "Classroom", type: "select", options: "/classroom", required: true }, { name: "studentId", label: "Student", type: "select", options: "/students", required: true }, { name: "examId", label: "Exam", type: "select", options: "/exam", required: true }, { name: "marks", label: "Marks", type: "number", required: true }],
  "/attendance": [{ name: "studentId", label: "Student", type: "select", options: "/students", required: true }, { name: "date", label: "Date", type: "date", required: true }, { name: "status", label: "Present", type: "checkbox" }],
  "/timetable": [{ name: "classroomId", label: "Classroom", type: "select", options: "/classroom", required: true }, { name: "day", label: "Day", required: true }, { name: "time", label: "Time", required: true }, { name: "subject", label: "Subject", required: true }],
  "/cashier": [{ name: "userId", label: "User", type: "select", options: "/user", required: true }, { name: "fullName", label: "Full name", required: true }],
  "/issue": [{ name: "classId", label: "Classroom", type: "select", options: "/classroom", required: true }, { name: "studentId", label: "Student", type: "select", options: "/students", required: true }, { name: "type", label: "Issue type", required: true }, { name: "details", label: "Details", type: "textarea", required: true }, { name: "isResolved", label: "Resolved", type: "checkbox" }],
  "/user": [{ name: "name", label: "Full name", required: true }, { name: "email", label: "Email", type: "email", required: true }, { name: "password", label: "Password", type: "password", required: true }, { name: "role", label: "Role", type: "select", values: ["ADMIN", "TEACHER", "STUDENT", "User"], required: true }],
}

const label = (record: Record<string, unknown>) => String(record.fullName ?? record.name ?? record.username ?? record.email ?? record.id)
const saveErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response
    if (typeof response === "object" && response !== null && "data" in response) {
      const data = response.data
      if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") return data.message
    }
  }
  return "Unable to save. Please check the required fields."
}
const unpack = (data: unknown) => {
  if (Array.isArray(data)) return data

  const response = data as {
    result?: unknown[]
    students?: unknown[]
    teachers?: unknown[]
    classrooms?: unknown[]
    subjects?: unknown[]
    exams?: unknown[]
  }

  return response.result
    ?? response.students
    ?? response.teachers
    ?? response.classrooms
    ?? response.subjects
    ?? response.exams
    ?? []
}

export function CrudPage({ title, endpoint, createEndpoint, unwrap = "result", columns: customColumns }: CrudPageProps) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<Values>({ defaultValues: { status: true, isResolved: false } })
  const [records, setRecords] = useState<Record<string, unknown>[]>([]); const [options, setOptions] = useState<Record<string, Record<string, unknown>[]>>({}); const [editingId, setEditingId] = useState<string | null>(null); const [message, setMessage] = useState<string | null>(null); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(true)
  const formFields = useMemo(() => fields[endpoint] ?? [], [endpoint])
  const selectedClassroomId = watch("classId")
  const columns = useMemo<DataTableColumn[]>(() => customColumns ?? formFields.filter((field) => field.type !== "password").map((field) => ({ key: field.name, label: field.label })), [customColumns, formFields])
  const load = async () => { setLoading(true); setError(null); try { const { data } = await apiClient.get(endpoint); const value = Array.isArray(data) ? data : (data?.[unwrap] ?? data?.result ?? data?.students ?? data?.teachers ?? data?.results ?? data?.exams ?? data?.subjects ?? data?.attendance ?? []); setRecords(Array.isArray(value) ? value : []) } catch { setError("Unable to load records.") } finally { setLoading(false) } }
  useEffect(() => { void load() }, [endpoint])
  useEffect(() => { const paths = [...new Set(formFields.flatMap((field) => field.options ? [field.options] : []))]; void Promise.all(paths.map(async (path) => { try { const { data } = await apiClient.get(path); return [path, unpack(data) as Record<string, unknown>[]] as const } catch { return [path, []] as const } })).then((items) => setOptions(Object.fromEntries(items))) }, [formFields])
  const submit = async (values: Values) => { setError(null); setMessage(null); try { const data = { ...values }; if (editingId) { delete data.email; delete data.username; delete data.password; if (endpoint === "/user") { await apiClient.patch("/user/role/change", { id: editingId, role: values.role }); await apiClient.patch(`${endpoint}/${editingId}`, { fullname: values.name }) } else await apiClient.patch(`${endpoint}/${editingId}`, data) } else await apiClient.post(createEndpoint ?? endpoint, data); reset({ status: true, isResolved: false }); setEditingId(null); setMessage(editingId ? "Updated successfully." : "Saved successfully."); await load() } catch (error) { setError(saveErrorMessage(error)) } }
  const edit = (record: Record<string, unknown>) => { setEditingId(String(record.id)); const data: Values = {}; formFields.forEach((field) => { const studentClassrooms = record.classrooms as { classroomId?: string }[] | undefined; const value = field.name === "name" && endpoint === "/user" ? record.username : field.name === "classroomId" && endpoint === "/students" ? studentClassrooms?.[0]?.classroomId : record[field.name]; data[field.name] = field.type === "date" && typeof value === "string" ? value.slice(0, 10) : typeof value === "boolean" || typeof value === "number" || typeof value === "string" ? value : "" }); reset(data); setMessage(null) }
  const remove = async (id: string) => { if (!confirm("Delete this record?")) return; try { await apiClient.delete(`${endpoint}/${id}`); setMessage("Deleted successfully."); await load() } catch { setError("Unable to delete this record.") } }
  return <main className="min-h-svh bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8"><div className="mx-auto max-w-[1600px]"><div className="mb-6"><p className="text-sm font-semibold text-emerald-600">School Management</p><h1 className="mt-1 text-3xl font-bold">{title}</h1></div>{error && <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{message && <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}<div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]"><form onSubmit={handleSubmit(submit)} className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-bold">{editingId ? `Update ${title}` : `Create ${title}`}</h2><div className="mt-4 space-y-3">{formFields.map((field) => <label key={field.name} className="block text-sm font-medium text-slate-700">{field.type === "checkbox" ? <span className="flex items-center gap-2"><input type="checkbox" {...register(field.name)} />{field.label}</span> : <><span>{field.label}</span>{field.type === "textarea" ? <textarea {...register(field.name, { required: field.required })} className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm" /> : field.type === "select" ? <select {...register(field.name, { required: field.required })} onChange={(event) => { register(field.name, { required: field.required }).onChange(event); if (endpoint === "/result" && field.name === "classId") setValue("studentId", "") }} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"><option value="">Select {field.label}</option>{field.values?.map((value) => <option key={value} value={value}>{value}</option>)}{(field.name === "studentId" && endpoint === "/result" ? (options[field.options ?? ""] ?? []).filter((item) => Array.isArray(item.classrooms) && item.classrooms.some((entry) => typeof entry === "object" && entry !== null && (entry as { classroomId?: unknown }).classroomId === selectedClassroomId)) : options[field.options ?? ""] ?? []).map((item) => <option key={String(item.id)} value={String(item.id)}>{label(item)}</option>)}</select> : <input type={field.type ?? "text"} {...register(field.name, { required: field.required, valueAsNumber: field.type === "number" })} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm" />}{errors[field.name] && <span className="mt-1 block text-xs text-rose-600">{field.label} is required.</span>}</>}</label>)}</div><div className="mt-5 flex flex-wrap gap-2"><button disabled={isSubmitting} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{isSubmitting ? "Saving..." : editingId ? "Update" : "Save"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); reset({ status: true, isResolved: false }) }} className="rounded-xl border px-4 py-2 text-sm">Cancel</button>}</div></form><section className="min-w-0 rounded-2xl bg-white p-5 shadow-sm"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">Records</h2><button onClick={() => void load()} className="rounded-lg border px-3 py-1.5 text-sm">Refresh</button></div><DataTable columns={columns} data={records} loading={loading} onEdit={edit} onDelete={(record) => void remove(String(record.id))} /></section></div></div></main>
}
