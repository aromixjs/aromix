import { Issue } from '../types'

/**
 * ValidationError :: thrown by schema.parse() when issues are found.
 * Use schema.safeParse() to receive issues without a thrown error.
 */
export class ValidationError extends Error {
      constructor(public readonly issues: Issue[]) {
            const lines = issues.map((issue) => {
                  const prefix = issue.path.length > 0 ? issue.path.join('.') + ': ' : ''
                  return prefix + issue.message
            })
            super(lines.join('\n'))
            this.name = 'ValidationError'
      }
}
