import { Task } from "../models/task.js"
import { Role } from "../models/role.js"
import { personRepository } from "../repository/personRepository.js"
import { taskRepository } from "../repository/taskRepository.js"
import { gid, timestamp } from "../utilities/utilities.js"

/*
GET /task
*/
export const getAll = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   let { index, size } = request.query

   let tasks = await taskRepository.findAll(index, size)
   let count = await taskRepository.count()

   if (tasks) {
      tasks.forEach(task => task.completed = task.completed == 1)

      index = Number(index || 0)
      size = Number(size || PAGE_SIZE)
      index = (index < 0) ? 0 : index
      size = (size < 0 || size > PAGE_SIZE) ? PAGE_SIZE : size

      response.status(200).json({
         data: tasks,
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
POST /task
{
   "title": "Buy milk",
   "deadline": "2024-12-08T10:45:35.000Z",
   "completed": true,
   "personId": "1"
}
*/
export const save = async (request, response) => {
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

   if (typeof request.body.personId != "string") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   let person = await personRepository.findById(request.body.personId)
   let task = Task.from(request.body)

   if (person) {
      if (typeof task.title != "string" || task.title.trim() == "") {
         // 400 Bad Request
         return response.status(400).send({
            status: 400,
            message: "Bad Request"
         })
      }
   
      if (typeof task.completed != "boolean") {
         task.completed = false
      }
   
      task.id = gid()
      task.deadline = timestamp(task.deadline)

      let result = await taskRepository.save(task)

      if (result) {
         response.status(201).json(task)
      }
      else {
         // 500 Internal Server Error
         response.status(500).send({
            status: 500,
            message: "Internal Server Error"
         })
      }
   }
   else {
      response.status(204).send()
   }
}

/*
PUT /task
{
   "id" "2",
   "title": "Buy milk",
   "deadline": "2024-12-08T10:45:35.000Z",
   "completed": true
}
*/
export const update = async (request, response) => {
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

   if (typeof request.body.id != "string") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   let task = await taskRepository.findById(request.body.id)

   if (task) {
      if (typeof request.body.title == "string" && request.body.title.trim() != "") {
         task.title = request.body.title
      }

      if (typeof request.body.deadline == "string") {
         task.deadline = timestamp(request.body.deadline)
      }
   
      if (typeof request.body.completed == "boolean") {
         task.completed = request.body.completed
      }

      let result = await taskRepository.update(task)

      if (result) {
         task.completed = task.completed == 1
         response.status(200).json(task)
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
PATCH /task/title
{"id": "2", "title": "Buy milk"}
*/
export const patchTitle = async (request, response) => {
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

   if (typeof request.body.id != "string") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   let task = await taskRepository.findById(request.body.id)

   if (task) {
      if (typeof request.body.title == "string" && request.body.title.trim() != "") {
         task.title = request.body.title
      }

      let result = await taskRepository.updateTitle(task)

      if (result) {
         task.completed = task.completed == 1
         response.status(200).json(task)
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
PATCH /task/completed
{"id": "2", "completed": true}
*/
export const patchCompleted = async (request, response) => {
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

   if (typeof request.body.id != "string") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   let task = await taskRepository.findById(request.body.id)

   if (task) {
      if (typeof request.body.completed == "boolean") {
         task.completed = request.body.completed
      }

      let result = await taskRepository.updateCompleted(task)

      if (result) {
         task.completed = task.completed == 1
         response.status(200).json(task)
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
DELETE /task
{"id": "2"}
*/
export const remove = async (request, response) => {
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

   if (typeof request.body.id != "string") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   let task = await taskRepository.findById(request.body.id)

   if (task) {
      let result = await taskRepository.remove(task.id)

      if (result) {
         task.completed = task.completed == 1
         response.status(200).json(task)
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
GET /task/count
*/
export const getCount = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   let count = await taskRepository.count()

   if (count != undefined) {
      response.status(200).json({count})
   }
   else {
      response.status(204).send()
   }
}

/*
GET /task/2
*/
export const get = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   let task = await taskRepository.findById(request.params.id)

   if (task) {
      task.completed = task.completed == 1
      response.status(200).json(task)
   }
   else {
      response.status(204).send()
   }
}