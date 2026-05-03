import { Hook } from "./hooks";
import { Program } from "./program";
import { Service } from "./service";

interface MakeConfig {
   programs: Array<Program>,
   hooks: Array<Hook>,
   services: Record<PropertyKey, Service>
}


export function make(config: MakeConfig) {






   return {
      install() { },
      static() { }
   }

}