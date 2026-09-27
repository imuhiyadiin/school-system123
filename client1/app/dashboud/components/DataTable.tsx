"use client"

import { useMemo, useState } from "react"
import { Download, Funnel, RotateCcw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

type RecordValue = Record<string, unknown>
export type DataTableColumn = {
  key: string
  label: string
  format?: "dateTime" | "time"
}
export type DataTableFilterFields = {
  search?: boolean
  classroom?: boolean
  status?: boolean
  studentId?: boolean
  studentName?: boolean
  examType?: boolean
}
type ClassroomOption = { id: string; name?: unknown; section?: unknown }
type DataTableProps = {
  columns: DataTableColumn[]
  data: RecordValue[]
  loading: boolean
  searchPlaceholder?: string
  searchKeys?: string[]
  filterFields?: DataTableFilterFields
  showFilterHeader?: boolean
  showExport?: boolean
  classroomFilterKey?: string
  onEdit?: (record: RecordValue) => void
  onDelete?: (record: RecordValue) => void
  onBulkDelete?: (ids: string[]) => void
  classroomOptions?: ClassroomOption[]
  onBulkClassUpdate?: (ids: string[], classroomId: string) => void
  onView?: (record: RecordValue) => void
}

const display = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (Array.isArray(value)) {
    const classroom = value[0] as
      | {
          classroom?: { name?: unknown; section?: unknown } | string
          name?: unknown
          section?: unknown
        }
      | undefined
    const classValue = classroom?.classroom
    if (typeof classValue === "string") return classValue
    if (classValue?.name)
      return `${String(classValue.name)}${classValue.section ? ` - ${String(classValue.section)}` : ""}`
    if (classroom?.name)
      return `${String(classroom.name)}${classroom.section ? ` - ${String(classroom.section)}` : ""}`
    return "—"
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>
    return String(
      record.fullName ?? record.name ?? record.username ?? record.email ?? "—"
    )
  }
  return String(value)
}

const classroomValue = (record: RecordValue) =>
  record.classroom ?? record.classrooms

const columnValue = (record: RecordValue, column: DataTableColumn) => {
  const value = record[column.key]
  if (column.format === "dateTime" && typeof value === "string") {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime()))
      return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
  }
  if (column.format === "time" && typeof value === "string") {
    const [hours, minutes] = value.split(":").map(Number)
    if (Number.isInteger(hours) && Number.isInteger(minutes)) {
      const date = new Date(2000, 0, 1, hours, minutes)
      return date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    }
  }
  return display(value)
}

