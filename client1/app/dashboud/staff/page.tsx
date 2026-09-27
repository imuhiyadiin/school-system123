"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Building2,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserRound,
  UserRoundX,
  UsersRound,
  X,
} from "lucide-react"
import { apiClient } from "@/services/api/client"

type Staff = {
  id: string
  employeeId: string
  fullName: string
  email: string
  phone?: string | null
  gender?: string | null
  dob?: string | null
  address?: string | null
  position: string
  department: string
  joinedAt: string
  basicSalary: number
  allowance: number
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE"
}
type SalaryHistory = {
  id: string
  basicSalary: number
  previousSalary?: number | null
  allowance: number
  effectiveDate: string
  reason?: string | null
}
type Summary = {
  total: number
  active: number
  inactive: number
  onLeave: number
}
type Form = Omit<Staff, "id" | "joinedAt"> & { joinedAt: string }
const emptyForm: Form = {
  employeeId: "",
  fullName: "",
  email: "",
  phone: "",
  gender: "",
  dob: "",
  address: "",
  position: "",
  department: "",
  joinedAt: new Date().toISOString().slice(0, 10),
  basicSalary: 0,
  allowance: 0,
  status: "ACTIVE",
}
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    active: 0,
    inactive: 0,
    onLeave: 0,
  })
  const [query, setQuery] = useState("")
  const [position, setPosition] = useState("")
  const [department, setDepartment] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Staff | null>(null)
  const [form, setForm] = useState<Form>(emptyForm)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [history, setHistory] = useState<SalaryHistory[]>([])
  const [historyName, setHistoryName] = useState("")
  const load = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get<{
        result: Staff[]
      }>("/employee")
      const employees = data.result ?? []
      setStaff(employees)
      setSummary({
        total: employees.length,
        active: employees.filter((item) => item.status === "ACTIVE").length,
        inactive: employees.filter((item) => item.status === "INACTIVE").length,
        onLeave: employees.filter((item) => item.status === "ON_LEAVE").length,
      })
    } catch {
      setError("Unable to load staff.")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
  }, [])
  const positions = useMemo(
    () => [...new Set(staff.map((item) => item.position))],
    [staff]
  )
  const departments = useMemo(
    () => [...new Set(staff.map((item) => item.department))],
    [staff]
  )
  const rows = staff.filter(
    (item) =>
      (!query ||
        [item.fullName, item.email, item.phone, item.position]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!position || item.position === position) &&
      (!department || item.department === department) &&
      (!status || item.status === status)
  )
  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setError("")
    setFormOpen(true)
  }
  const openEdit = (record: Staff) => {
    setEditing(record)
    setForm({
      ...record,
      joinedAt: record.joinedAt.slice(0, 10),
      phone: record.phone ?? "",
    })
    setError("")
    setFormOpen(true)
  }
  const save = async () => {
    setSaving(true)
    setError("")
    try {
      if (editing) await apiClient.put(`/employee/${editing.id}`, form)
      else await apiClient.post("/employee", form)
      setFormOpen(false)
      setMessage(
        editing
          ? "Employee updated successfully."
          : "Employee added successfully."
      )
      await load()
    } catch (requestError) {
      setError(apiMessage(requestError, "Unable to save employee."))
    } finally {
      setSaving(false)
    }
  }
  const remove = async (record: Staff) => {
    if (!window.confirm(`Delete ${record.fullName}?`)) return
    try {
      await apiClient.delete(`/employee/${record.id}`)
      setMessage("Employee deleted successfully.")
      await load()
    } catch {
      setError("Unable to delete employee.")
    }
  }
  const viewHistory = async (record: Staff) => {
    try {
      const { data } = await apiClient.get<{ salaryHistory: SalaryHistory[] }>(
        `/employee/${record.id}/salary-history`
      )
      setHistory(data.salaryHistory ?? [])
      setHistoryName(record.fullName)
    } catch {
      setError("Unable to load salary history.")
    }
  }
  const cards = [
    [UsersRound, "Total Employees", summary.total, "blue"],
    [UserCheck, "Active", summary.active, "emerald"],
    [Building2, "Departments", departments.length, "violet"],
    [UserRoundX, "Inactive", summary.inactive, "rose"],
  ] as const
  return (
    <main className="min-h-svh bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1720px]">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="rounded-2xl bg-blue-600 p-3 text-white">
              <UsersRound className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-3xl font-bold">Employees / Staff</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage all school staff and employee records.
              </p>
            </div>
          </div>
          <button type="button" onClick={openAdd} className="primary">
            <Plus className="h-4 w-4" /> Add employee
          </button>
        </header>
        {error && <Notice text={error} error />}
        {message && <Notice text={message} />}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([Icon, label, value, color]) => (
            <article key={label} className={`card card-${color}`}>
              <span className={`icon icon-${color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p>{label}</p>
              <strong>{value}</strong>
              <small>
                {label === "Total Employees"
                  ? "All staff members"
                  : label === "Active"
                    ? "Currently working"
                    : label === "Inactive"
                      ? "Not active"
                      : "Across all staff"}
              </small>
            </article>
          ))}
        </section>
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_180px_160px]">
            <label className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="control w-full pl-9"
                placeholder="Search name, email, phone, or position..."
              />
            </label>
            <Filter
              value={position}
              onChange={setPosition}
              label="All positions"
              values={positions}
            />
            <Filter
              value={department}
              onChange={setDepartment}
              label="All departments"
              values={departments}
            />
            <Filter
              value={status}
              onChange={setStatus}
              label="All statuses"
              values={["ACTIVE", "ON_LEAVE", "INACTIVE"]}
            />
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  {[
                    "#",
                    "Employee",
                    "Position",
                    "Department",
                    "Email",
                    "Phone",
                    "Join date",
                    "Salary",
                    "Status",
                    "Actions",
                  ].map((item) => (
                    <th
                      key={item}
                      className="px-3 py-3 font-semibold whitespace-nowrap"
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-3 py-10 text-center text-slate-500"
                    >
                      Loading employees...
                    </td>
                  </tr>
                ) : rows.length ? (
                  rows.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-3 py-3">{index + 1}</td>
                      <td className="px-3 py-3">
                        <p className="font-bold">{item.fullName}</p>
                        <p className="text-xs text-slate-500">
                          {item.employeeId}
                        </p>
                      </td>
                      <td className="px-3 py-3">{item.position}</td>
                      <td className="px-3 py-3">{item.department}</td>
                      <td className="px-3 py-3">{item.email}</td>
                      <td className="px-3 py-3">{item.phone ?? "—"}</td>
                      <td className="px-3 py-3">
                        {new Date(item.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-3">
                        {money.format(item.basicSalary + item.allowance)}
                      </td>
                      <td className="px-3 py-3">
                        <Status value={item.status} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => void viewHistory(item)}
                            aria-label="View salary history"
                            className="action text-slate-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEdit(item)}
                            aria-label="Edit employee"
                            className="action text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => void remove(item)}
                            aria-label="Deactivate employee"
                            className="action text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-3 py-10 text-center text-slate-500"
                    >
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      {historyName && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <section className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Salary history</h2>
                <p className="text-sm text-slate-500">{historyName}</p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryName("")}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="p-3">Effective date</th>
                    <th className="p-3">Previous</th>
                    <th className="p-3">Basic salary</th>
                    <th className="p-3">Allowance</th>
                    <th className="p-3">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.id} className="border-t border-slate-100">
                      <td className="p-3">
                        {new Date(entry.effectiveDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {entry.previousSalary == null
                          ? "—"
                          : money.format(entry.previousSalary)}
                      </td>
                      <td className="p-3 font-semibold">
                        {money.format(entry.basicSalary)}
                      </td>
                      <td className="p-3">{money.format(entry.allowance)}</td>
                      <td className="p-3">{entry.reason ?? "—"}</td>
                    </tr>
                  ))}
                  {!history.length && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-6 text-center text-slate-500"
                      >
                        No salary history yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
      {formOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void save()
            }}
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editing ? "Update employee" : "Add employee"}
                </h2>
                <p className="text-sm text-slate-500">
                  Enter employee and salary information.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Employee ID", "employeeId"],
                ["Full name", "fullName"],
                ["Email", "email"],
                ["Phone", "phone"],
                ["Gender", "gender"],
                ["Date of birth", "dob"],
                ["Address", "address"],
                ["Position", "position"],
                ["Department", "department"],
                ["Join date", "joinedAt"],
                ["Basic salary", "basicSalary"],
                ["Monthly allowance", "allowance"],
              ].map(([label, key]) => (
                <Field key={key} label={label}>
                  <input
                    required={!["phone", "allowance"].includes(key)}
                    type={
                      key === "joinedAt" || key === "dob"
                        ? "date"
                        : ["basicSalary", "allowance"].includes(key)
                          ? "number"
                          : key === "email"
                            ? "email"
                            : "text"
                    }
                    min={
                      ["basicSalary", "allowance"].includes(key)
                        ? "0"
                        : undefined
                    }
                    value={String(form[key as keyof Form] ?? "")}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        [key]: ["basicSalary", "allowance"].includes(key)
                          ? Number(event.target.value)
                          : event.target.value,
                      })
                    }
                    className="control w-full"
                  />
                </Field>
              ))}
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as Form["status"],
                    })
                  }
                  className="control w-full"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On leave</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="secondary"
              >
                Cancel
              </button>
              <button disabled={saving} className="primary">
                {saving
                  ? "Saving..."
                  : editing
                    ? "Update employee"
                    : "Save employee"}
              </button>
            </div>
          </form>
        </div>
      )}
      <style jsx>{`
        .control {
          height: 42px;
          border: 1px solid #dbe3ef;
          border-radius: 0.65rem;
          background: white;
          padding: 0 0.8rem;
          font-size: 0.875rem;
          outline: none;
        }
        .control:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px #2563eb18;
        }
        .primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 0.65rem;
          background: #2563eb;
          padding: 0.7rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
        }
        .primary:hover {
          background: #1d4ed8;
        }
        .primary:disabled {
          opacity: 0.6;
        }
        .secondary {
          border: 1px solid #dbe3ef;
          border-radius: 0.65rem;
          padding: 0.7rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .card {
          min-height: 140px;
          border: 1px solid;
          border-radius: 1rem;
          padding: 1.1rem;
        }
        .card p {
          margin-top: 0.8rem;
          font-weight: 600;
        }
        .card strong {
          display: block;
          margin-top: 0.2rem;
          font-size: 1.5rem;
        }
        .card small {
          display: block;
          margin-top: 0.45rem;
          color: #64748b;
        }
        .icon {
          display: inline-flex;
          border-radius: 0.75rem;
          padding: 0.55rem;
        }
        .card-blue {
          border-color: #bfdbfe;
          background: #eff6ff;
        }
        .card-emerald {
          border-color: #bbf7d0;
          background: #f0fdf4;
        }
        .card-violet {
          border-color: #ddd6fe;
          background: #f5f3ff;
        }
        .card-rose {
          border-color: #fecdd3;
          background: #fff1f2;
        }
        .icon-blue {
          background: #dbeafe;
          color: #2563eb;
        }
        .icon-emerald {
          background: #d1fae5;
          color: #059669;
        }
        .icon-violet {
          background: #ede9fe;
          color: #7c3aed;
        }
        .icon-rose {
          background: #ffe4e6;
          color: #e11d48;
        }
        .action {
          display: inline-flex;
          border-radius: 0.45rem;
          padding: 0.5rem;
        }
        .action:hover {
          background: #f1f5f9;
        }
      `}</style>
    </main>
  )
}

function Filter({
  value,
  onChange,
  label,
  values,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  values: string[]
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="control w-full"
    >
      <option value="">{label}</option>
      {values.map((item) => (
        <option key={item} value={item}>
          {item.replace("_", " ")}
        </option>
      ))}
    </select>
  )
}
function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}
function Status({ value }: { value: Staff["status"] }) {
  const colors =
    value === "ACTIVE"
      ? "bg-emerald-100 text-emerald-700"
      : value === "ON_LEAVE"
        ? "bg-amber-100 text-amber-700"
        : "bg-rose-100 text-rose-700"
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors}`}
    >
      {value.replace("_", " ")}
    </span>
  )
}
function Notice({ text, error = false }: { text: string; error?: boolean }) {
  return (
    <p
      className={`mb-4 rounded-xl p-3 text-sm ${error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}
    >
      {text}
    </p>
  )
}
function apiMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response
    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response &&
      typeof response.data === "object" &&
      response.data !== null &&
      "message" in response.data &&
      typeof response.data.message === "string"
    )
      return response.data.message
  }
  return fallback
}
