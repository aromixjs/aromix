import { action, group } from "@aromix/core";

@group("#")
export class SystemsGroup {
  @action("catchAll")
  catchAll() {}
}
