//@ts-nocheck
import { action, Group, inject } from "@aromix/core"
import { UserService } from "./user/user.service"

export class UserGroup extends Group("user", [authGuard()]) {
  private userService = inject(UserService)
 
  @action("list")
  async list() {
    const users = this.userService.findAll()
    return this.res.ok(users)
  }

 
  @action("get")
  async get() {
    const { body } = await this.req.validate(getUserSchema)
    const user = this.userService.findById(body.id)
 
    if (!user) return this.res.notFound("User not found")
 
    return this.res.ok(user)
  }
 
  @action("create", [adminOnly()])
  async create() {
    const { body } = await this.req.validate(createUserSchema)
    const existing = this.userService.findByEmail(body.email)
 
    if (existing) return this.res.conflict("Email already in use")
 
    const user = this.userService.create(body)
    return this.res.created(user)
  }
 
  @action("update", [adminOnly()])
  async update() {
    const { body } = await this.req.validate(updateUserSchema)
    const user = this.userService.update(body.id, body)
 
    if (!user) return this.res.notFound("User not found")
 
    return this.res.ok(user)
  }
 
  @action("delete", [adminOnly()])
  async delete() {
    const { body } = await this.req.validate(deleteUserSchema)
    const deleted = this.userService.delete(body.id)
 
    if (!deleted) return this.res.notFound("User not found")
 
    return this.res.noContent()
  }
}