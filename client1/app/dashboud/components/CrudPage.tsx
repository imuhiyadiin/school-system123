"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { apiClient } from "@/services/api/client"
import { Button } from "@/components/ui/button"
import { TeacherCreateForm } from "../teachers/components/TeacherCreateForm"
import {
  BookMarked,
  Bus,
  CalendarCheck,
  CalendarClock,
  Download,
  FileText,
  GraduationCap,
  School,
  UserRound,
  UsersRound,
  VenusAndMars,
} from "lucide-react"
import {
  DataTable,
  type DataTableColumn,
  type DataTableFilterFields,
} from "./DataTable"

type Field = {
  name: string
  label: string
  type?:
    | "text"
    | "email"
    | "password"
    | "tel"
    | "number"
    | "date"
    | "time"
    | "textarea"
    | "checkbox"
    | "multi-select"
    | "select"
  required?: boolean
  options?: string
  values?: string[]
  multiple?: boolean
  formVisible?: boolean
}
type CrudPageProps = {
  title: string
  endpoint: string
  createEndpoint?: string
  unwrap?: string
  columns?: DataTableColumn[]
  showStats?: boolean
  searchPlaceholder?: string
  searchKeys?: string[]
  filterFields?: DataTableFilterFields
  classroomFilterKey?: string
}
type Values = Record<string, string | number | boolean | string[]>

const fields: Record<string, Field[]> = {
  "/students": [
    { name: "fullName", label: "fullName", required: true },
    // The server assigns this automatically, beginning at 1000.
    { name: "studentID", label: "Student ID", formVisible: false },
    { name: "password", label: "Password", type: "password", required: true },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      values: ["Male", "Female"],
      required: true,
    },
    { name: "dob", label: "Date of birth", type: "date", required: true },
    { name: "phone", label: "Phone", required: true },
    { name: "address", label: "Address", type: "textarea", required: true },
    { name: "parentName", label: "Parent name", required: true },
    {
      name: "parentPhone",
      label: "Parent phone",
      type: "tel",
      required: true,
    },
    {
      name: "classroomId",
      label: "Classroom",
      type: "select",
      options: "/classroom",
      required: true,
    },
    {
      name: "busId",
      label: "Student bus",
      type: "select",
      options: "/bus",
    },
    { name: "totalFee", label: "Total fee", type: "number", required: true },
    {
      name: "studentStatus",
      label: "Student status",
      type: "select",
      values: ["ACTIVE", "INACTIVE", "GRADUATED"],
    },
  ],
  "/bus": [
    { name: "fullName", label: "Full name", required: true },
    { name: "phone", label: "Phone", type: "tel", required: true },
    { name: "vehiclePlate", label: "Vehicle plate (optional)" },
    { name: "location", label: "Location", required: true },
    {
      name: "arrivalTime",
      label: "Arrival time",
      type: "time",
    },
  ],
  "/teacher": [
    { name: "email", label: "Email", type: "email", required: true },
    { name: "username", label: "Username", required: true },
    { name: "fullName", label: "Full name", required: true },
    { name: "password", label: "Password", type: "password", required: true },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      values: ["Male", "Female"],
      required: true,
    },
    { name: "dob", label: "Date of birth", type: "date", required: true },
    { name: "arrivalTime", label: "Arrival time", type: "time" },
    { name: "phone", label: "Phone" },
    { name: "address", label: "Address", type: "textarea" },
    { name: "basicSalary", label: "Basic salary", type: "number" },
    { name: "allowance", label: "Monthly allowance", type: "number" },
  ],
  "/classroom": [
    { name: "name", label: "Classroom name", required: true },
    { name: "section", label: "Section", required: true },
    { name: "grade", label: "Grade", type: "number", required: true },
    {
      name: "teacherId",
      label: "Teacher",
      type: "select",
      options: "/teacher",
      required: true,
    },
  ],
  "/subject": [
    { name: "name", label: "Subject name", required: true },
    { name: "description", label: "Description", type: "textarea" },
  ],
  "/exam": [
    { name: "name", label: "Exam name", required: true },
    {
      name: "subjectIds",
      label: "Subjects",
      type: "multi-select",
      options: "/subject",
      required: true,
    },
    {
      name: "type",
      label: "Exam type",
      type: "select",
      values: ["QUIZ", "MONTHLY", "MIDTERM", "THIRD", "FINAL"],
      required: true,
    },
    { name: "total", label: "Total marks", type: "number", required: true },
    {
      name: "minMarks",
      label: "Minimum pass marks",
      type: "number",
      required: true,
    },
    { name: "date", label: "Exam date", type: "date", required: true },
  ],
  "/result": [
    {
      name: "classId",
      label: "Classroom",
      type: "select",
      options: "/classroom",
      required: true,
    },
    {
      name: "studentId",
      label: "Student",
      type: "select",
      options: "/students",
      required: true,
    },
    {
      name: "examId",
      label: "Exam",
      type: "select",
      options: "/exam",
      required: true,
    },
    { name: "marks", label: "Marks", type: "number", required: true },
  ],
  "/attendance": [
    {
      name: "studentId",
      label: "Student",
      type: "select",
      options: "/students",
      required: true,
    },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "status", label: "Present", type: "checkbox" },
  ],
  "/timetable": [
    {
      name: "classroomId",
      label: "Classroom",
      type: "select",
      options: "/classroom",
      required: true,
    },
    { name: "day", label: "Day", required: true },
    { name: "time", label: "Time", required: true },
    { name: "subject", label: "Subject", required: true },
  ],
  "/cashier": [
    {
      name: "userId",
      label: "User",
      type: "select",
      options: "/user",
      required: true,
    },
    { name: "fullName", label: "Full name", required: true },
  ],
  "/issue": [
    {
      name: "classId",
      label: "Classroom",
      type: "select",
      options: "/classroom",
      required: true,
    },
    {
      name: "studentId",
      label: "Student",
      type: "select",
      options: "/students",
      required: true,
    },
    { name: "type", label: "Issue type", required: true },
    { name: "details", label: "Details", type: "textarea", required: true },
    { name: "isResolved", label: "Resolved", type: "checkbox" },
  ],
  "/user": [
    { name: "name", label: "Full name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Password", type: "password", required: true },
    {
      name: "role",
      label: "Role",
      type: "select",
      values: ["ADMIN", "TEACHER", "User"],
      required: true,
    },
    {
      name: "permissions",
      label: "Pages this user can access",
      type: "multi-select",
      values: [
        "/dashboud/students",
        "/dashboud/teachers",
        "/dashboud/classrooms",
        "/dashboud/subjects",
        "/dashboud/exams",
        "/dashboud/results",
        "/dashboud/attendance",
        "/dashboud/timetable",
        "/dashboud/fees",
        "/dashboud/issues",
        "/dashboud/users",
      ],
    },
  ],
}

