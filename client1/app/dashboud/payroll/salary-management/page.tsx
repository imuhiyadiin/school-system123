"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/services/api/client"

type Staff = {
  id: string
  employeeId: string
  fullName: string
  position: string
  department: string
  basicSalary: number
  allowance: number
}
type History = {
  id: string
  basicSalary: number
  previousSalary?: number | null
  allowance: number
  effectiveDate: string
  reason?: string | null
}
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export default function SalaryManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [selected, setSelected] = useState<Staff | null>(null)
  const [history, setHistory] = useState<History[]>([])
  const [basicSalary, setBasicSalary] = useState("")
  const [allowance, setAllowance] = useState("")
  const [reason, setReason] = useState("")
  const [message, setMessage] = useState("")

  const load = async () => {
    const { data } = await apiClient.get<{ staff: Staff[] }>("/staff")
    setStaff(data.staff ?? [])
  }
  const select = async (item: Staff) => {
    setSelected(item)
    setBasicSalary(String(item.basicSalary))
    setAllowance(String(item.allowance))
    const { data } = await apiClient.get<{ salaryHistory: History[] }>(
      `/staff/${item.id}/salary-history`
    )
    setHistory(data.salaryHistory ?? [])
  }
  useEffect(() => {
    void load()
  }, [])
  const save = async () => {
    if (!selected) return
    await apiClient.post(`/staff/${selected.id}/salary`, {
      basicSalary: Number(basicSalary),
      allowance: Number(allowance || 0),
      reason,
      effectiveDate: new Date().toISOString(),
    })
    setMessage("Salary updated and saved to history.")
    await load()
    await select({
      ...selected,
      basicSalary: Number(basicSalary),
      allowance: Number(allowance || 0),
    })
  }

  return (
    <main className="min-h-svh bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Salary Management</h1>
        <p className="mt-1 text-slate-500">
          Update staff salaries while preserving each salary change.
        </p>
        {message && (
          <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-emerald-700">
            {message}
          </p>
        )}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <section className="rounded-2xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Current salary</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => void select(item)}
                    className="cursor-pointer border-t hover:bg-blue-50"
                  >
                    <td className="p-3">
                      <b>{item.fullName}</b>
                      <br />
                      <span className="text-xs text-slate-500">
                        {item.employeeId} · {item.position}
                      </span>
                    </td>
                    <td className="p-3">
                      {money.format(item.basicSalary + item.allowance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="rounded-2xl border bg-white p-5">
            {selected ? (
              <>
                <h2 className="text-xl font-bold">{selected.fullName}</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label>
                    Basic salary
                    <input
                      type="number"
                      min="0"
                      value={basicSalary}
                      onChange={(event) => setBasicSalary(event.target.value)}
                      className="mt-1 w-full rounded-lg border p-2"
                    />
                  </label>
                  <label>
                    Allowance
                    <input
                      type="number"
                      min="0"
                      value={allowance}
                      onChange={(event) => setAllowance(event.target.value)}
                      className="mt-1 w-full rounded-lg border p-2"
                    />
                  </label>
                  <label className="sm:col-span-2">
                    Reason for change
                    <input
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="Promotion, annual adjustment..."
                      className="mt-1 w-full rounded-lg border p-2"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => void save()}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
                >
                  Save salary change
                </button>
                <h3 className="mt-7 font-bold">Salary history</h3>
                <table className="mt-3 w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Previous</th>
                      <th className="p-2">New</th>
                      <th className="p-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-2">
                          {new Date(item.effectiveDate).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          {item.previousSalary == null
                            ? "—"
                            : money.format(item.previousSalary)}
                        </td>
                        <td className="p-2">
                          {money.format(item.basicSalary + item.allowance)}
                        </td>
                        <td className="p-2">{item.reason ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="text-slate-500">
                Select an employee to manage salary.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
