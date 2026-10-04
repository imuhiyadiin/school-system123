import { Geist_Mono, Inter, Ranchers } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import Header from "./sections/Header";
import Footer from "./sections/Footer";
import ReduxProvider from "./redux-provider"
import { Toaster } from "sonner"
import type { Metadata, Viewport } from "next"
import PwaRegister from "./pwa-register"
import PwaInstall from "./pwa-install"

export const metadata: Metadata = {
  applicationName: "Creative Readers",
  title: "Creative Readers | School Management",
  description: "Creative Readers school management system",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Creative Readers",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8fafc",
}

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const ranchers = Ranchers({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-ranchers",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable, ranchers.variable)}
    >
      <body>
        <ThemeProvider>
          <ReduxProvider>
            <PwaRegister />
            <PwaInstall />
            <Header />
            {children}
            <Footer />
            <Toaster richColors position="top-right" />
          </ReduxProvider>
          </ThemeProvider>
      </body>
    </html>
  )
}
