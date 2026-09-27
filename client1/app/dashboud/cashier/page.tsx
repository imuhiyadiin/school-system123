"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  BadgeDollarSign,
  Check,
  CircleDollarSign,
  CreditCard,
  Download,
  Pencil,
  Save,
  Trash2,
  WalletCards,
  X,
} from "lucide-react"
import { apiClient } from "@/services/api/client"
import { DataTable, type DataTableColumn } from "../components/DataTable"

type Student = {
  id: string
  studentID?: string | null
  fullName: string
  totalFee?: number | null
  classrooms?: Array<{
    classroomId?: string
    classroom?: { name?: string; section?: string }
  }>
}
type Classroom = { id: string; name: string; section?: string }
type Fee = { id: string; name: string; amount: number; isActive: boolean }
type Payment = {
  id: string
  paymentDate: string
  paymentMode: string
  amount: number
  reference?: string | null
  note?: string | null
  student?: {
    fullName: string
    studentID?: string | null
    classrooms?: Array<{ classroom?: { name?: string; section?: string } }>
  }
}
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})
const paymentColumns: DataTableColumn[] = [
  { key: "student", label: "Student" },
  { key: "studentID", label: "Student ID" },
  { key: "paymentDate", label: "Date" },
  { key: "amount", label: "Amount Paid" },
  { key: "paymentMode", label: "Payment Mode" },
  { key: "reference", label: "Reference No" },
  { key: "note", label: "Note" },
]

