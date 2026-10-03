"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { apiClient } from "@/services/api/client"

type TeacherFormValues = Record<string, string | number | boolean | string[]> & {
  email: string
  username: string
  fullName: string
  gender: string
  dob: string
  password: string
  phone?: string
  address?: string
  basicSalary?: number
  allowance?: number
  arrivalTime?: string
  subjectIds: string[]
}

type SubjectOption = { id: string; name: string; grade?: number }

type TeacherCreateFormProps = {
  error: string | null
  onCancel: () => void
  onSubmit: (values: TeacherFormValues) => Promise<void>
}

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"

export function TeacherCreateForm({
  error,
  onCancel,
  onSubmit,
}: TeacherCreateFormProps) {
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(true)
  const [subjectsError, setSubjectsError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<TeacherFormValues>({ defaultValues: { subjectIds: [] } })
  const selectedSubjectIds = watch("subjectIds") ?? []

  useEffect(() => {
    let active = true
    apiClient
      .get("/subject")
      .then(({ data }) => {
        if (!active) return
        const records = Array.isArray(data?.subjects) ? data.subjects : []
        setSubjects(
          records
            .filter(
              (item: unknown): item is Record<string, unknown> =>
                typeof item === "object" && item !== null
            )
            .map((item: Record<string, unknown>) => ({
              id: String(item.id ?? ""),
              name: String(item.name ?? ""),
              ...(typeof item.grade === "number" ? { grade: item.grade } : {}),
            }))
            .filter((item: SubjectOption) => item.id && item.name)
        )
      })
      .catch(() => {
        if (active) setSubjectsError("Unable to load subjects. Please try again.")
      })
      .finally(() => {
        if (active) setSubjectsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const textFields: {
    name: "email" | "username" | "fullName" | "password" | "phone"
    label: string
    type?: string
    required?: boolean
  }[] = [
    { name: "fullName", label: "Full name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "username", label: "Username", required: true },
    { name: "password", label: "Password", type: "password", required: true },
    { name: "phone", label: "Phone" },
  ]

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
    >
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Create teacher
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Geli xogta khasabka ah; xogta kale waa ikhtiyaari.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-2 text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close form"
        >
          ×
        </button>
      </header>

      <div className="space-y-5 bg-slate-50/70 px-5 py-6 sm:px-8">
        {error && (
          <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h3 className="mb-4 border-b border-slate-100 pb-3 text-sm font-bold text-slate-800">
            Teacher account and personal details
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {textFields.map((field) => (
              <label key={field.name} className="block text-sm font-medium text-slate-700">
                {field.label}{field.required && <span className="ml-1 text-rose-500">*</span>}
                <input
                  type={field.type ?? "text"}
                  autoComplete={field.name === "password" ? "new-password" : field.name}
                  {...register(field.name, { required: field.required })}
                  className={inputClass}
                />
              </label>
            ))}

            <label className="block text-sm font-medium text-slate-700">
              Gender<span className="ml-1 text-rose-500">*</span>
              <select {...register("gender", { required: true })} className={inputClass} defaultValue="">
                <option value="" disabled>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Date of birth<span className="ml-1 text-rose-500">*</span>
              <input type="date" {...register("dob", { required: true })} className={inputClass} />
            </label>
            <label className="block text-sm font-medium text-slate-700 md:col-span-2">
              Address
              <textarea {...register("address")} rows={3} className={inputClass} />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h3 className="mb-2 text-sm font-bold text-slate-800">
            Teaching subjects<span className="ml-1 text-rose-500">*</span>
          </h3>
          <p className="mb-4 text-xs text-slate-500">
            Dooro dhammaan maaddooyinka uu macallinku dhigayo.
          </p>
          <input
            type="hidden"
            {...register("subjectIds", {
              validate: (value) => value.length > 0 || "Select at least one subject.",
            })}
          />
          {subjectsLoading ? (
            <p className="text-sm text-slate-500">Loading subjects…</p>
          ) : subjectsError ? (
            <p role="alert" className="text-sm text-rose-600">{subjectsError}</p>
          ) : subjects.length ? (
            <div className="grid max-h-52 gap-2 overflow-y-auto rounded-xl border border-slate-200 p-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => {
                const checked = selectedSubjectIds.includes(subject.id)
                return (
                  <label
                    key={subject.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setValue(
                          "subjectIds",
                          checked
                            ? selectedSubjectIds.filter((id) => id !== subject.id)
                            : [...selectedSubjectIds, subject.id],
                          { shouldDirty: true, shouldValidate: true }
                        )
                      }
                      className="h-4 w-4 rounded accent-blue-600"
                    />
                    <span>
                      {subject.name}
                      {subject.grade ? ` (Grade ${subject.grade})` : ""}
                    </span>
                  </label>
                )
              })}
            </div>
          ) : (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Maaddooyin lama helin. Marka hore ku dar maaddo bogga Subjects.
            </p>
          )}
          {errors.subjectIds && (
            <p className="mt-2 text-xs text-rose-600">
              {errors.subjectIds.message ?? "Dooro ugu yaraan hal maaddo."}
            </p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h3 className="mb-4 border-b border-slate-100 pb-3 text-sm font-bold text-slate-800">
            Work details (optional)
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block text-sm font-medium text-slate-700">
              Arrival time
              <input type="time" {...register("arrivalTime")} className={inputClass} />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Basic salary
              <input type="number" min="0" step="0.01" {...register("basicSalary", { valueAsNumber: true })} className={inputClass} />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Monthly allowance
              <input type="number" min="0" step="0.01" {...register("allowance", { valueAsNumber: true })} className={inputClass} />
            </label>
          </div>
        </section>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium hover:bg-slate-50">
            Cancel
          </button>
          <button disabled={isSubmitting} className="rounded-lg bg-blue-600 px-7 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {isSubmitting ? "Saving…" : "Create teacher"}
          </button>
        </div>
      </div>
    </form>
  )
}
