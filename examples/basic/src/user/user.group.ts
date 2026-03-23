import { action, group, inject } from "@aromix/core";
import { UserService } from "./user.service";
import { requestStorage } from "@aromix/node";
@group("user")
export class UserGroup {
  private userService = inject(UserService);

  @action("get")
  get() {
    const ctx = requestStorage.getStore();

    return ctx?.send({
      status: 200,
      data: {
        user: "istiuak",
        age: 19,
      },
    });
  }

  @action("create")
  create() {}
}
