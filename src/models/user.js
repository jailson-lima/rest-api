import { Role } from "./role.js"

export class User {
   constructor(id, username, password, role, name, email, phone, birthdate, createdAt, active = true) {
      this.id = id || ""
      this.username = username || ""
      this.password = password || ""
      this.role = role || Role.MEMBER
      this.name = name || ""
      this.email = email || ""
      this.phone = phone || ""
      this.birthdate = birthdate || ""
      this.createdAt = createdAt || ""
      this.active = active
   }

   static from(user) {
      return new User(
         user.id,
         user.username,
         user.password,
         user.role,
         user.name,
         user.email,
         user.phone,
         user.birthdate,
         user.createdAt,
         user.active
      )
   }
}