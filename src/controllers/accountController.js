import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { Role } from "../models/role.js"
import { User } from "../models/user.js"
import { userRepository } from "../repository/userRepository.js"
import { gid, timestamp } from "../utilities/utilities.js"

let refreshTokens = []

/*
POST /account/signup
{
   "username": "alice",
   "password": "123",
   "role": "super",
   "name": "Alice",
   "email": "alice@email.com",
   "phone": "+55 83 999998888",
   "birthdate": "2014-12-08T10:45:35.000Z"
}
*/
export const signup = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   let users = await userRepository.findAll() || []
   let user = User.from(request.body)

   if (typeof user.username != "string" || user.username.trim() == "") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   if (typeof user.password != "string" || user.password.trim() == "") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   if (typeof user.name != "string" || user.name.trim() == "") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   if (typeof user.email != "string" || user.email.trim() == "") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   if (typeof user.phone != "string") {
      user.phone = ""
   }

   if (user.role == Role.SUPER) {
      for (let i = 0; i < users.length; i++) {
         if (users[i].role == Role.SUPER) {
            return response.status(204).send()
         }
      }
   }

   if (!Object.values(Role).includes(user.role)) {
      user.role = Role.MEMBER
   }

   for (let i = 0; i < users.length; i++) {
      if (users[i].username == user.username) {
         return response.status(204).send()
      }
   }

   user.id = gid()
   user.createdAt = timestamp()
   user.birthdate = timestamp(user.birthdate)
   const hash = await bcrypt.hash(user.password, 10)
   user.password = hash

   let result = await userRepository.save(user)

   if (result) {
      user.password = ""
      response.status(201).json(user)
   }
   else {
      // 500 Internal Server Error
      response.status(500).send({
         status: 500,
         message: "Internal Server Error"
      })
   }
}

/*
POST /account/signin
{"username": "alice", "password": "123"}
*/
export const signin = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   if (typeof request.body.username != "string" || typeof request.body.password != "string") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   // Read username and password from request body.
   const { username, password } = request.body

   let user = await userRepository.find(username)

   if (user && user.active) {
      const checked = await bcrypt.compare(password, user.password)

      if (checked) {
         // Generate an access token.
         const accessToken = jwt.sign({username: user.username, role: user.role, sub: user.id}, SECRET_KEY, {expiresIn: EXPIRES_IN})
         const refreshToken = jwt.sign({username: user.username, role: user.role, sub: user.id}, REFRESH_SECRET_KEY)
         refreshTokens.push(refreshToken)

         response.status(200).json({accessToken, refreshToken})
      }
      else {
         response.status(204).send()
      }
   }
   else {
      response.status(204).send()
   }
}

/*
POST /account/signout
{"token": ""} // token == refreshToken
*/
export const signout = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   const { token } = request.body

   if (typeof token != "string") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   refreshTokens = refreshTokens.filter(refreshToken => refreshToken != token)
   response.status(200).json({token})
}

/*
POST /account/token
{"token": ""} // token == refreshToken
*/
export const token = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   const { token } = request.body

   if (typeof token != "string") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   if (!token) {
      // 401 Unauthorized
      return response.status(401).send({
         status: 401,
         message: "Unauthorized"
      })
   }

   if (!refreshTokens.includes(token)) {
      // 403 Forbidden
      return response.status(403).send({
         status: 403,
         message: "Forbidden"
      })
   }

   jwt.verify(token, REFRESH_SECRET_KEY, (error, user) => {
      if (error) {
         // 403 Forbidden
         return response.status(403).send({
            status: 403,
            message: "Forbidden"
         })
      }

      const accessToken = jwt.sign({username: user.username, role: user.role, sub: user.id}, SECRET_KEY, {expiresIn: EXPIRES_IN})
      response.status(200).json({accessToken})
   })
}

