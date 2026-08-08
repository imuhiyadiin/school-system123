"use client"

import { Provider } from "react-redux"

import { store } from "@/lib/store"
import AuthSession from "./auth-session"

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}><AuthSession>{children}</AuthSession></Provider>
}