const label = (record: Record<string, unknown>) =>
  String(
    record.fullName ??
      record.name ??
      record.username ??
      record.email ??
      record.id
  )
const saveErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response
    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response
    ) {
      const data = response.data
      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      )
        return data.message
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

  return (
    response.result ??
    response.students ??
    response.teachers ??
    response.classrooms ??
    response.subjects ??
    response.exams ??
    []
  )
}

const groupExamRecords = (records: Record<string, unknown>[]) => {
  const groups = new Map<string, Record<string, unknown>[]>()
  for (const record of records) {
    const key = JSON.stringify([
      record.name,
      record.type,
      new Date(String(record.date)).toISOString(),
      record.total,
      record.minMarks,
    ])
    groups.set(key, [...(groups.get(key) ?? []), record])
  }

  return [...groups.values()].map((group) => {
    const subjectNames = group
      .map((record) => {
        const subject = record.subject as { name?: unknown } | null | undefined
        return typeof subject?.name === "string" ? subject.name : ""
      })
      .filter(Boolean)
    return {
      ...group[0],
      subject: subjectNames.join(", ") || "—",
      examIds: group.map((record) => String(record.id)),
    }
  })
}

export function CrudPage({
  title,
  endpoint,
  createEndpoint,
  unwrap = "result",
  columns: customColumns,
  showStats = false,
  searchPlaceholder,
  searchKeys,
  filterFields,
  classroomFilterKey,
}: CrudPageProps) {
  const searchParams = useSearchParams()
  const studentToViewId = searchParams.get("viewStudent")
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    defaultValues: {
      status: true,
      isResolved: false,
      subjectIds: [],
    },
  })
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [options, setOptions] = useState<
    Record<string, Record<string, unknown>[]>
  >({})
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewingStudent, setViewingStudent] = useState<Record<
    string,
    unknown
  > | null>(null)
  const [viewingTeacher, setViewingTeacher] = useState<Record<
    string,
    unknown
  > | null>(null)
  const formFields = useMemo(() => {
    const configuredFields = fields[endpoint] ?? []
    if (endpoint !== "/exam" || !editingId) return configuredFields
    return configuredFields.map((field) =>
      field.name === "subjectIds"
        ? { ...field, name: "subjectId", label: "Subject", type: "select" as const }
        : field
    )
  }, [endpoint, editingId])
  const selectedClassroomId = watch("classId")
  const stats = useMemo(() => {
    const total = records.length
    const countGender = (gender: string) =>
      records.filter((record) => String(record.gender).toLowerCase() === gender)
        .length

    if (endpoint === "/students" || endpoint === "/teacher") {
      const baseStats = [
        { label: `Total ${title}`, value: total, tone: "blue", icon: UsersRound, detail: "All registered records" },
        { label: "Male", value: countGender("male"), tone: "indigo", icon: UserRound, detail: "Male records" },
        { label: "Female", value: countGender("female"), tone: "rose", icon: VenusAndMars, detail: "Female records" },
      ]
      return endpoint === "/students"
        ? [
            ...baseStats,
            {
              label: "Active Students",
              value: records.filter((record) => (record.status ?? "ACTIVE") === "ACTIVE").length,
              tone: "emerald",
              icon: GraduationCap,
              detail: "Currently enrolled",
            },
            {
              label: "Inactive Students",
              value: records.filter((record) => record.status === "INACTIVE").length,
              tone: "amber",
              icon: UserRound,
              detail: "No longer attending",
            },
            {
              label: "Graduated Students",
              value: records.filter((record) => record.status === "GRADUATED").length,
              tone: "indigo",
              icon: GraduationCap,
              detail: "Completed their studies",
            },
            {
              label: "Students with Bus",
              value: records.filter((record) => Boolean(record.busId)).length,
              tone: "emerald",
              icon: Bus,
              detail: "Students assigned to a bus",
            },
          ]
        : baseStats
    }

    if (endpoint === "/classroom") {
      const grades = new Set(
        records
          .map((record) => record.grade)
          .filter(
            (grade) => grade !== null && grade !== undefined && grade !== ""
          )
      )
      const assigned = records.filter((record) => record.teacherId).length
      return [
        { label: "Total Classrooms", value: total, tone: "blue", icon: School, detail: "Available classrooms" },
        { label: "Grades", value: grades.size, tone: "indigo", icon: BookMarked, detail: "Grade levels available" },
        { label: "Assigned Teachers", value: assigned, tone: "emerald", icon: UsersRound, detail: "Classrooms with teachers" },
      ]
    }

    if (endpoint === "/subject") {
      const described = records.filter((record) => record.description).length
      return [
        { label: "Total Subjects", value: total, tone: "blue", icon: BookMarked, detail: "Subjects in the system" },
        { label: "With Description", value: described, tone: "emerald", icon: FileText, detail: "Subjects with a description" },
        {
          label: "Without Description",
          value: total - described,
          tone: "amber",
          icon: FileText,
          detail: "Subjects needing a description",
        },
      ]
    }

    if (endpoint === "/bus") {
      return [
        { label: "Registered Buses", value: total, tone: "emerald", icon: Bus, detail: "Active transport records" },
      ]
    }

    const today = new Date()
    const upcoming = records.filter((record) => {
      const examDate = new Date(String(record.date))
      return !Number.isNaN(examDate.getTime()) && examDate >= today
    }).length
    return [
      { label: "Total Exams", value: total, tone: "blue", icon: GraduationCap, detail: "All exam records" },
      { label: "Upcoming Exams", value: upcoming, tone: "indigo", icon: CalendarClock, detail: "Scheduled from today" },
      { label: "Completed Exams", value: total - upcoming, tone: "emerald", icon: CalendarCheck, detail: "Past exam records" },
    ]
  }, [endpoint, records, title])
  const columns = useMemo<DataTableColumn[]>(
    () =>
      customColumns ??
      formFields
        .filter((field) => field.type !== "password")
        .map((field) =>
          field.name === "studentStatus" && endpoint === "/students"
            ? { key: "status", label: "Student status" }
            : field.name === "classroomId" && endpoint === "/students"
            ? { key: "classrooms", label: "Classroom" }
            : field.name === "busId" && endpoint === "/students"
              ? { key: "bus", label: "Student bus" }
              : field.name === "subjectIds" && endpoint === "/teacher"
                ? { key: "subjects", label: field.label }
              : field.name === "subjectIds" && endpoint === "/exam"
                ? { key: "subject", label: field.label }
              : { key: field.name, label: field.label }
        ),
    [customColumns, endpoint, formFields]
  )
  const exportRecords = () => {
    const csvValue = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`
    const csv = [
      columns.map((column) => csvValue(column.label)).join(","),
      ...records.map((record) => columns.map((column) => csvValue(record[column.key])).join(",")),
    ].join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `${title.toLowerCase().replaceAll(" ", "-")}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get(
        endpoint,
        endpoint === "/students"
          ? { params: { includeArchived: true } }
          : undefined
      )
      const value = Array.isArray(data)
        ? data
        : (data?.[unwrap] ??
          data?.result ??
          data?.students ??
          data?.teachers ??
          data?.results ??
          data?.exams ??
          data?.subjects ??
          data?.attendance ??
          [])
      const loadedRecords = Array.isArray(value) ? value : []
      setRecords(
        endpoint === "/exam"
          ? groupExamRecords(loadedRecords as Record<string, unknown>[])
          : loadedRecords
      )
    } catch {
      setError("Unable to load records.")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
  }, [endpoint])
  useEffect(() => {
    if (endpoint !== "/students" || !studentToViewId || !records.length) return
    const student = records.find(
      (record) => String(record.id) === studentToViewId
    )
    if (student) setViewingStudent(student)
  }, [endpoint, records, studentToViewId])
  useEffect(() => {
    const paths = [
      ...new Set(
        formFields.flatMap((field) => (field.options ? [field.options] : []))
      ),
    ]
    if (!paths.length) {
      setOptions({})
      setOptionsLoading(false)
      return
    }
    setOptionsLoading(true)
    void Promise.all(
      paths.map(async (path) => {
        try {
          const { data } = await apiClient.get(path)
          return [path, unpack(data) as Record<string, unknown>[]] as const
        } catch {
          return [path, []] as const
        }
      })
    ).then((items) => {
      setOptions(Object.fromEntries(items))
      setOptionsLoading(false)
    })
  }, [formFields])
  const submit = async (values: Values) => {
    setError(null)
    setMessage(null)
    if (
      endpoint === "/exam" &&
      !editingId &&
      (!Array.isArray(values.subjectIds) || values.subjectIds.length === 0)
    ) {
      setError("Dooro ugu yaraan hal maaddo exam-ka.")
      return
    }
    try {
      const data = { ...values }
      if (endpoint === "/students" && editingId) {
        data.status = String(values.studentStatus ?? "ACTIVE")
        delete data.studentStatus
      }
      if (endpoint === "/exam" && editingId) {
        data.subjectId = Array.isArray(values.subjectId)
          ? values.subjectId[0] ?? ""
          : String(values.subjectId ?? "")
      }
      // Student IDs are generated by the API and must never come from this form.
      if (endpoint === "/students") delete data.studentID
      const wasEditing = Boolean(editingId)
      let createdStudentID = ""
      let createdTeacher: Record<string, unknown> | null = null
      if (editingId) {
        if (endpoint === "/user") {
          await apiClient.patch(`${endpoint}/${editingId}`, {
            fullname: values.name,
            email: values.email,
            role: values.role,
            permissions: values.permissions,
            ...(String(values.password ?? "").trim()
              ? { password: values.password }
              : {}),
          })
        } else {
          if (endpoint !== "/teacher") delete data.email
          if (!["/students", "/teacher"].includes(endpoint)) delete data.username
          if (!String(data.password ?? "").trim()) delete data.password
          await apiClient.patch(`${endpoint}/${editingId}`, data)
        }
      } else {
        const response = await apiClient.post(createEndpoint ?? endpoint, data)
        const student = response.data?.student as
          { studentID?: unknown } | undefined
        createdStudentID =
          typeof student?.studentID === "string" ? student.studentID : ""
        const teacher = response.data?.teacher
        if (
          endpoint === "/teacher" &&
          typeof teacher === "object" &&
          teacher !== null
        ) {
          createdTeacher = teacher as Record<string, unknown>
        }
      }
      reset({ status: true, isResolved: false, subjectIds: [] })
      setEditingId(null)
      setIsFormModalOpen(false)
      setMessage(
        !wasEditing && endpoint === "/students" && createdStudentID
          ? `Student created successfully. Student ID: ${createdStudentID}`
          : wasEditing
            ? "Updated successfully."
            : "Saved successfully."
      )
      if (createdTeacher) {
        setRecords((current) => [createdTeacher as Record<string, unknown>, ...current])
      } else {
        await load()
      }
    } catch (error) {
      setError(saveErrorMessage(error))
    }
  }
  const edit = (record: Record<string, unknown>) => {
    setEditingId(String(record.id))
    setIsFormModalOpen(true)
    const data: Values = {}
    formFields.forEach((field) => {
      if (endpoint === "/exam" && field.name === "subjectIds") {
        data.subjectId = String(record.subjectId ?? "")
        return
      }
      const studentClassrooms = record.classrooms as
        { classroomId?: string }[] | undefined
      const value =
        field.name === "password"
          ? ""
          : field.name === "subjectIds" && endpoint === "/exam"
            ? (record.subjectId ? [String(record.subjectId)] : [])
          : field.name === "subjectIds" && endpoint === "/teacher"
            ? (record.subjects as { subjectId?: string }[] | undefined)?.map(
                (item) => item.subjectId ?? ""
              ) ?? []
          : field.name === "name" && endpoint === "/user"
          ? record.username
          : field.name === "studentStatus" && endpoint === "/students"
            ? record.status ?? "ACTIVE"
          : field.name === "classroomId" && endpoint === "/students"
            ? studentClassrooms?.[0]?.classroomId
            : record[field.name]
      data[field.name] =
        field.type === "date" && typeof value === "string"
          ? value.slice(0, 10)
          : Array.isArray(value) ||
              typeof value === "boolean" ||
              typeof value === "number" ||
              typeof value === "string"
            ? value
            : ""
    })
    reset(data)
    setMessage(null)
  }
  const remove = async (id: string) => {
    if (!confirm("Delete this record?")) return
    try {
      await apiClient.delete(`${endpoint}/${id}`)
      setMessage("Deleted successfully.")
      await load()
    } catch {
      setError("Unable to delete this record.")
    }
  }
  const removeMany = async (ids: string[]) => {
    setError(null)
    try {
      const idsToDelete =
        endpoint === "/exam"
          ? records
              .filter((record) => ids.includes(String(record.id)))
              .flatMap((record) =>
                Array.isArray(record.examIds)
                  ? record.examIds.map(String)
                  : [String(record.id)]
              )
          : ids
      const results = await Promise.allSettled(
        idsToDelete.map((id) => apiClient.delete(`${endpoint}/${id}`))
      )
      const failed = results.filter(
        (result) => result.status === "rejected"
      ).length
      setMessage(
        failed
          ? `${idsToDelete.length - failed} record(s) deleted; ${failed} could not be deleted.`
          : `${idsToDelete.length} record(s) deleted successfully.`
      )
      if (failed) setError("Some selected records could not be deleted.")
      await load()
    } catch {
      setError("Unable to delete selected records.")
    }
  }
  const removeExamGroup = async (record: Record<string, unknown>) => {
    const ids = Array.isArray(record.examIds)
      ? record.examIds.map(String)
      : [String(record.id)]
    if (!confirm(`Delete this exam for all ${ids.length} selected subject(s)?`)) return
    setError(null)
    try {
      await Promise.all(ids.map((id) => apiClient.delete(`${endpoint}/${id}`)))
      setMessage("Exam and its subject records deleted successfully.")
      await load()
    } catch {
      setError("Unable to delete this exam group.")
    }
  }
  const updateManyClassrooms = async (ids: string[], classroomId: string) => {
    setError(null)
    try {
      const results = await Promise.allSettled(
        ids.map((id) => apiClient.patch(`${endpoint}/${id}`, { classroomId }))
      )
      const failed = results.filter(
        (result) => result.status === "rejected"
      ).length
      setMessage(
        failed
          ? `${ids.length - failed} student(s) moved; ${failed} could not be updated.`
          : `${ids.length} student(s) moved to the selected class.`
      )
      if (failed) setError("Some selected students could not be updated.")
      await load()
    } catch {
      setError("Unable to update selected students.")
    }
  }
  const updateManyStudentStatuses = async (
    ids: string[],
    status: "ACTIVE" | "INACTIVE" | "GRADUATED"
  ) => {
    setError(null)
    try {
      const results = await Promise.allSettled(
        ids.map((id) => apiClient.patch(`${endpoint}/${id}`, { status }))
      )
      const failed = results.filter((result) => result.status === "rejected").length
      setMessage(
        failed
          ? `${ids.length - failed} student(s) updated; ${failed} could not be updated.`
          : `${ids.length} student(s) marked ${status.toLowerCase()}.`
      )
      if (failed) setError("Some selected students could not be updated.")
      await load()
    } catch {
      setError("Unable to update selected students.")
    }
  }
  // All dashboard forms share the same wide, aligned layout as the student form.
  const isStudentPage = true
  const studentTitle = title === "Students" ? "Student" : title
  const fieldControlClass = isStudentPage
    ? "mt-3 h-16 w-full rounded-xl border border-slate-200 bg-white px-5 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
    : "mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"
  return (
    <main className="min-h-svh min-w-0 overflow-x-hidden bg-slate-50 p-3 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1720px]">
        <header className="mb-6 flex flex-col items-stretch justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">
              School Management
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Manage your school {title.toLowerCase()} in one place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
          <Button type="button" variant="outline" onClick={exportRecords} className="h-11 min-w-0 rounded-xl px-3 text-sm sm:h-12 sm:px-5 sm:text-base">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={() => {
              reset({ status: true, isResolved: false, subjectIds: [] })
              setEditingId(null)
              setIsFormModalOpen(true)
            }}
            className={`h-11 min-w-0 rounded-xl px-3 text-sm sm:h-12 sm:px-5 sm:text-base ${
              title === "Students"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {title === "Students" ? "New Student" : `+ New ${studentTitle}`}
          </Button>
          </div>
        </header>
        {!isStudentPage && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-emerald-600">
              School Management
            </p>
            <h1 className="mt-1 text-3xl font-bold">{title}</h1>
          </div>
        )}
        {error && (
          <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </p>
        )}
        {showStats && (
          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <article
                  key={stat.label}
                  className="dashboard-state-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="dashboard-stat-label text-sm font-medium text-slate-500">
                        {stat.label}
                      </p>
                      <p
                        className={`mt-2 text-3xl font-bold ${
                          stat.tone === "rose"
                            ? "text-rose-600"
                            : stat.tone === "amber"
                              ? "text-amber-600"
                              : stat.tone === "emerald"
                                ? "text-emerald-600"
                                : stat.tone === "indigo"
                                  ? "text-indigo-600"
                                  : "text-blue-600"
                        }`}
                      >
                        {stat.value}
                      </p>
                    </div>
                    <span className="dashboard-state-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{stat.detail}</p>
                </article>
              )
            })}
          </section>
        )}
        <div className="space-y-6">
          {isFormModalOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${editingId ? "Update" : "Create"} ${studentTitle}`}
              className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm sm:p-6"
            >
              <div className="mx-auto flex min-h-full max-w-6xl items-center">
                {endpoint === "/teacher" && !editingId ? (
                  <TeacherCreateForm
                    error={error}
                    onCancel={() => {
                      reset({ status: true, isResolved: false, subjectIds: [] })
                      setEditingId(null)
                      setIsFormModalOpen(false)
                    }}
                    onSubmit={submit}
                  />
                ) : (
                <form
                  onSubmit={handleSubmit(submit)}
                  className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                >
                  <div className="border-b border-slate-200 px-5 py-5 sm:px-8 sm:py-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-medium text-white">
                          +
                        </span>
                        <div>
                          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                            {editingId
                              ? `Update ${studentTitle}`
                              : `Create New ${studentTitle}`}
                          </h2>
                          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                            Fill in the details below to save this record.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          reset({ status: true, isResolved: false, subjectIds: [] })
                          setEditingId(null)
                          setIsFormModalOpen(false)
                        }}
                        className="rounded-lg px-2 text-2xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close form"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4 bg-slate-50/70 px-5 py-5 sm:px-8 sm:py-6">
                    <section className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
                      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        <h3 className="text-sm font-bold text-slate-800">
                          {studentTitle} Information
                        </h3>
                      </div>
                      <div className="grid gap-x-7 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
                    {formFields.filter((field) => field.formVisible !== false && (field.name !== "studentStatus" || Boolean(editingId))).map((field) => (
                      <label
                        key={field.name}
                        className={`${isStudentPage && field.name === "address" ? "xl:col-span-3" : ""} block text-sm font-medium text-slate-800`}
                      >
                        {field.type === "checkbox" ? (
                          <span className="flex items-center gap-2">
                            <input type="checkbox" {...register(field.name)} />
                            {field.label}
                          </span>
                        ) : (
                          <>
                            <span
                              className={
                                isStudentPage ? "text-lg font-medium" : ""
                              }
                            >
                              {field.label}
                              {field.required &&
                                !(editingId && ["/students", "/user", "/teacher"].includes(endpoint) && field.name === "password") && (
                                <span className="ml-1 text-rose-500">*</span>
                              )}
                            </span>
                            {field.type === "multi-select" ? (
                              <span
                                className="mt-2 block max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3"
                              >
                                <input type="hidden" {...register(field.name)} />
                                {endpoint === "/exam" && field.name === "subjectIds" && (
                                  <div className="mb-2 flex justify-between border-b border-slate-100 pb-2 text-xs">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setValue(
                                          field.name,
                                          (options[field.options ?? ""] ?? []).map((item) => String(item.id)),
                                          { shouldDirty: true, shouldValidate: true }
                                        )
                                      }
                                      className="font-semibold text-blue-700 hover:underline"
                                    >
                                      Select all subjects
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setValue(field.name, [], {
                                          shouldDirty: true,
                                          shouldValidate: true,
                                        })
                                      }
                                      className="text-slate-500 hover:underline"
                                    >
                                      Clear
                                    </button>
                                  </div>
                                )}
                                {(field.options
                                  ? (options[field.options] ?? []).map((item) => ({ value: String(item.id), label: label(item) }))
                                  : (field.values ?? []).map((value) => ({ value, label: value }))
                                ).map(({ value, label: optionLabel }) => {
                                  const current = Array.isArray(watch(field.name))
                                    ? (watch(field.name) as string[])
                                    : []
                                  const selected = current.includes(value)
                                  return (
                                    <div
                                      key={value}
                                      className="flex cursor-pointer items-center gap-2 py-1 text-sm text-slate-700"
                                    >
                                      <input
                                        type="checkbox"
                                        aria-label={optionLabel}
                                        checked={selected}
                                        onChange={() =>
                                        setValue(
                                          field.name,
                                          selected
                                            ? current.filter(
                                                (item) => item !== value
                                              )
                                            : [...current, value]
                                        )
                                        }
                                        className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                                      />
                                      <span>{optionLabel}</span>
                                    </div>
                                  )
                                })}
                              </span>
                            ) : field.type === "textarea" ? (
                              <textarea
                                {...register(field.name, {
                                  required: field.required,
                                })}
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                className={
                                  isStudentPage
                                    ? "mt-3 min-h-32 w-full rounded-xl border border-slate-200 bg-white p-5 text-base transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    : "mt-1 min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm"
                                }
                              />
                            ) : field.type === "select" ? (
                              <select
                                {...register(field.name, {
                                  required: field.required,
                                })}
                                multiple={field.multiple}
                                size={field.multiple ? 3 : undefined}
                                value={
                                  field.multiple
                                    ? Array.isArray(watch(field.name))
                                      ? (watch(field.name) as string[])
                                      : []
                                    : undefined
                                }
                                onChange={(event) => {
                                  if (field.multiple) {
                                    setValue(
                                      field.name,
                                      Array.from(event.target.selectedOptions).map(
                                        (option) => option.value
                                      )
                                    )
                                    return
                                  }
                                  register(field.name, {
                                    required: field.required,
                                  }).onChange(event)
                                  if (
                                    endpoint === "/result" &&
                                    field.name === "classId"
                                  )
                                    setValue("studentId", "")
                                }}
                                className={
                                  field.multiple
                                    ? "mt-2 h-[76px] w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    : fieldControlClass
                                }
                              >
                                {!field.multiple && (
                                  <option value="">Select {field.label}</option>
                                )}
                                {field.options && optionsLoading && (
                                  <option value="" disabled>
                                    Loading options…
                                  </option>
                                )}
                                {field.options &&
                                  !optionsLoading &&
                                  options[field.options]?.length === 0 && (
                                    <option value="" disabled>
                                      {field.options === "/subject"
                                        ? "No subjects available — create a subject first"
                                        : `No ${field.label.toLowerCase()} options available`}
                                    </option>
                                  )}
                                {field.values?.map((value) => (
                                  <option key={value} value={value}>
                                    {field.multiple
                                      ? value
                                          .replace("/dashboud/", "")
                                          .replace(/(^|-)\w/g, (letter) =>
                                            letter.toUpperCase()
                                          )
                                      : value}
                                  </option>
                                ))}
                                {(field.name === "studentId" &&
                                endpoint === "/result"
                                  ? (options[field.options ?? ""] ?? []).filter(
                                      (item) =>
                                        Array.isArray(item.classrooms) &&
                                        item.classrooms.some(
                                          (entry) =>
                                            typeof entry === "object" &&
                                            entry !== null &&
                                            (entry as { classroomId?: unknown })
                                              .classroomId ===
                                              selectedClassroomId
                                        )
                                    )
                                  : (options[field.options ?? ""] ?? [])
                                ).map((item) => (
                                  <option
                                    key={String(item.id)}
                                    value={String(item.id)}
                                  >
                                    {label(item)}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.type ?? "text"}
                                {...register(field.name, {
                                  required:
                                    field.required &&
                                    !(editingId && ["/students", "/user", "/teacher"].includes(endpoint) && field.name === "password"),
                                  valueAsNumber: field.type === "number",
                                })}
                                placeholder={
                                  field.type === "date"
                                    ? undefined
                                    : editingId && ["/students", "/user", "/teacher"].includes(endpoint) && field.name === "password"
                                      ? "Leave blank to keep the current password"
                                    : `Enter ${field.label.toLowerCase()}`
                                }
                                className={fieldControlClass}
                              />
                            )}
                            {errors[field.name] && (
                              <span className="mt-1 block text-xs text-rose-600">
                                {field.label} is required.
                              </span>
                            )}
                          </>
                        )}
                      </label>
                    ))}
                      </div>
                    </section>
                    <div
                      className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4"
                    >
                      <button
                        disabled={isSubmitting}
                        className="rounded-lg bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                      >
                        {isSubmitting
                          ? "Saving..."
                          : editingId
                            ? "Update"
                            : "Save"}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null)
                            reset({ status: true, isResolved: false, subjectIds: [] })
                            setIsFormModalOpen(false)
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </form>
                )}
              </div>
            </div>
          )}
          <section
            className={
              isStudentPage
                ? "min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                : "min-w-0 rounded-2xl bg-white p-5 shadow-sm"
            }
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold">Records</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void load()}
                  className="rounded-lg border px-3 py-1.5 text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
            <DataTable
              columns={columns}
              data={records}
              loading={loading}
              searchPlaceholder={
                searchPlaceholder ??
                (endpoint === "/students"
                  ? "Search by Student ID..."
                  : undefined)
              }
              searchKeys={
                searchKeys ??
                (endpoint === "/students" ? ["studentID"] : undefined)
              }
              filterFields={endpoint === "/students" ? { ...filterFields, studentStatus: true } : filterFields}
              showExport={false}
              classroomFilterKey={classroomFilterKey}
              onEdit={endpoint === "/exam" ? undefined : edit}
              onDelete={(record) =>
                endpoint === "/exam"
                  ? void removeExamGroup(record)
                  : void remove(String(record.id))
              }
              onBulkDelete={(ids) => void removeMany(ids)}
              classroomOptions={
                endpoint === "/students"
                  ? (options["/classroom"] ?? []).map((item) => ({
                      id: String(item.id),
                      name: item.name,
                      section: item.section,
                    }))
                  : undefined
              }
              onBulkClassUpdate={
                endpoint === "/students"
                  ? (ids, classroomId) =>
                      void updateManyClassrooms(ids, classroomId)
                  : undefined
              }
              onBulkStatusUpdate={
                endpoint === "/students"
                  ? (ids, status) => void updateManyStudentStatuses(ids, status)
                  : undefined
              }
              onView={
                endpoint === "/students"
                  ? setViewingStudent
                  : endpoint === "/teacher"
                    ? setViewingTeacher
                    : undefined
              }
            />
          </section>
        </div>
      </div>
      {viewingStudent && (
        <StudentDetails
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
        />
      )}
      {viewingTeacher && (
        <TeacherDetails
          teacher={viewingTeacher}
          onClose={() => setViewingTeacher(null)}
        />
      )}
    </main>
  )
}

