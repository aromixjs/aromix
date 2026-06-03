// Issue :: a single validation failure with its location and code

export type IssuePath = (string | number)[]

export type IssueCode = 'invalid_type' | 'invalid_literal' | 'invalid_union' | 'missing_key' | 'custom'

export interface Issue {
      path: IssuePath
      code: IssueCode
      message: string
      received: unknown
}
