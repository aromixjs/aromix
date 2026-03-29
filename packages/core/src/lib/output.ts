export type SuccessCode =
  | "OK"
  | "CREATED"
  | "ACCEPTED"
  | "NO_CONTENT"

export type FailCode =
  | "BAD_INPUT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL"
  | "UNAVAILABLE"

export type OutputCode = SuccessCode | FailCode


export type Output<T = unknown, E = unknown> =
  | {
      ok:    true
      code:  SuccessCode
      data:  T
      error: null
    }
  | {
      ok:    false
      code:  FailCode
      data:  null
      error: E
    }

export function output<T>(code: SuccessCode, data: T): Output<T, never>
export function output<E>(code: FailCode, error: E): Output<never, E>
export function output<T, E>(
  code: OutputCode,
  payload: T | E
): Output<T, E> {
  if (isSuccessCode(code)) {
    return { ok: true,  code, data: payload as T, error: null }
  }
  return   { ok: false, code, data: null, error: payload as E }
}

function isSuccessCode(code: OutputCode): code is SuccessCode {
  return ["OK", "CREATED", "ACCEPTED", "NO_CONTENT"].includes(code)
}