import { configureStore } from "@reduxjs/toolkit"

import authReducer from "@/services/auth/authSlice"
import { authApi } from "@/services/auth/authApi"
import studentDashboardReducer from "@/services/dashboard/dashboardSlice"
import resourceReducer from "@/services/resources/resourceSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    studentDashboard: studentDashboardReducer,
    resources: resourceReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
