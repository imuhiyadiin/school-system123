"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Gift,
  MinusCircle,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  WalletCards,
  X,
} from "lucide-react"
import { apiClient } from "@/services/api/client"

type Teacher = {
  id: string
  fullName: string
  phone?: string | null
  joinedAt: string
  basicSalary: number
  allowance: number
}
type Payroll = {
  id: string
  month: number
  year: number
  basicSalary: number
  allowance: number
  deduction: number
  advance: number
  netSalary: number
  status: "PENDING" | "PAID"
  paymentDate?: string | null
  paymentMethod?: string | null
  note?: string | null
  employee: Teacher
  teacher: Teacher
}
type PayrollResponse = Omit<Payroll, "employee" | "teacher"> & {
  staff: Teacher | null
  teacher: Teacher | null
}
type Summary = {
  basicSalary: number
  allowance: number
  deduction: number
  advance: number
  netSalary: number
  employees: number
}
type Form = {
  staffId: string
  teacherId: string
  basicSalary: string
  allowance: string
  deduction: string
  advance: string
  paymentMethod: string
  note: string
}

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
const blankForm: Form = {
  staffId: "",
  teacherId: "",
  basicSalary: "",
  allowance: "",
  deduction: "0",
  advance: "0",
  paymentMethod: "Bank Transfer",
  note: "",
}

