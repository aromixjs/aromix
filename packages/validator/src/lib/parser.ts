import { ValidationError } from './error'
import type { ParseResult, SchemaState } from './types'

export class Parser<Output> {
      state!: SchemaState

      parse(value: unknown): Output {
            let current = value
            if (current === undefined) {
                  if (this.state.default) {
                        current = this.state.default.value
                  } else if (this.state.defaultFn) {
                        current = this.state.defaultFn.fn()
                  }
            }
            const checked = this.checkType(current, [])
            if (this.state.operators) {
                  let result = checked
                  for (const op of this.state.operators) {
                        try {
                              result = op.run(result)
                        } catch (e) {
                              const msg = e instanceof Error ? e.message : String(e)
                              throw new ValidationError([{ code: 'custom', path: [], message: msg }])
                        }
                  }
                  return result as Output
            }
            return checked as Output
      }

      safeParse(value: unknown): ParseResult<Output> {
            try {
                  const result = this.parse(value)
                  return { success: true as const, data: result, errors: null }
            } catch (e) {
                  const err = e as ValidationError
                  const messages = err.issues?.length ? err.issues.map((i) => i.message) : [e instanceof Error ? e.message : String(e)]
                  return { success: false as const, data: null, errors: messages }
            }
      }

      private checkType(value: unknown, path: (string | number)[]): unknown {
            switch (this.state.type) {
                  case 'string': {
                        if (typeof value !== 'string') {
                              throw this.makeError({ code: 'invalidType', path, expected: 'string', received: typeof value })
                        }
                        return value
                  }
                  case 'number': {
                        if (typeof value !== 'number') {
                              throw this.makeError({ code: 'invalidType', path, expected: 'number', received: typeof value })
                        }
                        return value
                  }
                  case 'boolean': {
                        if (typeof value !== 'boolean') {
                              throw this.makeError({ code: 'invalidType', path, expected: 'boolean', received: typeof value })
                        }
                        return value
                  }
                  case 'bigint': {
                        if (typeof value !== 'bigint') {
                              throw this.makeError({ code: 'invalidType', path, expected: 'bigint', received: typeof value })
                        }
                        return value
                  }
                  case 'symbol': {
                        if (typeof value !== 'symbol') {
                              throw this.makeError({ code: 'invalidType', path, expected: 'symbol', received: typeof value })
                        }
                        return value
                  }
                  case 'null': {
                        if (value !== null) {
                              throw this.makeError({ code: 'invalidType', path, expected: 'null', received: value === null ? 'null' : typeof value })
                        }
                        return value
                  }
                  case 'undefined': {
                        if (value !== undefined) {
                              throw this.makeError({ code: 'invalidType', path, expected: 'undefined', received: typeof value })
                        }
                        return value
                  }
                  case 'unknown': {
                        return value
                  }
                  case 'never': {
                        throw this.makeError({ code: 'invalidType', path, expected: 'never', received: typeof value })
                  }
                  case 'literal': {
                        if (value !== this.state.literal!.value) {
                              const expected = JSON.stringify(this.state.literal!.value)
                              const received = JSON.stringify(value)
                              throw new ValidationError([{ code: 'invalidLiteral', path, message: `Expected ${expected}, received ${received}` }])
                        }
                        return value
                  }
                  case 'object': {
                        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                              const desc = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
                              throw this.makeError({ code: 'invalidType', path, expected: 'object', received: desc })
                        }
                        const shape = this.state.object!.shape
                        const result: Record<string, unknown> = {}
                        for (const key of Object.keys(shape)) {
                              result[key] = shape[key].parse((value as Record<string, unknown>)[key])
                        }
                        return result
                  }
                  case 'array': {
                        if (!Array.isArray(value)) {
                              throw this.makeError({ code: 'invalidType', path, expected: 'array', received: typeof value })
                        }
                        return value.map((item, i) => this.state.array!.element.parse(item))
                  }
                  case 'tuple': {
                        if (!Array.isArray(value)) {
                              throw this.makeError({ code: 'invalidType', path, expected: 'tuple', received: typeof value })
                        }
                        const elements = this.state.tuple!.elements
                        if (value.length !== elements.length) {
                              throw this.makeError({ code: 'invalidType', path, expected: `tuple(${elements.length})`, received: `array(${value.length})` })
                        }
                        return elements.map((el, i) => el.parse(value[i]))
                  }
                  case 'record': {
                        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                              const desc = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
                              throw this.makeError({ code: 'invalidType', path, expected: 'record', received: desc })
                        }
                        const valSchema = this.state.record!.value
                        const result: Record<string, unknown> = {}
                        for (const key of Object.keys(value as Record<string, unknown>)) {
                              result[key] = valSchema.parse((value as Record<string, unknown>)[key])
                        }
                        return result
                  }
                  case 'instance': {
                        if (typeof value !== 'object' || value === null) {
                              throw this.makeError({ code: 'invalidType', path, expected: 'instance', received: value === null ? 'null' : typeof value })
                        }
                        const cls = this.state.instance!.class
                        if (!(value instanceof cls)) {
                              throw this.makeError({ code: 'invalidType', path, expected: cls.name, received: value.constructor?.name ?? typeof value })
                        }
                        return value
                  }
                  case 'union': {
                        const schemas = this.state.union!.schemas
                        for (const schema of schemas) {
                              try {
                                    return schema.parse(value)
                              } catch {
                                    // try next
                              }
                        }
                        throw this.makeError({ code: 'invalidType', path, expected: `union(${schemas.length})`, received: typeof value })
                  }
            }
      }

      private makeError(opts: { code: string; path: (string | number)[]; expected: string; received: string }): ValidationError {
            const p = opts.path.length ? ` at '${opts.path.join('.')}'` : ''
            return new ValidationError([{ code: opts.code, path: opts.path, message: `Expected ${opts.expected}, received ${opts.received}${p}` }])
      }
}
