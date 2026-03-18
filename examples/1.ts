import { action, namespace } from "../core";

@namespace("test")
export class Test {
  @action("demo")
  data() {}
}

console.log(Test);

const ins = new Test();
console.log(ins);

console.log(namespace.getMeta(ins));

await new Promise((r) => setTimeout(r, 999999));
