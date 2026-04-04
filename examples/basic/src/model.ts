import { provide } from "@aromix/core";
import { Model } from "@aromix/mongo";

@provide()
export class UserModel extends Model {
  schema() {
    this.defineDocument("user", (fb) => {
      fb.boolean("date").notNullable();
      fb.string("title").notNullable();
    });
  }
}
