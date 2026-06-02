import { State } from "./types";



export interface Issue {
   message: string
   received: unknown
}



export class Validator {

   constructor(private state: State) { }

   run(value: unknown): Issue[] {
      if (value === undefined && this.state.optional) return []
      if (value === null && this.state.nullable) return []


      if (!this.check(value)) {
         const message = `Expected ${this.state.type}, got ${value === null ? 'null' : typeof value}`
         return [{ message, received: value }]
      }

      return []
   }

   private check(value: unknown): boolean {
      switch (this.state.type) {
         case 'string': return typeof value === 'string'
         case 'number': return typeof value === 'number' && !Number.isNaN(value)
         case 'boolean': return typeof value === 'boolean'
         case 'bigint': return typeof value === 'bigint'
         case 'symbol': return typeof value === 'symbol'
         case 'null': return value === null
         case 'undefined': return value === undefined
         case 'unknown': return true
         case 'never': return false
      }
   }

}


export class ValidationError extends Error {
  constructor(public issues: Issue[]) {
    super(issues.map(i => i.message).join(', '))
    this.name = 'ValidationError'
  }
}