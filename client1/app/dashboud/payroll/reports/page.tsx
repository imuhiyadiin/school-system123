"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/services/api/client"

type Report = {
  month: number
  year: number
  totalEmployees: number
  totalBasicSalary: number
  totalAllowance: number
  totalDeduction: number
  totalNetSalary: number
  paymentStatus: string
}
const months = [
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
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export default function PayrollReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [error, setError] = useState("")
  useEffect(() => {
    apiClient
      .get<{ reports: Report[] }>("/payroll/reports")
      .then(({ data }) => setReports(data.reports ?? []))
      .catch(() => setError("Unable to load payroll reports."))
  }, [])
  return (
    <main className="min-h-svh bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Payroll History / Reports</h1>
        <p className="mt-1 text-slate-500">
          Monthly payroll totals from the server.
        </p>
        {error && <p className="mt-4 text-rose-600">{error}</p>}
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {[
                  "Period",
                  "Employees",
                  "Basic",
                  "Allowance",
                  "Deduction",
                  "Net salary",
                  "Payment",
                ].map((label) => (
                  <th key={label} className="p-3">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((item) => (
                <tr key={`${item.year}-${item.month}`} className="border-t">
                  <td className="p-3 font-semibold">
                    {months[item.month - 1]} {item.year}
                  </td>
                  <td className="p-3">{item.totalEmployees}</td>
                  <td className="p-3">{money.format(item.totalBasicSalary)}</td>
                  <td className="p-3">{money.format(item.totalAllowance)}</td>
                  <td className="p-3">{money.format(item.totalDeduction)}</td>
                  <td className="p-3 font-semibold">
                    {money.format(item.totalNetSalary)}
                  </td>
                  <td className="p-3">{item.paymentStatus}</td>
                </tr>
              ))}
              {!reports.length && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No payroll history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
