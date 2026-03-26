import { action, group, request, response } from "@aromix/core";

@group("user")
export class UserGroup {
  @action("get")
  get() {
    const raw = request();

    return response.setHeader("x-power-by", "aromix").ok({
      data: "ok",
      raw,
    });
  }
}
