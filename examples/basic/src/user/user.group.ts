import { action, Group } from "@aromix/core";

export class UserGroup extends Group("user") {
  @action("test")
  test() {
    return this.res.reply({
      data: this.req,
      status: 200,
    });
  }
}