type StudentOverview = {
  payments: Array<{
    id: string
    paymentDate: string
    paymentMode: string
    amount: number
    reference?: string | null
    note?: string | null
  }>
  attendances: Array<{ id: string; date: string; status: string }>
  results: Array<{
    id: string
    marks: number
    subject: { name: string }
    exam: {
      id: string
      name: string
      type: string
      date: string
      total: number
      minMarks: number
    }
  }>
}

function StudentDetails({
  student,
  onClose,
}: {
  student: Record<string, unknown>
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<
    "Profile" | "Fees" | "Examination" | "Attendance"
  >("Profile")
  const [overview, setOverview] = useState<StudentOverview | null>(null)
  const [overviewError, setOverviewError] = useState("")
  const studentId = String(student.id)
  useEffect(() => {
    let mounted = true
    void apiClient
      .get<StudentOverview>(`/students/${studentId}/overview`)
      .then(({ data }) => {
        if (mounted) setOverview(data)
      })
      .catch(() => {
        if (mounted) setOverviewError("Unable to load this student's records.")
      })
    return () => {
      mounted = false
    }
  }, [studentId])
  const classrooms = student.classrooms as
    | Array<{
        classroom?: { name?: unknown; section?: unknown; grade?: unknown }
      }>
    | undefined
  const classroom = classrooms?.[0]?.classroom
  const bus = student.bus as
    | { fullName?: unknown; vehiclePlate?: unknown; location?: unknown }
    | null
    | undefined
  const value = (key: string) => {
    const item = student[key]
    if (item === null || item === undefined || item === "") return "—"
    if (key === "dob" && typeof item === "string")
      return new Date(item).toLocaleDateString()
    return String(item)
  }
  const rows = [
    ["Date Of Birth", value("dob")],
    ["Gender", value("gender")],
    ["Mobile Number", value("phone")],
    ["Parent Name", value("parentName")],
    ["Parent Phone", value("parentPhone")],
    ["Student bus", bus?.fullName ? String(bus.fullName) : "—"],
    ["Password", "Hidden for security"],
    ["Total Fee", value("totalFee")],
    ["Admission Date", value("admissionDate")],
  ]
  const className = classroom?.name
    ? `${String(classroom.name)}${classroom.section ? ` - ${String(classroom.section)}` : ""}`
    : typeof student.classroomId === "string"
      ? student.classroomId
      : "—"
  rows.splice(0, 0, ["Class", className])
  const tabs: Array<typeof activeTab> = [
    "Profile",
    "Fees",
    "Examination",
    "Attendance",
  ]
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Student details"
      className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/40 p-3 backdrop-blur-sm sm:p-6"
    >
      <div className="mx-auto grid min-h-full max-w-[1750px] gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="h-fit rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-200 p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {value("fullName")}
                </h2>
                <p className="mt-5 text-sm text-slate-500">Student ID</p>
                <p className="mt-1 font-semibold text-blue-600">
                  {value("studentID")}
                </p>
                <p className="mt-5 text-sm text-slate-500">Phone</p>
                <p className="mt-1 font-semibold text-blue-600">
                  {value("phone")}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-2 text-2xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close student details"
              >
                ×
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100 p-5 text-sm">
            <InfoLine label="Class" value={className} />
            <InfoLine
              label="Grade"
              value={classroom?.grade ? String(classroom.grade) : "—"}
            />
            <InfoLine label="Gender" value={value("gender")} />
            <InfoLine label="Parent name" value={value("parentName")} />
          </div>
        </aside>
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-slate-200 px-6 pt-5 text-base font-medium text-slate-600 sm:px-10">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-2 pb-4 transition ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent hover:text-slate-900"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-5 sm:p-6">
            {activeTab === "Profile" ? (
              <div className="space-y-6">
                <DetailCard title="Student Information" rows={rows} />
                <DetailCard
                  title="Address"
                  rows={[["Address", value("address")]]}
                />
              </div>
            ) : overviewError ? (
              <p className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
                {overviewError}
              </p>
            ) : !overview ? (
              <p className="py-10 text-center text-sm text-slate-500">
                Loading student records...
              </p>
            ) : activeTab === "Fees" ? (
              <FeeHistory payments={overview.payments} />
            ) : activeTab === "Examination" ? (
              <ExaminationHistory results={overview.results} />
            ) : (
              <AttendanceHistory records={overview.attendances} />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function TeacherDetails({
  teacher,
  onClose,
}: {
  teacher: Record<string, unknown>
  onClose: () => void
}) {
  const subjects = teacher.subjects as
    | Array<{ subject?: { name?: unknown; grade?: unknown } }>
    | undefined
  const user = teacher.user as
    | { email?: unknown; username?: unknown }
    | null
    | undefined
  const display = (value: unknown) =>
    value === null || value === undefined || value === "" ? "—" : String(value)
  const date = (value: unknown) => {
    if (typeof value !== "string") return display(value)
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
  }
  const subjectName = subjects?.length
    ? subjects
        .map(({ subject }) =>
          subject?.name
            ? `${display(subject.name)}${subject.grade ? ` (Grade ${display(subject.grade)})` : ""}`
            : ""
        )
        .filter(Boolean)
        .join(", ") || "—"
    : "—"
  const information = [
    ["Full name", display(teacher.fullName)],
    ["Email", display(user?.email)],
    ["Username", display(user?.username)],
    ["Gender", display(teacher.gender)],
    ["Date of birth", date(teacher.dob)],
    ["Phone", display(teacher.phone)],
    ["Teaching subject", subjectName],
    ["Arrival time", display(teacher.arrivalTime)],
    ["Joined date", date(teacher.joinedAt)],
  ]
  const payroll = [
    ["Basic salary", display(teacher.basicSalary)],
    ["Monthly allowance", display(teacher.allowance)],
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Teacher details"
      className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={onClose}
    >
      <section
        className="mx-auto my-8 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-sm font-semibold text-emerald-600">Teacher profile</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {display(teacher.fullName)}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{subjectName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 text-2xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close teacher details"
          >
            ×
          </button>
        </header>
        <div className="mt-6 space-y-5">
          <DetailCard title="Teacher information" rows={information} />
          <DetailCard title="Salary information" rows={payroll} />
          <DetailCard title="Address" rows={[["Address", display(teacher.address)]]} />
        </div>
      </section>
    </div>
  )
}

function FeeHistory({ payments }: { payments: StudentOverview["payments"] }) {
  return (
    <section>
      <h3 className="mb-4 text-xl font-bold">Fee Payment History</h3>
      <div className="overflow-x-auto border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Payment Date</th>
              <th className="px-4 py-3">Amount Paid</th>
              <th className="px-4 py-3">Payment Mode</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reference</th>
            </tr>
          </thead>
          <tbody>
            {payments.length ? (
              payments.map((payment) => (
                <tr key={payment.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium">
                    {new Date(payment.paymentDate).toLocaleString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {Number(payment.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{payment.paymentMode}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                      Paid
                    </span>
                  </td>
                  <td className="px-4 py-3">{payment.reference ?? "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No fee payments have been recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ExaminationHistory({
  results,
}: {
  results: StudentOverview["results"]
}) {
  const termName = (type: string) =>
    ({
      QUIZ: "Quiz",
      MONTHLY: "Monthly Test",
      MIDTERM: "Mid Term",
      THIRD: "Third Term",
      FINAL: "Final Term",
    })[type] ?? type.replaceAll("_", " ")
  const grade = (percentage: number) =>
    percentage >= 90
      ? "A+"
      : percentage >= 80
        ? "A"
        : percentage >= 70
          ? "B+"
          : percentage >= 60
            ? "B"
            : percentage >= 50
              ? "C"
              : percentage >= 40
                ? "D"
                : "F"
  const examGroups = results.reduce<Record<string, StudentOverview["results"]>>(
    (groups, result) => {
      const year = new Date(result.exam.date).getFullYear()
      const key = `${result.exam.type}-${year}`
      ;(groups[key] ??= []).push(result)
      return groups
    },
    {}
  )
  const sortedExamGroups = Object.values(examGroups).sort(
    (a, b) =>
      new Date(a[0].exam.date).getTime() - new Date(b[0].exam.date).getTime()
  )
  return (
    <section>
      <h3 className="mb-4 text-xl font-bold">Examination Results</h3>
      {sortedExamGroups.length ? (
        <div className="space-y-6">
          {sortedExamGroups.map((items) => {
            const exam = items[0].exam
            const total = items.reduce((sum, item) => sum + item.exam.total, 0)
            const obtained = items.reduce((sum, item) => sum + item.marks, 0)
            const percentage = total ? (obtained / total) * 100 : 0
            const passed = items.every(
              (item) => item.marks >= item.exam.minMarks
            )
            const examDate = new Date(exam.date)
            const groupKey = `${exam.type}-${examDate.getFullYear()}`
            return (
              <article
                key={groupKey}
                className="overflow-hidden rounded-lg border border-slate-200"
              >
                <header className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                  <h4 className="text-lg font-bold text-slate-800">
                    {termName(exam.type)}{" "}
                    <span className="font-medium text-slate-500">
                      ({examDate.getFullYear()})
                    </span>
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">
                    {examDate.toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </header>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white text-slate-700">
                      <tr>
                        <th className="px-4 py-3">Subject</th>
                        <th className="px-4 py-3">Max Marks</th>
                        <th className="px-4 py-3">Min Marks</th>
                        <th className="px-4 py-3">Marks Obtained</th>
                        <th className="px-4 py-3">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => {
                        const subjectPassed =
                          item.marks >= item.exam.minMarks
                        return (
                          <tr
                            key={item.id}
                            className="border-t border-slate-200"
                          >
                            <td className="px-4 py-3 font-medium">
                              {item.subject.name}
                            </td>
                            <td className="px-4 py-3">{item.exam.total}</td>
                            <td className="px-4 py-3">
                              {item.exam.minMarks}
                            </td>
                            <td className="px-4 py-3 font-semibold">
                              {item.marks}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded px-2 py-1 text-xs font-bold text-white ${subjectPassed ? "bg-lime-600" : "bg-red-500"}`}
                              >
                                {subjectPassed ? "Pass" : "Fail"}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <footer className="grid gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold sm:grid-cols-4">
                  <span>
                    Total Marks: {obtained}/{total}
                  </span>
                  <span>Percentage: {percentage.toFixed(2)}%</span>
                  <span>Grade: {grade(percentage)}</span>
                  <span>
                    Result:{" "}
                    <b className={passed ? "text-lime-700" : "text-red-600"}>
                      {passed ? "Pass" : "Fail"}
                    </b>
                  </span>
                </footer>
              </article>
            )
          })}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
          No examination results have been recorded.
        </p>
      )}
    </section>
  )
}

function AttendanceHistory({
  records,
}: {
  records: StudentOverview["attendances"]
}) {
  const year = records.length
    ? new Date(records[records.length - 1].date).getFullYear()
    : new Date().getFullYear()
  const monthStarts = Array.from(
    { length: 12 },
    (_, index) => new Date(year, index + 3, 1)
  )
  const attendance = new Map(
    records.map((record) => {
      const date = new Date(record.date)
      return [
        `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        record.status,
      ]
    })
  )
  const statusText = (status?: string) =>
    status === "PRESENT"
      ? "Present"
      : status === "ABSENT"
        ? "Absent"
        : status === "HALF_DAY"
          ? "Half Day"
          : ""
  const statusTone = (status?: string) =>
    status === "PRESENT"
      ? "text-emerald-700"
      : status === "ABSENT"
        ? "text-red-600"
        : "text-amber-700"
  const present = records.filter((item) => item.status === "PRESENT").length
  const absent = records.filter((item) => item.status === "ABSENT").length
  const halfDay = records.filter((item) => item.status === "HALF_DAY").length
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">Attendance</h3>
          <p className="mt-1 text-sm text-slate-500">
            Present, Absent, and Half Day records by month.
          </p>
        </div>
        <div className="flex gap-4 text-sm font-semibold">
          <span className="text-emerald-700">Present: {present}</span>
          <span className="text-red-600">Absent: {absent}</span>
          <span className="text-amber-700">Half Day: {halfDay}</span>
        </div>
      </div>
      <div className="overflow-x-auto border border-slate-200">
        <table className="w-full min-w-[1050px] text-center text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="sticky left-0 bg-slate-50 px-4 py-3 text-left">
                Date | Month
              </th>
              {monthStarts.map((month) => (
                <th key={month.toISOString()} className="px-4 py-3">
                  {month.toLocaleString(undefined, { month: "long" })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
              <tr key={day} className="border-t border-slate-200">
                <td className="sticky left-0 bg-white px-4 py-3 text-left font-medium">
                  {day}
                </td>
                {monthStarts.map((month) => {
                  const valid =
                    day <=
                    new Date(
                      month.getFullYear(),
                      month.getMonth() + 1,
                      0
                    ).getDate()
                  const status = valid
                    ? attendance.get(
                        `${month.getFullYear()}-${month.getMonth()}-${day}`
                      )
                    : undefined
                  return (
                    <td
                      key={month.toISOString()}
                      className={`px-3 py-3 font-semibold ${statusTone(status)}`}
                    >
                      {statusText(status)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-1 py-4">
      <span className="font-semibold text-slate-800">{label}</span>
      <span className="text-right text-blue-600">{value}</span>
    </div>
  )
}

function DetailCard({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200">
      <h3 className="bg-slate-50 px-5 py-4 text-xl font-bold text-slate-800">
        {title}
      </h3>
      <div className="px-5">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-1 gap-1 border-b border-slate-200 py-4 text-base last:border-0 sm:grid-cols-2 sm:gap-8"
          >
            <span className="text-slate-600">{label}</span>
            <span className="text-slate-600">{value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
