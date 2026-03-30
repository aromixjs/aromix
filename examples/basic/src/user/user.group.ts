import { action, group, inject, receive, send } from "@aromix/core";
import { userGetInput } from "./user.schema";
import { UserService } from "./user.service";

@group("user")
export class UserGroup {
  private userService = inject(UserService);

  @action("get")
  async get() {
    const { payload } = await receive.validate(userGetInput);
    const user = this.userService.findById(payload.id);

    return send({
      data: {
        test: 200,
        user,
      },
    });
  }
}
