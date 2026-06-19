import { BlobOperatorRecord, IntOperatorRecord, RealOperatorRecord, TextOperatorRecord } from "./operators";

export interface BuilderInput {
   Text: TextOperatorRecord
   Int: IntOperatorRecord
   Real: RealOperatorRecord
   Blob: BlobOperatorRecord
}


export class Builder {
   constructor(operators: BuilderInput) { }
   text() {
      // need to wire those operators as a chain here
   }
   int() { }
   real() { }
   blob() { }
}
