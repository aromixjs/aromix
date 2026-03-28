import { provide, result } from "@aromix/core";

@provide()
export class UserService {
  private users = [
    { id: "1", name: "Alice", email: "alice@example.com" },
    { id: "2", name: "Bob", email: "bob@example.com" },
  ];

  findById(id: string) {
    const user = this.users.find((u) => u.id === id);
    if (!user) return result.fail("not_found" as const);
    return result.pass(user);
  }

  findAll() {
    return result.pass(this.users);
  }
}
