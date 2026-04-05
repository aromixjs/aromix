import { inject } from "@aromix/core";
import { DatabaseService } from "../services/db";

export class UserHandler {
  private db = inject(DatabaseService);

  async createUser(body: { id: string; name: string; email: string }) {
    const { id, name, email } = body;
    await this.db.save(id, { name, email, createdAt: new Date() });
    return { status: 201, data: { status: "created", id } };
  }

  async getUser(id: string) {
    const user = await this.db.find(id);
    if (!user) return { status: 404, data: { error: "not_found" } };
    return { status: 200, data: user };
  }
}
