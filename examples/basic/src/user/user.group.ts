import { group, action, inject, match, input, output } from "@aromix/core";
import { UserService } from "./user.service";
import { userGetInput } from "./user.schema";

@group("user")
export class UserGroup {
  private userService = inject(UserService);

  @action("get")
  async get() {
    const { body } = await input.validate(userGetInput);
    const user = this.userService.findById(body.id);

    return output("OK", {
      test: 200,
      user,
    });
  }
}
