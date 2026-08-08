"use client"

import { useMemo, useState } from "react"

type RecordValue = Record<string, unknown>
export type DataTableColumn = { key: string; label: string }

type DataTableProps = { columns: DataTableColumn[]; data: RecordValue[]; loading: boolean; onEdit: (record: RecordValue) => void; onDelete: (record: RecordValue) => void }

const display = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "object") {
    const record = value as Record<string, unknown>
    return String(
      record.fullName
      ?? record.name
      ?? record.username
      ?? record.email
      ?? "—",
    )
  }
  return String(value)
}

export function DataTable({ columns, data, loading, onEdit, onDelete }: DataTableProps) {
  const [query, setQuery] = useState(""); const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null); const [visible, setVisible] = useState(() => new Set(columns.map((column) => column.key))); const [selected, setSelected] = useState<Set<string>>(new Set())
  const rows = useMemo(() => data.filter((record) => Object.values(record).some((value) => display(value).toLowerCase().includes(query.toLowerCase()))).sort((a, b) => { if (!sort) return 0; const compared = display(a[sort.key]).localeCompare(display(b[sort.key]), undefined, { numeric: true }); return sort.direction === "asc" ? compared : -compared }), [data, query, sort])
  const pageRows = rows; const activeColumns = columns.filter((column) => visible.has(column.key))
  const toggleSort = (key: string) => { setSort((current) => current?.key === key ? { key, direction: current.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" }) }
  const toggleSelect = (id: string) => setSelected((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next })
  return <div className="overflow-hidden rounded-xl border border-slate-200"><div className="flex flex-col gap-3 border-b border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records..." className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 sm:max-w-xs" /><details className="relative"><summary className="cursor-pointer list-none rounded-lg border border-slate-200 px-3 py-2 text-sm">Columns</summary><div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">{columns.map((column) => <label key={column.key} className="flex cursor-pointer items-center gap-2 px-2 py-1 text-sm"><input type="checkbox" checked={visible.has(column.key)} onChange={() => setVisible((current) => { const next = new Set(current); next.has(column.key) ? next.delete(column.key) : next.add(column.key); return next })} />{column.label}</label>)}</div></details></div><div className="dashboard-table overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="w-10 px-3 py-3"><input type="checkbox" checked={pageRows.length > 0 && pageRows.every((row) => selected.has(String(row.id)))} onChange={() => setSelected((current) => { const next = new Set(current); const allSelected = pageRows.every((row) => next.has(String(row.id))); pageRows.forEach((row) => allSelected ? next.delete(String(row.id)) : next.add(String(row.id))); return next })} /></th>{activeColumns.map((column) => <th key={column.key} className="whitespace-nowrap px-3 py-3 font-semibold"><button onClick={() => toggleSort(column.key)} className="flex items-center gap-1">{column.label}{sort?.key === column.key ? sort.direction === "asc" ? "↑" : "↓" : ""}</button></th>)}<th className="px-3 py-3 font-semibold">Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan={activeColumns.length + 2} className="px-3 py-8 text-center text-slate-500">Loading...</td></tr> : pageRows.length ? pageRows.map((record) => <tr key={String(record.id)} className="border-t border-slate-100 bg-white"><td className="px-3 py-3"><input type="checkbox" checked={selected.has(String(record.id))} onChange={() => toggleSelect(String(record.id))} /></td>{activeColumns.map((column) => <td key={column.key} className="max-w-48 truncate px-3 py-3 text-slate-700">{display(record[column.key])}</td>)}<td className="whitespace-nowrap px-3 py-3"><button onClick={() => alert(JSON.stringify(record, null, 2))} className="mr-3 font-semibold text-slate-600">View</button><button onClick={() => onEdit(record)} className="mr-3 font-semibold text-blue-600">Edit</button><button onClick={() => onDelete(record)} className="font-semibold text-rose-600">Delete</button></td></tr>) : <tr><td colSpan={activeColumns.length + 2} className="px-3 py-8 text-center text-slate-500">No Data Found</td></tr>}</tbody></table></div><div className="border-t border-slate-200 bg-white p-3 text-sm text-slate-500">{selected.size} selected · {rows.length} records</div></div>
}
