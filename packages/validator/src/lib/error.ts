export interface ValidationIssue {
  code: string
  path: (string | number)[]
  message: string
}

export class ValidationError extends Error {
  readonly issues: ValidationIssue[]

  constructor(issues: ValidationIssue[]) {
    const message = issues.map(i => i.message).join('; ')
    super(message)
    this.name = 'ValidationError'
    this.issues = issues
  }
}