export default function CashierPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [fees, setFees] = useState<Fee[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [allPayments, setAllPayments] = useState<Payment[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [studentId, setStudentId] = useState("")
  const [studentSearchId, setStudentSearchId] = useState("")
  const [classroomId, setClassroomId] = useState("")
  const [breakdownClassId, setBreakdownClassId] = useState("")
  const [paymentDate, setPaymentDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  )
  const [paymentMode, setPaymentMode] = useState("")
  const [amount, setAmount] = useState("")
  const [reference, setReference] = useState("")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null)
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null)
  const [feeName, setFeeName] = useState("")
  const [feeAmount, setFeeAmount] = useState("")
  const [feeSaving, setFeeSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const { data } = await apiClient.get<{ payments: Payment[] }>(
        "/cashier/payments"
      )
      setAllPayments(data?.payments ?? [])
    } catch {
      setError("Unable to load payment history.")
    } finally {
      setHistoryLoading(false)
    }
  }
  useEffect(() => {
    void Promise.all([
      apiClient.get("/students"),
      apiClient.get("/classroom"),
      apiClient.get("/fees"),
    ])
      .then(([studentsResponse, classroomsResponse, feesResponse]) => {
        setStudents(
          Array.isArray(studentsResponse.data)
            ? studentsResponse.data
            : (studentsResponse.data?.result ??
                studentsResponse.data?.students ??
                [])
        )
        setClassrooms(
          Array.isArray(classroomsResponse.data)
            ? classroomsResponse.data
            : (classroomsResponse.data?.result ??
                classroomsResponse.data?.classrooms ??
                [])
        )
        setFees(
          Array.isArray(feesResponse.data)
            ? feesResponse.data
            : (feesResponse.data?.result ?? [])
        )
      })
      .catch(() => setError("Unable to load fee information."))
    void loadHistory()
  }, [])
  useEffect(() => {
    if (!studentId) return setPayments([])
    void apiClient
      .get<{ payments: Payment[] }>(`/cashier/student/${studentId}/payments`)
      .then(({ data }) => setPayments(data?.payments ?? []))
      .catch(() => setError("Unable to load student payments."))
  }, [studentId])
  const selectedStudent = useMemo(
    () => students.find((student) => student.id === studentId),
    [students, studentId]
  )
  const selectedClassroom = classrooms.find((item) => item.id === classroomId)
  const activeFees = fees.filter((fee) => fee.isActive)
  const defaultTotal = activeFees.reduce(
    (sum, fee) => sum + Number(fee.amount),
    0
  )
  // Fee Summary is school-wide: add each student's own assigned fee. This
  // means one student with a $14 fee makes Total Fees show $14.00 even before
  // selecting that student in the payment form.
  const total = students.reduce((sum, student) => {
    const fee = Number(student.totalFee)
    return sum + (Number.isFinite(fee) && fee > 0 ? fee : 0)
  }, 0)
  const allPaid = allPayments.reduce((sum, payment) => {
    const paymentAmount = Number(payment.amount)
    return sum + (Number.isFinite(paymentAmount) ? paymentAmount : 0)
  }, 0)
  const due = Math.max(total - allPaid, 0)
  const currentMonth = new Date().toISOString().slice(0, 7)
  const paidStudents = new Set(
    allPayments
      .filter((payment) => payment.paymentDate.slice(0, 7) === currentMonth)
      .map((payment) => payment.student?.studentID)
      .filter((studentID): studentID is string => Boolean(studentID))
  ).size
  const unpaidStudents = students.filter(
    (student) =>
      (!breakdownClassId ||
        student.classrooms?.some(
          (entry) => entry.classroomId === breakdownClassId
        )) &&
      !allPayments.some(
        (payment) =>
          payment.student?.studentID === student.studentID &&
          payment.paymentDate.slice(0, 7) === currentMonth
      )
  )
  const unpaidAmount = unpaidStudents.length * defaultTotal
  const exportUnpaidStudents = () => {
    const csvValue = (value: string | number) =>
      `"${String(value).replaceAll('"', '""')}"`
    const rows = unpaidStudents.map((student, index) => {
      const classroom = student.classrooms?.[0]?.classroom
      const classroomName = `${classroom?.name ?? ""}${
        classroom?.section ? ` - ${classroom.section}` : ""
      }`
      return [
        index + 1,
        student.fullName,
        student.studentID ?? "",
        classroomName,
        defaultTotal.toFixed(2),
      ]
        .map(csvValue)
        .join(",")
    })
    const csv = [
      ["No.", "Student", "Student ID", "Classroom", "Outstanding"]
        .map(csvValue)
        .join(","),
      ...rows,
    ].join("\n")
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    )
    const link = document.createElement("a")
    link.href = url
    link.download = `unpaid-students-${currentMonth}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  const selectStudent = (student?: Student) => {
    setStudentId(student?.id ?? "")
    setClassroomId(student?.classrooms?.[0]?.classroomId ?? "")
  }
  const resetPayment = () => {
    setEditingPaymentId(null)
    setPaymentMode("")
    setAmount("")
    setReference("")
    setNote("")
  }
  const savePayment = async () => {
    if (!studentId) return setError("Enter a valid Student ID first.")
    if (
      !paymentDate ||
      !paymentMode ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    )
      return setError("Enter the payment date, mode, and a valid amount.")
    const updating = Boolean(editingPaymentId)
    const id = editingPaymentId
    const duplicateMonth = payments.some(
      (item) =>
        item.id !== id &&
        item.paymentDate.slice(0, 7) === paymentDate.slice(0, 7)
    )
    if (duplicateMonth)
      return setError("This student has already paid for the selected month.")
    setSaving(true)
    setError("")
    try {
      const payload = {
        studentId,
        paymentDate,
        paymentMode,
        amount: Number(amount),
        reference,
        note,
      }
      const { data } = updating
        ? await apiClient.patch<{ payment: Payment }>(
            `/cashier/payment/${id}`,
            payload
          )
        : await apiClient.post<{ payment: Payment }>(
            "/cashier/payment",
            payload
          )
      setPayments((items) =>
        updating
          ? items.map((item) => (item.id === id ? data.payment : item))
          : [data.payment, ...items]
      )
      await loadHistory()
      resetPayment()
      setMessage(
        updating
          ? "Payment updated successfully."
          : "Payment saved successfully."
      )
    } catch (requestError) {
      const message =
        typeof requestError === "object" &&
        requestError !== null &&
        "response" in requestError &&
        typeof requestError.response === "object" &&
        requestError.response !== null &&
        "data" in requestError.response &&
        typeof requestError.response.data === "object" &&
        requestError.response.data !== null &&
        "message" in requestError.response.data &&
        typeof requestError.response.data.message === "string"
          ? requestError.response.data.message
          : updating
            ? "Failed to update payment."
            : "Failed to save payment."
      setError(message)
    } finally {
      setSaving(false)
    }
  }
  const editPayment = (payment: Payment) => {
    setEditingPaymentId(payment.id)
    setPaymentDate(payment.paymentDate.slice(0, 10))
    setPaymentMode(payment.paymentMode)
    setAmount(String(payment.amount))
    setReference(payment.reference ?? "")
    setNote(payment.note ?? "")
    setMessage("Editing payment. Update values then save.")
  }
  const removePayment = async (payment: Payment) => {
    if (
      !window.confirm(
        `Delete payment of ${money.format(Number(payment.amount))}?`
      )
    )
      return
    try {
      await apiClient.delete(`/cashier/payment/${payment.id}`)
      setPayments((items) => items.filter((item) => item.id !== payment.id))
      await loadHistory()
      if (editingPaymentId === payment.id) resetPayment()
      setMessage("Payment deleted successfully.")
    } catch {
      setError("Failed to delete payment.")
    }
  }
  const beginFeeEdit = (fee: Fee) => {
    setEditingFeeId(fee.id)
    setFeeName(fee.name)
    setFeeAmount(String(fee.amount))
  }
  const cancelFeeEdit = () => {
    setEditingFeeId(null)
    setFeeName("")
    setFeeAmount("")
  }
  const updateFee = async (fee: Fee) => {
    const nextAmount = Number(feeAmount)
    if (!feeName.trim() || !Number.isFinite(nextAmount) || nextAmount < 0)
      return setError("Enter a valid fee name and amount.")
    setFeeSaving(true)
    try {
      const { data } = await apiClient.patch<{ fee: Fee }>(`/fees/${fee.id}`, {
        name: feeName.trim(),
        amount: nextAmount,
      })
      setFees((items) =>
        items.map((item) => (item.id === fee.id ? data.fee : item))
      )
      cancelFeeEdit()
      setMessage("Fee updated successfully.")
    } catch {
      setError("Failed to update fee.")
    } finally {
      setFeeSaving(false)
    }
  }
  const deleteFee = async (fee: Fee) => {
    if (!window.confirm(`Delete ${fee.name}?`)) return
    try {
      await apiClient.delete(`/fees/${fee.id}`)
      setFees((items) => items.filter((item) => item.id !== fee.id))
      setMessage("Fee deleted successfully.")
    } catch {
      setError("Failed to delete fee.")
    }
  }
  const paymentRows = allPayments.map((payment) => ({
    ...payment,
    student: payment.student?.fullName ?? "—",
    studentID: payment.student?.studentID ?? "—",
    classroom:
      payment.student?.classrooms
        ?.map((item) => item.classroom)
        .filter(Boolean) ?? [],
    paymentDate: dateFormat.format(new Date(payment.paymentDate)),
    amount: money.format(Number(payment.amount)),
  }))
  return (
    <main className="min-h-svh bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <section className="mx-auto max-w-[1720px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-6">
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-blue-50 p-4 text-blue-600">
              <WalletCards />
            </span>
            <div>
              <h1 className="text-2xl font-bold">Student Fee Management</h1>
              <p className="text-sm text-slate-500">
                Record and manage student fee payments
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={exportUnpaidStudents}
              disabled={!unpaidStudents.length}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Export
            </button>
            <Link
              href="/dashboud/cashier/unpaid-students"
              className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              Unpaid Students
            </Link>
          </div>
        </header>
        <div className="space-y-6 p-6">
          <Summary
            total={total}
            paid={allPaid}
            due={due}
            paidStudents={paidStudents}
          />
          <section>
              <h2 className="mb-5 font-bold">Student Information</h2>
              <div className="grid gap-5 md:grid-cols-4">
                <Field label="Student ID" required>
                  <input
                    value={studentSearchId}
                    onChange={(event) => {
                      setStudentSearchId(event.target.value)
                      selectStudent(
                        students.find(
                          (student) =>
                            student.studentID?.toLowerCase() ===
                            event.target.value.trim().toLowerCase()
                        )
                      )
                    }}
                    placeholder="Enter Student ID"
                    className="fee-input"
                  />
                </Field>
                <Field label="Student Name">
                  <input
                    value={selectedStudent?.fullName ?? ""}
                    readOnly
                    className="fee-input bg-slate-50"
                  />
                </Field>
                <Field label="Class">
                  <input
                    value={selectedClassroom?.name ?? ""}
                    readOnly
                    className="fee-input bg-slate-50"
                  />
                </Field>
                <Field label="Section">
                  <input
                    value={selectedClassroom?.section ?? ""}
                    readOnly
                    className="fee-input bg-slate-50"
                  />
                </Field>
              </div>
          </section>
          <div>
            <section className="rounded-lg border border-slate-200 p-5">
              <h2 className="mb-5 font-bold">
                {editingPaymentId ? "Update Payment" : "Payment Details"}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Payment Date" required>
                  <input
                    type="date"
                    value={paymentDate}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(event) => setPaymentDate(event.target.value)}
                    className="fee-input"
                  />
                </Field>
                <Field label="Payment Mode" required>
                  <select
                    value={paymentMode}
                    onChange={(event) => setPaymentMode(event.target.value)}
                    className="fee-input"
                  >
                    <option value="">Select Payment Mode</option>
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Mobile Money</option>
                  </select>
                </Field>
                <Field label="Amount Paid" required>
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="fee-input"
                  />
                </Field>
                <Field label="Reference No">
                  <input
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                    className="fee-input"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Note">
                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      className="fee-input min-h-20 py-3"
                    />
                  </Field>
                </div>
              </div>
              {editingPaymentId && (
                <button
                  type="button"
                  onClick={resetPayment}
                  className="mt-4 text-sm font-semibold"
                >
                  Cancel update
                </button>
              )}
              <button
                type="button"
                onClick={() => void savePayment()}
                disabled={saving}
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving
                  ? "Saving..."
                  : editingPaymentId
                    ? "Update Payment"
                    : "Save Payment"}
              </button>
            </section>
          </div>
          <section className="rounded-lg border border-slate-200 p-5">
            <h2 className="mb-4 font-bold">Payment History</h2>
            <DataTable
              columns={paymentColumns}
              data={paymentRows}
              loading={historyLoading}
              filterFields={{ status: false, studentId: true }}
              showFilterHeader={false}
              onEdit={(record) => {
                const payment = allPayments.find(
                  (item) => item.id === String(record.id)
                )
                if (payment) editPayment(payment)
              }}
              onDelete={(record) => {
                const payment = allPayments.find(
                  (item) => item.id === String(record.id)
                )
                if (payment) void removePayment(payment)
              }}
            />
          </section>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          {message && <p className="text-sm text-emerald-600">{message}</p>}
        </div>
      </section>
      <style jsx>{`
        .fee-input,
        .table-input {
          width: 100%;
          height: 44px;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0 0.875rem;
          font-size: 0.875rem;
          outline: none;
        }
        .table-input {
          height: 36px;
          min-width: 7rem;
        }
        .fee-input:focus,
        .table-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px #3b82f61f;
        }
        .table-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.375rem;
          padding: 0.5rem;
        }
        .table-action:hover {
          background: #f1f5f9;
        }
        textarea.fee-input {
          height: auto;
        }
      `}</style>
    </main>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block text-sm font-medium text-slate-800">
      <span>
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  )
}
function Summary({
  total,
  paid,
  due,
  paidStudents,
}: {
  total: number
  paid: number
  due: number
  paidStudents: number
}) {
  const items = [
    [CircleDollarSign, "Total Fees", total, "text-blue-600 bg-blue-50"],
    [CreditCard, "Paid Amount", paid, "text-emerald-600 bg-emerald-50"],
    [BadgeDollarSign, "Due Amount", due, "text-rose-500 bg-rose-50"],
    [Check, "Students Paid", paidStudents, "text-violet-600 bg-violet-50"],
  ] as const
  return (
    <section className="rounded-lg border border-slate-200 p-5">
      <h2 className="mb-5 font-bold">Fee Summary</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(([Icon, label, value, color]) => (
          <div key={label} className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className={`mt-1 font-bold ${color.split(" ")[0]}`}>
                {label === "Students Paid" ? value : money.format(value)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