export default function PayrollPage() {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [summary, setSummary] = useState<Summary>({
    basicSalary: 0,
    allowance: 0,
    deduction: 0,
    advance: 0,
    netSalary: 0,
    employees: 0,
  })
  const [selectedId, setSelectedId] = useState("")
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [actionId, setActionId] = useState("")
  const [form, setForm] = useState<Form>(blankForm)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const [payrollResponse, teacherResponse] =
        await Promise.all([
          apiClient.get<{ result: PayrollResponse[] }>(
            `/payroll?month=${month}&year=${year}`
          ),
          apiClient.get<{ result: Teacher[] }>("/employee"),
        ])
      const records = (payrollResponse.data.result ?? [])
        .filter(
          (item) =>
            item.month === month &&
            item.year === year &&
            (item.staff !== null || item.teacher !== null)
        )
        .map(({ staff, teacher, ...payroll }) => {
          const employee = staff ?? teacher
          return { ...payroll, employee, teacher: employee } as Payroll
        })
      const totals = records.reduce<Summary>(
        (current, item) => ({
          basicSalary: current.basicSalary + item.basicSalary,
          allowance: current.allowance + item.allowance,
          deduction: current.deduction + item.deduction,
          advance: current.advance + item.advance,
          netSalary: current.netSalary + item.netSalary,
          employees: current.employees + 1,
        }),
        {
          basicSalary: 0,
          allowance: 0,
          deduction: 0,
          advance: 0,
          netSalary: 0,
          employees: 0,
        }
      )
      setPayrolls(records)
      setSummary(totals)
      setTeachers(teacherResponse.data.result ?? [])
      setSelectedId((current) =>
        records.some((item) => item.id === current)
          ? current
          : (records[0]?.id ?? "")
      )
    } catch {
      setError("Unable to load payroll information.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [month, year])

  const selected = payrolls.find((item) => item.id === selectedId)
  const filtered = payrolls.filter((item) =>
    item.employee.fullName.toLowerCase().includes(query.toLowerCase())
  )
  const netFromForm = Math.max(
    0,
    Number(form.basicSalary || 0) +
      Number(form.allowance || 0) -
      Number(form.deduction || 0) -
      Number(form.advance || 0)
  )
  const openAdd = () => {
    setEditingId(null)
    setForm(blankForm)
    setError("")
    setFormOpen(true)
  }
  const openEdit = (record: Payroll) => {
    setEditingId(record.id)
    setForm({
      staffId: record.employee.id,
      teacherId: "",
      basicSalary: String(record.basicSalary),
      allowance: String(record.allowance),
      deduction: String(record.deduction),
      advance: String(record.advance),
      paymentMethod: record.paymentMethod ?? "Bank Transfer",
      note: record.note ?? "",
    })
    setActionId("")
    setError("")
    setFormOpen(true)
  }
  const chooseTeacher = (staffId: string) => {
    const teacher = teachers.find((item) => item.id === staffId)
    setForm((current) => ({
      ...current,
      staffId,
      basicSalary: teacher ? String(teacher.basicSalary) : "",
      allowance: teacher ? String(teacher.allowance) : "",
    }))
  }
  const generate = async () => {
    setSaving(true)
    setError("")
    setMessage("")
    try {
      const { data } = await apiClient.post<{ message: string }>(
        "/payroll/generate",
        { month, year }
      )
      setMessage(data.message)
      await load()
    } catch (requestError) {
      setError(apiMessage(requestError, "Unable to generate payroll."))
    } finally {
      setSaving(false)
    }
  }
  const savePayroll = async () => {
    if (!form.staffId || !form.basicSalary)
      return setError("Select an employee and enter a basic salary.")
    setSaving(true)
    setError("")
    try {
      const payload = {
        staffId: form.staffId,
        month,
        year,
        basicSalary: Number(form.basicSalary),
        allowance: Number(form.allowance || 0),
        deduction: Number(form.deduction || 0),
        advance: Number(form.advance || 0),
      }
      if (editingId) await apiClient.patch(`/payroll/${editingId}`, payload)
      else await apiClient.post("/payroll", payload)
      setFormOpen(false)
      setMessage(
        editingId
          ? "Payroll updated successfully."
          : "Payroll record added successfully."
      )
      await load()
    } catch (requestError) {
      setError(apiMessage(requestError, "Unable to save payroll."))
    } finally {
      setSaving(false)
    }
  }
  const markPaid = async (record: Payroll) => {
    setSaving(true)
    setError("")
    try {
      await apiClient.patch(`/payroll/${record.id}`, {
        ...record,
        status: "PAID",
        paymentDate: new Date().toISOString(),
        paymentMethod: record.paymentMethod ?? "Bank Transfer",
      })
      setMessage("Payroll marked as paid.")
      await load()
    } catch (requestError) {
      setError(apiMessage(requestError, "Unable to update payroll."))
    } finally {
      setSaving(false)
    }
  }
  const removePayroll = async (record: Payroll) => {
    if (!window.confirm(`Delete payroll for ${record.employee.fullName}?`))
      return
    setSaving(true)
    setActionId("")
    setError("")
    try {
      await apiClient.delete(`/payroll/${record.id}`)
      setMessage("Payroll deleted successfully.")
      await load()
    } catch (requestError) {
      setError(apiMessage(requestError, "Unable to delete payroll."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-svh bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1720px]">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="rounded-2xl bg-blue-600 p-3 text-white shadow-lg shadow-blue-600/20">
              <WalletCards className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-3xl font-bold">Payroll</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage monthly payroll, salaries and staff payments.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="control"
            >
              <>
                {monthNames.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </>
            </select>
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="control"
            >
              {[year - 1, year, year + 1].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void generate()}
              disabled={saving}
              className="primary"
            >
              <RefreshCw className="h-4 w-4" /> Generate payroll
            </button>
          </div>
        </header>
        {error && <Notice text={error} error />}
        {message && <Notice text={message} />}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            [
              CircleDollarSign,
              "Total Basic Salary",
              summary.basicSalary,
              "blue",
            ],
            [Gift, "Total Allowance", summary.allowance, "emerald"],
            [MinusCircle, "Total Deduction", summary.deduction, "rose"],
            [Banknote, "Total Advance", summary.advance, "amber"],
            [WalletCards, "Total Net Salary", summary.netSalary, "violet"],
          ].map(([Icon, label, value, color]) => {
            const CardIcon = Icon as typeof WalletCards
            return (
              <article key={String(label)} className={`stat stat-${color}`}>
                <span className={`stat-icon stat-icon-${color}`}>
                  <CardIcon className="h-5 w-5" />
                </span>
                <p>{String(label)}</p>
                <strong>{money.format(Number(value))}</strong>
                <small>
                  For {summary.employees} employee
                  {summary.employees === 1 ? "" : "s"}
                </small>
              </article>
            )
          })}
        </section>
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
              <div>
                <h2 className="font-bold">Payroll list</h2>
                <p className="text-sm text-slate-500">
                  Salary details for {monthNames[month - 1]} {year}.
                </p>
              </div>
              <div className="flex gap-2">
                <label className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search employee..."
                    className="control pl-9"
                  />
                </label>
                <button type="button" onClick={openAdd} className="primary">
                  <Plus className="h-4 w-4" /> Add payroll
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    {[
                      "#",
                      "Employee",
                      "Basic",
                      "Allowance",
                      "Deduction",
                      "Advance",
                      "Net salary",
                      "Status",
                      "Action",
                    ].map((label) => (
                      <th
                        key={label}
                        className="px-4 py-3 font-semibold whitespace-nowrap"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        Loading payroll...
                      </td>
                    </tr>
                  ) : filtered.length ? (
                    filtered.map((item, index) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`cursor-pointer border-t border-slate-100 ${selectedId === item.id ? "bg-blue-50/60" : "hover:bg-slate-50"}`}
                      >
                        <td className="px-4 py-4">{index + 1}</td>
                        <td className="px-4 py-4">
                          <p className="font-semibold">
                            {item.teacher.fullName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.teacher.phone ?? "Employee"}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          {money.format(item.basicSalary)}
                        </td>
                        <td className="px-4 py-4">
                          {money.format(item.allowance)}
                        </td>
                        <td className="px-4 py-4">
                          {money.format(item.deduction)}
                        </td>
                        <td className="px-4 py-4">
                          {money.format(item.advance)}
                        </td>
                        <td className="px-4 py-4 font-bold">
                          {money.format(item.netSalary)}
                        </td>
                        <td className="px-4 py-4">
                          <Status status={item.status} />
                        </td>
                        <td className="relative px-4 py-4">
                          <button
                            type="button"
                            aria-label="Payroll actions"
                            onClick={(event) => {
                              event.stopPropagation()
                              setActionId(actionId === item.id ? "" : item.id)
                            }}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          {actionId === item.id && (
                            <div className="absolute right-4 z-20 mt-1 w-32 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  openEdit(item)
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50"
                              >
                                <Pencil className="h-4 w-4 text-blue-600" />{" "}
                                Update
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  void removePayroll(item)
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        No payroll records for this period. Generate payroll or
                        add one manually.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">Employee details</h2>
            {selected ? (
              <>
                <div className="mt-5 border-b border-slate-100 pb-5">
                  <p className="text-lg font-bold">
                    {selected.teacher.fullName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Joined{" "}
                    {new Date(selected.teacher.joinedAt).toLocaleDateString()}
                  </p>
                  <div className="mt-3">
                    <Status status={selected.status} />
                  </div>
                </div>
                <h3 className="mt-5 font-semibold">Salary breakdown</h3>
                <div className="mt-3 space-y-3 text-sm">
                  {[
                    ["Basic salary", selected.basicSalary],
                    ["Allowance", selected.allowance],
                    ["Deduction", -selected.deduction],
                    ["Advance", -selected.advance],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex justify-between">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-medium">
                        {money.format(Number(value))}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between rounded-lg bg-blue-50 px-3 py-3 font-bold text-blue-700">
                    <span>Net salary</span>
                    <span>{money.format(selected.netSalary)}</span>
                  </div>
                </div>
                <h3 className="mt-6 font-semibold">Payment information</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Status</dt>
                    <dd>
                      <Status status={selected.status} />
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Payment method</dt>
                    <dd className="font-medium">
                      {selected.paymentMethod ?? "—"}
                    </dd>
                  </div>
                  {selected.paymentDate && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Paid on</dt>
                      <dd className="font-medium">
                        {new Date(selected.paymentDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
                {selected.status === "PENDING" && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void markPaid(selected)}
                    className="primary mt-6 w-full justify-center"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Mark as paid
                  </button>
                )}
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Select an employee to view payroll details.
              </p>
            )}
          </aside>
        </div>
      </div>
      {formOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void savePayroll()
            }}
            className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId ? "Update payroll" : "Add payroll"}
                </h2>
                <p className="text-sm text-slate-500">
                  {monthNames[month - 1]} {year}
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
              <Field label="Employee">
                <select
                  required
                  disabled={Boolean(editingId)}
                  value={form.staffId}
                  onChange={(event) => chooseTeacher(event.target.value)}
                  className="control w-full"
                >
                  <option value="">Select employee</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.fullName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Payment method">
                <select
                  value={form.paymentMethod}
                  onChange={(event) =>
                    setForm({ ...form, paymentMethod: event.target.value })
                  }
                  className="control w-full"
                >
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Mobile Money</option>
                </select>
              </Field>
              {[
                ["Basic salary", "basicSalary"],
                ["Allowance", "allowance"],
                ["Deduction", "deduction"],
                ["Advance", "advance"],
              ].map(([label, key]) => (
                <Field key={key} label={label}>
                  <input
                    required={key === "basicSalary"}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form[key as keyof Form]}
                    onChange={(event) =>
                      setForm({ ...form, [key]: event.target.value })
                    }
                    className="control w-full"
                  />
                </Field>
              ))}
              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-sm text-blue-700">Net salary</p>
                <strong className="mt-1 block text-2xl text-blue-800">
                  {money.format(netFromForm)}
                </strong>
              </div>
              <div className="sm:col-span-2">
                <Field label="Note">
                  <textarea
                    value={form.note}
                    onChange={(event) =>
                      setForm({ ...form, note: event.target.value })
                    }
                    className="min-h-20 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                  />
                </Field>
              </div>
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
                  : editingId
                    ? "Update payroll"
                    : "Save payroll"}
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
          background: #fff;
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
          color: #fff;
          box-shadow: 0 1px 2px #0f172a18;
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
        .stat {
          min-height: 145px;
          border: 1px solid;
          border-radius: 1rem;
          padding: 1.1rem;
        }
        .stat p {
          margin-top: 0.8rem;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .stat strong {
          display: block;
          margin-top: 0.25rem;
          font-size: 1.5rem;
        }
        .stat small {
          display: block;
          margin-top: 0.45rem;
          color: #64748b;
        }
        .stat-icon {
          display: inline-flex;
          padding: 0.55rem;
          border-radius: 0.75rem;
        }
        .stat-blue {
          border-color: #bfdbfe;
          background: #eff6ff;
        }
        .stat-emerald {
          border-color: #bbf7d0;
          background: #f0fdf4;
        }
        .stat-rose {
          border-color: #fecdd3;
          background: #fff1f2;
        }
        .stat-amber {
          border-color: #fde68a;
          background: #fffbeb;
        }
        .stat-violet {
          border-color: #ddd6fe;
          background: #f5f3ff;
        }
        .stat-icon-blue {
          background: #dbeafe;
          color: #2563eb;
        }
        .stat-icon-emerald {
          background: #d1fae5;
          color: #059669;
        }
        .stat-icon-rose {
          background: #ffe4e6;
          color: #e11d48;
        }
        .stat-icon-amber {
          background: #fef3c7;
          color: #d97706;
        }
        .stat-icon-violet {
          background: #ede9fe;
          color: #7c3aed;
        }
      `}</style>
    </main>
  )
}

function Status({ status }: { status: Payroll["status"] }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
    >
      {status === "PAID" ? "Paid" : "Pending"}
    </span>
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
