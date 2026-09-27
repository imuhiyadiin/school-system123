"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import type { AppDispatch, RootState } from "@/lib/store"
import {
  createResource,
  deleteResource,
  fetchResources,
  type ResourceName,
  type ResourceRecord,
  updateResource,
} from "@/services/resources/resourceSlice"

const validResources = ["subject", "exam"] as const
const isResource = (value: string): value is ResourceName =>
  validResources.includes(value as ResourceName)

export default function ResourcePage() {
  const { resource: rawResource } = useParams<{ resource: string }>()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { items, loading, saving, error } = useSelector(
    (state: RootState) => state.resources
  )
  const resource = rawResource?.replace(/s$/, "")
  const valid = isResource(resource)
  const [query, setQuery] = useState("")
  const [editing, setEditing] = useState<ResourceRecord | null>(null)
  const [name, setName] = useState("")
  const [grade, setGrade] = useState("")
  const [date, setDate] = useState("")
  const [type, setType] = useState<"QUIZ" | "MONTHLY" | "MIDTERM" | "THIRD" | "FINAL">(
    "QUIZ"
  )
  useEffect(() => {
    if (valid) dispatch(fetchResources(resource))
  }, [dispatch, resource, valid])
  const filtered = useMemo(
    () =>
      items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      ),
    [items, query]
  )
  if (!valid) {
    router.replace("/dashboud")
    return null
  }
  const reset = () => {
    setEditing(null)
    setName("")
    setGrade("")
    setDate("")
    setType("QUIZ")
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || (resource === "subject" && !grade))
      return toast.error("Please complete all required fields.")
    const data =
      resource === "subject"
        ? { name, grade: Number(grade) }
        : { name, date, type }
    try {
      if (editing)
        await dispatch(
          updateResource({ resource, id: editing.id, data })
        ).unwrap()
      else await dispatch(createResource({ resource, data })).unwrap()
      await dispatch(fetchResources(resource))
      toast.success(`${resource} saved successfully`)
      reset()
    } catch {
      toast.error("Unable to save record.")
    }
  }
  const edit = (item: ResourceRecord) => {
    setEditing(item)
    setName(item.name)
    setGrade(item.grade?.toString() ?? "")
    setDate(item.date ? item.date.slice(0, 10) : "")
    setType(item.type ?? "QUIZ")
  }
  const remove = async (id: string) => {
    if (!confirm("Delete this record?")) return
    try {
      await dispatch(deleteResource({ resource, id })).unwrap()
      toast.success("Record deleted")
      await dispatch(fetchResources(resource))
    } catch {
      toast.error("Unable to delete record.")
    }
  }
  const label = resource === "subject" ? "Subjects" : "Exams"
  return (
    <main className="min-h-svh bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-600">
              Admin Management
            </p>
            <h1 className="text-3xl font-bold">{label}</h1>
          </div>
          <button
            onClick={() => router.push("/dashboud")}
            className="rounded-xl border px-4 py-2 text-sm font-semibold"
          >
            Dashboard
          </button>
        </div>
        {error && (
          <p className="mb-4 rounded-xl bg-rose-50 p-3 text-rose-700">
            {error}
          </p>
        )}
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form
            onSubmit={submit}
            className="rounded-2xl bg-white p-5 shadow-sm"
          >
            <h2 className="font-bold">
              {editing ? `Edit ${resource}` : `Add ${resource}`}
            </h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="mt-4 w-full rounded-xl border p-3"
              required
            />
            {resource === "subject" ? (
              <input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                type="number"
                min="1"
                placeholder="Grade"
                className="mt-3 w-full rounded-xl border p-3"
                required
              />
            ) : (
              <>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  type="date"
                  className="mt-3 w-full rounded-xl border p-3"
                  required
                />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                  className="mt-3 w-full rounded-xl border p-3"
                >
                  {["QUIZ", "MONTHLY", "MIDTERM", "THIRD", "FINAL"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </>
            )}
            <div className="mt-4 flex gap-2">
              <button
                disabled={saving}
                className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-xl border px-4 py-2"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              className="mb-4 w-full rounded-xl border p-3"
            />
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-2">
                {filtered.length ? (
                  filtered.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                    >
                      <span>
                        <b>{item.name}</b>
                        <small className="ml-2 text-slate-500">
                          {resource === "subject"
                            ? `Grade ${item.grade}`
                            : `${item.type} · ${item.date ? new Date(item.date).toLocaleDateString() : ""}`}
                        </small>
                      </span>
                      <span className="flex gap-2">
                        <button
                          onClick={() => edit(item)}
                          className="text-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(item.id)}
                          className="text-rose-600"
                        >
                          Delete
                        </button>
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-slate-500">
                    No Data Available
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
