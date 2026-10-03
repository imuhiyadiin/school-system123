import type { NextConfig } from "next"

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
const backendOrigin = configuredApiUrl
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "")

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
