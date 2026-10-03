const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, "")
const backendApiUrl = /\/api$/i.test(normalizedApiUrl)
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`

const hopByHopHeaders = [
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]

async function proxyToBackend(request: Request) {
  const incomingUrl = new URL(request.url)
  const backendPath = incomingUrl.pathname.replace(/^\/api(?=\/|$)/, "")
  const targetUrl = `${backendApiUrl}${backendPath}${incomingUrl.search}`
  const headers = new Headers(request.headers)

  for (const header of hopByHopHeaders) headers.delete(header)

  const method = request.method.toUpperCase()
  const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer()
  const upstream = await fetch(targetUrl, {
    method,
    headers,
    body,
    cache: "no-store",
    redirect: "manual",
  })
  const responseHeaders = new Headers(upstream.headers)

  for (const header of hopByHopHeaders) responseHeaders.delete(header)

  const responseBody = method === "HEAD" || [204, 205, 304].includes(upstream.status)
    ? null
    : upstream.body

  return new Response(responseBody, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}

export const GET = proxyToBackend
export const HEAD = proxyToBackend
export const POST = proxyToBackend
export const PUT = proxyToBackend
export const PATCH = proxyToBackend
export const DELETE = proxyToBackend
export const OPTIONS = proxyToBackend
