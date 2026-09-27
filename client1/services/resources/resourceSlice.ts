import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiClient } from "@/services/api/client"

export type ResourceName = "subject" | "exam"
export type ResourceRecord = { id: string; name: string; grade?: number; description?: string | null; date?: string; type?: "QUIZ" | "MONTHLY" | "MIDTERM" | "THIRD" | "FINAL" }
type State = { items: ResourceRecord[]; loading: boolean; saving: boolean; error: string | null }
const initialState: State = { items: [], loading: false, saving: false, error: null }

const endpoint = (resource: ResourceName) => `/${resource}`
const unpack = (resource: ResourceName, data: unknown): ResourceRecord[] => {
  if (resource === "subject" || resource === "exam") return ((data as { result?: ResourceRecord[] }).result ?? [])
  return []
}

export const fetchResources = createAsyncThunk("resources/fetch", async (resource: ResourceName) => {
  const { data } = await apiClient.get(endpoint(resource))
  return unpack(resource, data)
})
export const createResource = createAsyncThunk("resources/create", async ({ resource, data }: { resource: ResourceName; data: Omit<ResourceRecord, "id"> }) => {
  await apiClient.post(endpoint(resource), data)
  return resource
})
export const updateResource = createAsyncThunk("resources/update", async ({ resource, id, data }: { resource: ResourceName; id: string; data: Partial<ResourceRecord> }) => {
  await apiClient.patch(`${endpoint(resource)}/${id}`, data)
  return resource
})
export const deleteResource = createAsyncThunk("resources/delete", async ({ resource, id }: { resource: ResourceName; id: string }) => {
  await apiClient.delete(`${endpoint(resource)}/${id}`)
  return { resource, id }
})

const resourceSlice = createSlice({
  name: "resources", initialState, reducers: {},
  extraReducers: (builder) => builder
    .addCase(fetchResources.pending, (state) => { state.loading = true; state.error = null })
    .addCase(fetchResources.fulfilled, (state, action) => { state.loading = false; state.items = action.payload })
    .addCase(fetchResources.rejected, (state) => { state.loading = false; state.error = "Unable to load records." })
    .addMatcher((action) => action.type.startsWith("resources/") && (action.type.endsWith("/pending")) && !action.type.includes("/fetch/"), (state) => { state.saving = true; state.error = null })
    .addMatcher((action) => action.type.startsWith("resources/") && (action.type.endsWith("/fulfilled") || action.type.endsWith("/rejected")) && !action.type.includes("/fetch/"), (state) => { state.saving = false }),
})
export default resourceSlice.reducer