/*
PUT /account/update
{
   "id": "1",
   "username": "alice",
   "password": "123",
   "role": "super",
   "name": "Alice",
   "email": "alice@email.com",
   "phone": "+55 83 999998888",
   "birthdate": "2014-12-08T10:45:35.000Z"
}
*/
export const update = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   if (typeof request.body.id != "string") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   const { sub, role } = request.user

   let user = await userRepository.findById(request.body.id)

   if (user) {
      if (typeof request.body.username == "string" && request.body.username.trim() != "") {
         user.username = request.body.username
      }

      if (typeof request.body.password == "string" && request.body.password.trim() != "") {
         const hash = await bcrypt.hash(request.body.password, 10)
         user.password = hash
      }

      if (typeof request.body.name == "string" && request.body.name.trim() != "") {
         user.name = request.body.name
      }

      if (typeof request.body.email == "string" && request.body.email.trim() != "") {
         user.email = request.body.email
      }

      if (typeof request.body.phone == "string") {
         user.phone = request.body.phone
      }

      if (typeof request.body.birthdate == "string") {
         user.birthdate = timestamp(request.body.birthdate)
      }

      if (!Object.values(Role).includes(request.body.role)) {
         request.body.role = user.role
      }

      if (typeof request.body.active != "boolean") {
         request.body.active = user.active
      }

      switch (role) {
         case Role.SUPER:
            if (user.id == sub) {
               user.role = request.body.role
            }
            else {
               user.role = (request.body.role != Role.SUPER) ? request.body.role : user.role
               user.active = request.body.active
            }
            break

         case Role.ADMIN:
            if (user.id == sub || user.role == Role.MEMBER) {
               user.role = (request.body.role != Role.SUPER) ? request.body.role : user.role
               user.active = request.body.active
            }
            else {
               return response.status(204).send()
            }
            break
         
         case Role.MEMBER:
            if (user.id == sub) {
               user.active = request.body.active
            }
            else {
               return response.status(204).send()
            }
            break
      }

      let result = await userRepository.update(user)

      if (result) {
         user.password = ""
         user.active = user.active == 1
         response.status(200).json(user)
      }
      else {
         response.status(204).send()
      }
   }
   else {
      response.status(204).send()
   }
}

/*
PATCH /account/active
{"id": "1", "active": true}
*/
export const patchActive = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   if (typeof request.body.id != "string") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   const { sub, role } = request.user
   const { id } = request.body

   let user = await userRepository.findById(id)

   if (user) {
      if (typeof request.body.active != "boolean") {
         request.body.active = user.active
      }

      switch (role) {
         case Role.SUPER:
            if (user.id != sub) {
               user.active = request.body.active
            }
            else {
               return response.status(204).send()
            }
            break

         case Role.ADMIN:
            if (user.id == sub || user.role == Role.MEMBER) {
               user.active = request.body.active
            }
            else {
               return response.status(204).send()
            }
            break
         
         case Role.MEMBER:
            if (user.id == sub) {
               user.active = request.body.active
            }
            else {
               return response.status(204).send()
            }
            break
      }

      let result = await userRepository.updateActive(user)

      if (result) {
         user.password = ""
         user.active = user.active == 1
         response.status(200).json(user)
      }
      else {
         response.status(204).send()
      }
   }
   else {
      response.status(204).send()
   }
}

/*
DELETE /account/remove
{"id": "1"}
*/
export const remove = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   if (typeof request.body.id != "string") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   const { sub, role } = request.user
   const { id } = request.body

   let user = await userRepository.findById(id)

   if (user) {
      let result = false

      switch (role) {
         case Role.SUPER:
            result = await userRepository.remove(user.id)
            break

         case Role.ADMIN:
            if (user.id == sub || user.role == Role.MEMBER) {
               result = await userRepository.remove(user.id)
            }
            else {
               return response.status(204).send()
            }
            break

         case Role.MEMBER:
            if (user.id == sub) {
               result = await userRepository.remove(user.id)
            }
            else {
               return response.status(204).send()
            }
            break
      }

      if (result) {
         user.password = ""
         user.active = user.active == 1
         response.status(200).json(user)
      }
      else {
         response.status(204).send()
      }
   }
   else {
      response.status(204).send()
   }
}

/*
GET /account/user
*/
export const getAll = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   const { role } = request.user

   if (role == Role.MEMBER) {
      // 403 Forbidden
      return response.status(403).send({
         status: 403,
         message: "Forbidden"
      })
   }

   let { index, size } = request.query

   let users = await userRepository.findAll(index, size)
   let count = await userRepository.count()
   
   if (users) {
      users = users.map(user => {
         user.password = ""
         user.active = user.active == 1
         return user
      })

      index = Number(index || 0)
      size = Number(size || PAGE_SIZE)
      index = (index < 0) ? 0 : index
      size = (size < 0 || size > PAGE_SIZE) ? PAGE_SIZE : size

      response.status(200).json({
         data: users,
         index,
         size,
         count
      })
   }
   else {
      response.status(204).send()
   }
}

/*
GET /account/user/count
*/
export const getCount = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   const { role } = request.user

   if (role == Role.MEMBER) {
      // 403 Forbidden
      return response.status(403).send({
         status: 403,
         message: "Forbidden"
      })
   }

   let count = await userRepository.count()

   if (count != undefined) {
      response.status(200).json({count})
   }
   else {
      response.status(204).send()
   }
}

/*
GET /account/user/1
*/
export const get = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   const { role } = request.user

   if (role == Role.MEMBER) {
      // 403 Forbidden
      return response.status(403).send({
         status: 403,
         message: "Forbidden"
      })
   }

   let user = await userRepository.findById(request.params.id)

   if (user) {
      user.password = ""
      user.active = user.active == 1
      response.status(200).json(user)
   }
   else {
      response.status(204).send()
   }
}