export function DataTable({
  columns,
  data,
  loading,
  searchPlaceholder = "Search records...",
  searchKeys,
  filterFields,
  showFilterHeader = true,
  showExport = true,
  classroomFilterKey,
  onEdit,
  onDelete,
  onBulkDelete,
  classroomOptions,
  onBulkClassUpdate,
  onView,
}: DataTableProps) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<{
    key: string
    direction: "asc" | "desc"
  } | null>(null)
  const [visible, setVisible] = useState(
    () => new Set(columns.map((column) => column.key))
  )
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [classroom, setClassroom] = useState("All Classes")
  const [status, setStatus] = useState("All statuses")
  const [studentId, setStudentId] = useState("")
  const [studentName, setStudentName] = useState("")
  const [examType, setExamType] = useState("All exam types")
  const [newClassroomId, setNewClassroomId] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const classrooms = useMemo(
    () => [
      ...new Set(
        data
          .map((record) =>
            classroomFilterKey
              ? display(record[classroomFilterKey])
              : display(classroomValue(record))
          )
          .filter((value) => value !== "—")
      ),
    ],
    [classroomFilterKey, data]
  )
  const statuses = useMemo(
    () => [
      ...new Set(
        data
          .map((record) => record.status)
          .filter(
            (value): value is string | number =>
              typeof value === "string" || typeof value === "number"
          )
          .map(String)
      ),
    ],
    [data]
  )
  const examTypes = useMemo(
    () => {
      const typesInResults = data
        .map((record) => {
          const exam = record.exam as { type?: unknown } | undefined
          return exam?.type
        })
        .filter((value): value is string => typeof value === "string")
      return [
        ...new Set(["MONTHLY", "MIDTERM", "THIRD", "FINAL", ...typesInResults]),
      ]
    },
    [data]
  )
  const rows = useMemo(
    () =>
      data
        .filter((record) => {
          const values = searchKeys?.length
            ? searchKeys.map((key) => record[key])
            : Object.values(record)
          const exam = record.exam as { type?: unknown } | undefined
          const matchesClassroom =
            classroom === "All Classes" ||
            (classroomFilterKey
              ? display(record[classroomFilterKey])
              : display(classroomValue(record))) === classroom
          const matchesStudent =
            !studentName ||
            display(record.student)
              .toLowerCase()
              .includes(studentName.toLowerCase())
          const matchesStudentId =
            !studentId ||
            String(
              record.studentID ??
                (record.student as { studentID?: unknown } | undefined)
                  ?.studentID ??
                ""
            )
              .toLowerCase()
              .includes(studentId.toLowerCase())
          const matchesExamType =
            examType === "All exam types" || exam?.type === examType
          return (
            matchesClassroom &&
            (status === "All statuses" || String(record.status) === status) &&
            matchesStudent &&
            matchesStudentId &&
            matchesExamType &&
            values.some((value) =>
              display(value).toLowerCase().includes(query.toLowerCase())
            )
          )
        })
        .sort((a, b) => {
          if (!sort) return 0
          const result = display(a[sort.key]).localeCompare(
            display(b[sort.key]),
            undefined,
            { numeric: true }
          )
          return sort.direction === "asc" ? result : -result
        }),
    [
      classroom,
      classroomFilterKey,
      data,
      examType,
      query,
      searchKeys,
      sort,
      status,
      studentId,
      studentName,
    ]
  )
  const activeColumns = columns.filter((column) => visible.has(column.key))
  const hasActions = Boolean(onView || onEdit || onDelete)
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageRows = rows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )
  const toggleSelect = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  const toggleSort = (key: string) => {
    setPage(1)
    setSort((current) =>
      current?.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    )
  }
  const deleteSelected = () => {
    const ids = [...selected]
    if (
      ids.length &&
      confirm(
        `Delete ${ids.length} selected record${ids.length === 1 ? "" : "s"}?`
      )
    ) {
      onBulkDelete?.(ids)
      setSelected(new Set())
    }
  }
  const updateSelectedClassroom = () => {
    const ids = [...selected]
    if (
      ids.length &&
      newClassroomId &&
      confirm(
        `Move ${ids.length} selected student${ids.length === 1 ? "" : "s"} to this class?`
      )
    ) {
      onBulkClassUpdate?.(ids, newClassroomId)
      setSelected(new Set())
      setNewClassroomId("")
    }
  }
  const resetFilters = () => {
    setQuery("")
    setClassroom("All Classes")
    setStatus("All statuses")
    setStudentId("")
    setStudentName("")
    setExamType("All exam types")
    setPage(1)
  }
  const exportRows = () => {
    const headers = columns.map((column) => column.label)
    const values = rows.map((record) =>
      columns.map((column) => JSON.stringify(columnValue(record, column)))
    )
    const csv = [headers, ...values].map((row) => row.join(",")).join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    const link = document.createElement("a")
    link.href = url
    link.download = "dashboard-records.csv"
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {showFilterHeader && (
          <header className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
            <Funnel className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-bold text-slate-900">Filters</h2>
          </header>
        )}
        <div className="grid gap-x-6 gap-y-5 p-6 md:grid-cols-2 xl:grid-cols-3">
          {(filterFields?.search ?? true) && (
            <label className="block text-base font-medium text-slate-900">
              Search
              <span className="relative mt-2 block">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setPage(1)
                  }}
                  placeholder={searchPlaceholder}
                  className="h-14 w-full rounded-xl border border-slate-200 pl-12 text-base transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </span>
            </label>
          )}
          {(filterFields?.classroom ?? true) && (
            <label className="block text-base font-medium text-slate-900">
              Classroom
              <select
                value={classroom}
                onChange={(event) => {
                  setClassroom(event.target.value)
                  setPage(1)
                }}
                disabled={!classrooms.length}
                className="mt-2 h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option>All Classes</option>
                {classrooms.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          )}
          {/* A Student ID filter replaces the generic status filter. */}
          {(filterFields?.status ?? true) && !filterFields?.studentId && (
            <label className="block text-base font-medium text-slate-900">
              Status
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value)
                  setPage(1)
                }}
                disabled={!statuses.length}
                className="mt-2 h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option>All statuses</option>
                {statuses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          )}
          {filterFields?.studentId && (
            <label className="block text-base font-medium text-slate-900">
              Student ID
              <span className="relative mt-2 block">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={studentId}
                  onChange={(event) => {
                    setStudentId(event.target.value)
                    setPage(1)
                  }}
                  placeholder="Search by Student ID..."
                  className="h-14 w-full rounded-xl border border-slate-200 pl-12 text-base transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </span>
            </label>
          )}
          {filterFields?.studentName && (
            <label className="block text-base font-medium text-slate-900">
              Student name
              <input
                value={studentName}
                onChange={(event) => {
                  setStudentName(event.target.value)
                  setPage(1)
                }}
                placeholder="Search student name..."
                className="mt-2 h-14 w-full rounded-xl border border-slate-200 px-4 text-base transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </label>
          )}
          {filterFields?.examType && (
            <label className="block text-base font-medium text-slate-900">
              Exam type
              <select
                value={examType}
                onChange={(event) => {
                  setExamType(event.target.value)
                  setPage(1)
                }}
                className="mt-2 h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option>All exam types</option>
                {examTypes.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          )}
          <div className="flex flex-wrap items-end gap-3 xl:col-span-3">
            {showExport && <Button
              type="button"
              size="lg"
              className="h-12 rounded-xl bg-emerald-600 px-5 text-base hover:bg-emerald-700"
            >
              <Search className="h-5 w-5" />
              Search
            </Button>}
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={resetFilters}
              className="h-12 rounded-xl px-5 text-base"
            >
              <RotateCcw className="h-5 w-5" />
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={exportRows}
              className="ml-auto h-12 rounded-xl px-5 text-base"
            >
              <Download className="h-5 w-5" />
              Export
            </Button>
          </div>
        </div>
      </section>
      <div className="dashboard-records-table overflow-hidden rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-end gap-2 border-b border-slate-200 bg-white p-3">
          {onBulkClassUpdate && selected.size > 0 && (
            <>
              <select
                value={newClassroomId}
                onChange={(event) => setNewClassroomId(event.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select new class</option>
                {classroomOptions?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {String(item.name ?? "Class")}
                    {item.section ? ` - ${String(item.section)}` : ""}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!newClassroomId}
                onClick={updateSelectedClassroom}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Update class ({selected.size})
              </button>
            </>
          )}
          {onBulkDelete && selected.size > 0 && (
            <button
              type="button"
              onClick={deleteSelected}
              className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Delete selected ({selected.size})
            </button>
          )}
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-lg border border-slate-200 px-3 py-2 text-sm">
              Columns
            </summary>
            <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
              {columns.map((column) => (
                <label
                  key={column.key}
                  className="flex cursor-pointer items-center gap-2 px-2 py-1 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={visible.has(column.key)}
                    onChange={() =>
                      setVisible((current) => {
                        const next = new Set(current)
                        next.has(column.key)
                          ? next.delete(column.key)
                          : next.add(column.key)
                        return next
                      })
                    }
                  />
                  {column.label}
                </label>
              ))}
            </div>
          </details>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={
                      pageRows.length > 0 &&
                      pageRows.every((row) => selected.has(String(row.id)))
                    }
                    onChange={() =>
                      setSelected((current) => {
                        const next = new Set(current)
                        const allSelected = pageRows.every((row) =>
                          next.has(String(row.id))
                        )
                        pageRows.forEach((row) =>
                          allSelected
                            ? next.delete(String(row.id))
                            : next.add(String(row.id))
                        )
                        return next
                      })
                    }
                  />
                </th>
                {activeColumns.map((column) => (
                  <th
                    key={column.key}
                    className="px-3 py-3 font-semibold whitespace-nowrap"
                  >
                    <button
                      onClick={() => toggleSort(column.key)}
                      className="flex items-center gap-1"
                    >
                      {column.label}
                      {sort?.key === column.key
                        ? sort.direction === "asc"
                          ? "↑"
                          : "↓"
                        : ""}
                    </button>
                  </th>
                ))}
                {hasActions && (
                  <th className="px-3 py-3 font-semibold">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={activeColumns.length + 1 + (hasActions ? 1 : 0)}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : pageRows.length ? (
                pageRows.map((record) => (
                  <tr
                    key={String(record.id)}
                    className="border-t border-slate-100 bg-white"
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(String(record.id))}
                        onChange={() => toggleSelect(String(record.id))}
                      />
                    </td>
                    {activeColumns.map((column) => (
                      <td
                        key={column.key}
                        className="max-w-48 truncate px-3 py-3 text-slate-700"
                      >
                        {columnValue(record, column)}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="px-3 py-3 whitespace-nowrap">
                        {onView && (
                          <button
                            onClick={() => onView(record)}
                            className="mr-3 font-semibold text-slate-600"
                          >
                            View
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(record)}
                            className="mr-3 font-semibold text-blue-600"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(record)}
                            className="font-semibold text-rose-600"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={activeColumns.length + 1 + (hasActions ? 1 : 0)}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white p-3 text-sm text-slate-500">
          <span>
            {selected.size} selected · {rows.length} records · Page{" "}
            {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-700">
              {currentPage}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
