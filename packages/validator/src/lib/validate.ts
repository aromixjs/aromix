import { AnySchema, Issue, SchemaState } from '../types'

/**
 *  Validator :: runs type checking and nested validation for a schema state.
 *  Returns all issues found rather than stopping at the first failure.
 */
export class Validator {
      constructor(private readonly state: SchemaState) {}

      run(value: unknown): Issue[] {
            const typeCheckPassed = this.checkType(value)

            if (!typeCheckPassed) {
                  return [this.buildTypeMismatchIssue(value)]
            }

            return this.collectNestedIssues(value)
      }

      // type guards
      private checkType(value: unknown): boolean {
            switch (this.state.type) {
                  case 'string':
                        return typeof value === 'string'
                  case 'number':
                        return typeof value === 'number' && !Number.isNaN(value)
                  case 'boolean':
                        return typeof value === 'boolean'
                  case 'bigint':
                        return typeof value === 'bigint'
                  case 'symbol':
                        return typeof value === 'symbol'
                  case 'null':
                        return value === null
                  case 'undefined':
                        return value === undefined
                  case 'unknown':
                        return true
                  case 'never':
                        return false
                  case 'date':
                        return value instanceof Date && !isNaN(value.getTime())
                  case 'object':
                        return this.isPlainObject(value)
                  case 'array':
                        return Array.isArray(value)
                  case 'tuple':
                        return Array.isArray(value)
                  case 'literal':
                        return true // exact match checked in collectNestedIssues
                  case 'record':
                        return this.isPlainObject(value)
                  case 'union':
                        return true // branch matching checked in collectNestedIssues
            }
      }

      // nested issue collection
      private collectNestedIssues(value: unknown): Issue[] {
            const issues: Issue[] = []

            switch (this.state.type) {
                  case 'literal': {
                        const expected = this.state.literal!.value
                        if (value !== expected) {
                              issues.push({
                                    path: [],
                                    code: 'invalid_literal',
                                    message: `Expected literal ${String(expected)}`,
                                    received: value,
                              })
                        }
                        break
                  }

                  case 'object': {
                        const obj = value as Record<string, unknown>
                        for (const [key, schema] of Object.entries(this.state.object!.shape)) {
                              const childIssues = this.collectFromChild(schema, obj[key], key)
                              issues.push(...childIssues)
                        }
                        break
                  }

                  case 'array': {
                        const arr = value as unknown[]
                        for (let index = 0; index < arr.length; index++) {
                              const childIssues = this.collectFromChild(this.state.array!.element, arr[index], index)
                              issues.push(...childIssues)
                        }
                        break
                  }

                  case 'tuple': {
                        const arr = value as unknown[]
                        const elements = this.state.tuple!.elements
                        for (let index = 0; index < elements.length; index++) {
                              const childIssues = this.collectFromChild(elements[index], arr[index], index)
                              issues.push(...childIssues)
                        }
                        break
                  }

                  case 'record': {
                        const obj = value as Record<string, unknown>
                        for (const [key, entry] of Object.entries(obj)) {
                              const childIssues = this.collectFromChild(this.state.record!.value, entry, key)
                              issues.push(...childIssues)
                        }
                        break
                  }

                  case 'union': {
                        const schemas = this.state.union!.schemas
                        const matched = schemas.some((schema) => schema.safeParse(value).ok)
                        if (!matched) {
                              issues.push({
                                    path: [],
                                    code: 'invalid_union',
                                    message: 'No branch matched',
                                    received: value,
                              })
                        }
                        break
                  }
            }

            return issues
      }

      private collectFromChild(schema: AnySchema, value: unknown, pathSegment: string | number): Issue[] {
            const result = schema.safeParse(value)

            if (result.ok) {
                  return []
            }

            return result.issues.map((issue) => ({
                  ...issue,
                  path: [pathSegment, ...issue.path],
            }))
      }

      private buildTypeMismatchIssue(value: unknown): Issue {
            const received = value === null ? 'null' : typeof value
            return {
                  path: [],
                  code: 'invalid_type',
                  message: `Expected ${this.state.type}, got ${received}`,
                  received: value,
            }
      }

      private isPlainObject(value: unknown): boolean {
            return typeof value === 'object' && value !== null && !Array.isArray(value)
      }
}
