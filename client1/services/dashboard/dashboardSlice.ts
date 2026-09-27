import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { AxiosError } from "axios"

import { apiClient } from "@/services/api/client"

export type StudentProfile = {
  id: string
  fullName: string
  gender: string
  phone?: string | null
  userId: string
  user: { id: string; email: string; username: string }
  classrooms: { classroom: { id: string; name: string; section: string; grade: number } }[]
}
export type Attendance = { id: string; studentId: string; date: string; status: boolean }
export type Result = { id: string; studentId: string; subjectId: string; examId: string; marks: number }
export type Exam = { id: string; name: string; date: string; type: "QUIZ" | "MONTHLY" | "MIDTERM" | "THIRD" | "FINAL" }
export type Subject = { id: string; name: string; grade: number; description?: string | null }
export type Timetable = { id: string; classroomId: string; day: string; time: string; subject: string }
export type Issue = { id: string; studentId: string; type: string; details: string; isResolved: boolean }
export type AdminDashboardStats = { users: number; students: number; teachers: number; classrooms: number; subjects: number; exams: number; results: number; attendance: number; issues: number; timetable: number; buses: number; studentsWithBus: number; totalFees: number; totalBasicSalary: number; recentResults: Result[]; recentAttendance: Attendance[]; recentIssues: Issue[] }

type DashboardState = {
  profile: StudentProfile | null
  attendance: Attendance[]
  results: Result[]
  exams: Exam[]
  subjects: Subject[]
  timetable: Timetable[]
  notices: Issue[]
  adminStats: AdminDashboardStats | null
  isLoading: boolean
  error: string | null
  loadedForUserId: string | null
}

const initialState: DashboardState = { profile: null, attendance: [], results: [], exams: [], subjects: [], timetable: [], notices: [], adminStats: null, isLoading: false, error: null, loadedForUserId: null }

const messageFromError = (error: unknown) => {
  const axiosError = error as AxiosError<{ message?: string }>
  if (!axiosError.response) return "Network error. Please check your connection and try again."
  if (axiosError.response.status === 403) return "Forbidden: you do not have access to this data."
  if (axiosError.response.status >= 500) return "Internal server error. Please try again later."
  return axiosError.response.data?.message ?? "Unable to load dashboard data."
}

export const loadStudentDashboard = createAsyncThunk("studentDashboard/load", async (userId: string, { rejectWithValue }) => {
  try {
    const profileResponse = await apiClient.get<{ student: StudentProfile }>(`/student/${userId}`)
    const profile = profileResponse.data.student
    const studentId = profile.id
    const classId = profile.classrooms[0]?.classroom.id
    const [attendance, results, exams, subjects, timetable, notices] = await Promise.all([
      apiClient.get<Attendance[]>(`/attendance/student/${studentId}`),
      apiClient.get<Result[]>(`/result/student/${studentId}`),
      apiClient.get<{ result: Exam[] }>("/exam"),
      apiClient.get<{ result: Subject[] }>("/subject"),
      apiClient.get<Timetable[]>("/timetable"),
      apiClient.get<Issue[]>("/issue"),
    ])
    return {
      profile,
      attendance: attendance.data,
      results: results.data,
      exams: exams.data.result,
      subjects: subjects.data.result.filter((subject) => subject.grade === profile.classrooms[0]?.classroom.grade),
      timetable: timetable.data.filter((item) => item.classroomId === classId),
      notices: notices.data.filter((item) => item.studentId === studentId),
      userId,
    }
  } catch (error) {
    return rejectWithValue(messageFromError(error))
  }
})

export const loadAdminDashboard = createAsyncThunk("studentDashboard/loadAdmin", async (userId: string, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<AdminDashboardStats>("/dashboard")
    return { adminStats: response.data, userId }
  } catch (error) {
    return rejectWithValue(messageFromError(error))
  }
})

export const loadTeacherDashboard = createAsyncThunk("studentDashboard/loadTeacher", async (userId: string, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<{ results: Result[] }>("/result")
    return { results: response.data.results, userId }
  } catch (error) {
    return rejectWithValue(messageFromError(error))
  }
})

const dashboardSlice = createSlice({
  name: "studentDashboard",
  initialState,
  reducers: { clearStudentDashboard: () => initialState },
  extraReducers: (builder) => {
    builder
      .addCase(loadStudentDashboard.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(loadStudentDashboard.fulfilled, (state, { payload }) => { Object.assign(state, payload, { isLoading: false, error: null, loadedForUserId: payload.userId }) })
      .addCase(loadStudentDashboard.rejected, (state, { payload }) => { state.isLoading = false; state.error = (payload as string) ?? "Unable to load dashboard data." })
      .addCase(loadAdminDashboard.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(loadAdminDashboard.fulfilled, (state, { payload }) => { state.adminStats = payload.adminStats; state.results = payload.adminStats.recentResults; state.attendance = payload.adminStats.recentAttendance; state.notices = payload.adminStats.recentIssues; state.loadedForUserId = payload.userId; state.isLoading = false })
      .addCase(loadAdminDashboard.rejected, (state, { payload }) => { state.isLoading = false; state.error = (payload as string) ?? "Unable to load dashboard data." })
      .addCase(loadTeacherDashboard.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(loadTeacherDashboard.fulfilled, (state, { payload }) => { state.results = payload.results; state.loadedForUserId = payload.userId; state.isLoading = false; state.error = null })
      .addCase(loadTeacherDashboard.rejected, (state, { payload }) => { state.isLoading = false; state.error = (payload as string) ?? "Unable to load dashboard data." })
  },
})

export const { clearStudentDashboard } = dashboardSlice.actions
export default dashboardSlice.reducer
