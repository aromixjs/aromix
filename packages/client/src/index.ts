import { encode, decode } from "@msgpack/msgpack"

// --- Types ---

export interface ClientOptions {
  endpoint: string
  headers?: Record<string, string>
}

export interface DispatchOptions {
  payload?: unknown
  headers?: Record<string, string>
}

export interface Packet<TData = unknown, TError = unknown> {
  data:   TData  | null
  errors: TError | null
}

// --- Client ---

export function createClient(options: ClientOptions) {
  const { endpoint, headers: defaultHeaders = {} } = options

  async function dispatch<TData = unknown, TError = unknown>(
    action:  string,
    options: DispatchOptions = {}
  ): Promise<Packet<TData, TError>> {
    const { payload = {}, headers: callHeaders = {} } = options

    const res = await fetch(endpoint, {
      method:  "POST",
      headers: {
        "Content-Type": "application/msgpack",
        "X-Action":     action,
        ...defaultHeaders,
        ...callHeaders,    // per-call headers override defaults
      },
      body: encode(payload),
    })

    const buffer = await res.arrayBuffer()
    return decode(new Uint8Array(buffer)) as Packet<TData, TError>
  }

  return { dispatch }
}