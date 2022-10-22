import { Person } from "../models/person.js"
import { Address } from "../models/address.js"
import { Task } from "../models/task.js"
import { Role } from "../models/role.js"
import { personRepository } from "../repository/personRepository.js"
import { addressRepository } from "../repository/addressRepository.js"
import { taskRepository } from "../repository/taskRepository.js"
import { gid, timestamp } from "../utilities/utilities.js"

/*
GET /person
*/
export const getAll = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   let { index, size } = request.query

   let persons = await personRepository.findAll(index, size)
   let count = await personRepository.count()

   if (persons) {
      persons.forEach(person => {
         person.tasks = person.tasks.map(task => {
            task.completed = task.completed == 1
            return task
         })
      })

      index = Number(index || 0)
      size = Number(size || PAGE_SIZE)
      index = (index < 0) ? 0 : index
      size = (size < 0 || size > PAGE_SIZE) ? PAGE_SIZE : size

      response.status(200).json({
         data: persons,
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
POST /person
{
   "name": "Alice",
   "email": "alice@email.com",
   "phone": "+55 83 999998888",
   "birthdate": "2004-12-08T10:45:35.000Z",
   "address": {
      "street": "",
      "number": "",
      "district": "",
      "city": "",
      "state": "",
      "country": "",
      "complement": "",
      "zipCode": ""
   },
   "tasks": [
      {
         "title": "Buy milk",
         "deadline": "2024-12-08T10:45:35.000Z",
         "completed": true
      },
      {
         "title": "Workout",
         "deadline": "2024-12-08T10:45:35.000Z",
         "completed": false
      },
      {
         "title": "Studying",
         "deadline": "2024-12-08T10:45:35.000Z",
         "completed": true
      }
   ]
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

   // Check person.

   let person = Person.from(request.body)

   if (typeof person.name != "string" || person.name.trim() == "") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   if (typeof person.email != "string") {
      person.email = ""
   }

   if (typeof person.phone != "string") {
      person.phone = ""
   }

   person.id = gid()
   person.createdAt = timestamp()
   person.birthdate = timestamp(person.birthdate)

   // Check address.

   if (person.address instanceof Object) {
      person.address = Address.from(person.address)
      if (typeof person.address.street != "string") { person.address.street = "" }
      if (typeof person.address.number != "string") { person.address.number = "" }
      if (typeof person.address.district != "string") { person.address.district = "" }
      if (typeof person.address.city != "string") { person.address.city = "" }
      if (typeof person.address.state != "string") { person.address.state = "" }
      if (typeof person.address.country != "string") { person.address.country = "" }
      if (typeof person.address.complement != "string") { person.address.complement = "" }
      if (typeof person.address.zipCode != "string") { person.address.zipCode = "" }
   }
   else {
      person.address = Address.from({})
   }

   person.address.id = gid()
   person.address.personId = person.id

   // Check tasks.

   if (!(person.tasks instanceof Array)) {
      person.tasks = []
   }

   for (let i = 0; i < person.tasks.length; i++) {
      if (person.tasks[i] instanceof Object) {
         person.tasks[i] = Task.from(person.tasks[i])
      }
      else {
         person.tasks[i] = Task.from({})
      }

      if (typeof person.tasks[i].title != "string" || person.tasks[i].title.trim() == "") {
         // 400 Bad Request
         return response.status(400).send({
            status: 400,
            message: "Bad Request"
         })
      }
   
      if (typeof person.tasks[i].completed != "boolean") {
         person.tasks[i].completed = false
      }
   
      person.tasks[i].id = gid()
      person.tasks[i].deadline = timestamp(person.tasks[i].deadline)
      person.tasks[i].personId = person.id
   }

   let result = await personRepository.save(person)
   result = undefined

   if (result) {
      response.status(201).json(person)
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
PUT /person
{
   "id": "1",
   "name": "Alice",
   "email": "alice@email.com",
   "phone": "+55 83 999998888",
   "birthdate": "2004-12-08T10:45:35.000Z",
   "address": {
      "id": "2",
      "street": "",
      "number": "",
      "district": "",
      "city": "",
      "state": "",
      "country": "",
      "complement": "",
      "zipCode": "",
      "personId": "1"
   }
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

   let person = await personRepository.findById(request.body.id)

   if (person) {
      if (typeof request.body.name == "string" && request.body.name.trim() != "") {
         person.name = request.body.name
      }

      if (typeof request.body.email == "string") {
         person.email = request.body.email
      }

      if (typeof request.body.phone == "string") {
         person.phone = request.body.phone
      }

      if (typeof request.body.birthdate == "string") {
         person.birthdate = timestamp(request.body.birthdate)
      }

      if (request.body.address instanceof Object) {
         if (typeof request.body.address.street == "string") { person.address.street = request.body.address.street }
         if (typeof request.body.address.number == "string") { person.address.number = request.body.address.number }
         if (typeof request.body.address.district == "string") { person.address.district = request.body.address.district }
         if (typeof request.body.address.city == "string") { person.address.city = request.body.address.city }
         if (typeof request.body.address.state == "string") { person.address.state = request.body.address.state }
         if (typeof request.body.address.country == "string") { person.address.country = request.body.address.country }
         if (typeof request.body.address.complement == "string") { person.address.complement = request.body.address.complement }
         if (typeof request.body.address.zipCode == "string") { person.address.zipCode = request.body.address.zipCode }
      }

      let result = await personRepository.update(person)

      if (result) {
         person.tasks.forEach(task => task.completed = task.completed == 1)
         response.status(200).json(person)
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
PATCH /person/name
{"id": "1", "name": "Alice"}
*/
export const patchName = async (request, response) => {
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

   let person = await personRepository.findById(request.body.id)

   if (person) {
      if (typeof request.body.name == "string" && request.body.name.trim() != "") {
         person.name = request.body.name
      }

      let result = await personRepository.updateName(person)

      if (result) {
         person.tasks.forEach(task => task.completed = task.completed == 1)
         response.status(200).json(person)
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
PATCH /person/email
{"id": "1", "email": "alice@email.com"}
*/
export const patchEmail = async (request, response) => {
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

   let person = await personRepository.findById(request.body.id)

   if (person) {
      if (typeof request.body.email == "string") {
         person.email = request.body.email
      }

      let result = await personRepository.updateEmail(person)

      if (result) {
         person.tasks.forEach(task => task.completed = task.completed == 1)
         response.status(200).json(person)
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
DELETE /person
{"id": "1"}
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

   let person = await personRepository.findById(request.body.id)

   if (person) {
      let result = await personRepository.remove(person.id)

      if (result) {
         person.tasks.forEach(task => task.completed = task.completed == 1)
         response.status(200).json(person)
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
GET /person/count
*/
export const getCount = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   let count = await personRepository.count()

   if (count != undefined) {
      response.status(200).json({count})
   }
   else {
      response.status(204).send()
   }
}

/*
GET /person/1
*/
export const get = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   let person = await personRepository.findById(request.params.id)

   if (person) {
      person.tasks.forEach(task => task.completed = task.completed == 1)
      response.status(200).json(person)
   }
   else {
      response.status(204).send()
   }
}

/*
GET /person/1/address
*/
export const getAddress = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   let address = await addressRepository.findByPersonId(request.params.id)

   if (address) {
      response.status(200).json(address)
   }
   else {
      response.status(204).send()
   }
}

/*
PUT /person/1/address
{
   "id": "2",
   "street": "",
   "number": "",
   "district": "",
   "city": "",
   "state": "",
   "country": "",
   "complement": "",
   "zipCode": "",
   "personId": "1"
}
*/
export const updateAddress = async (request, response) => {
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

   if (typeof request.body.id != "string" || typeof request.body.personId != "string") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   if (request.body.personId != request.params.id) {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   let address = await addressRepository.findByPersonId(request.params.id)

   if (address) {
      if (address.id != request.body.id) {
         // 400 Bad Request
         return response.status(400).send({
            status: 400,
            message: "Bad Request"
         })
      }

      if (typeof request.body.street == "string") { address.street = request.body.street }
      if (typeof request.body.number == "string") { address.number = request.body.number }
      if (typeof request.body.district == "string") { address.district = request.body.district }
      if (typeof request.body.city == "string") { address.city = request.body.city }
      if (typeof request.body.state == "string") { address.state = request.body.state }
      if (typeof request.body.country == "string") { address.country = request.body.country }
      if (typeof request.body.complement == "string") { address.complement = request.body.complement }
      if (typeof request.body.zipCode == "string") { address.zipCode = request.body.zipCode }

      let result = await addressRepository.update(address)

      if (result) {
         response.status(200).json(address)
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
GET /person/1/task
*/
export const getAllTask = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   let { index, size } = request.query

   let tasks = await taskRepository.findByPersonId(request.params.id, index, size)
   let count = await taskRepository.countByPersonId(request.params.id)

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
POST /person/1/task
{
   "title": "Buy milk",
   "deadline": "2024-12-08T10:45:35.000Z",
   "completed": true
}
*/
export const saveTask = async (request, response) => {
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

   let person = await personRepository.findById(request.params.id)
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
      task.personId = person.id

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
PUT /person/1/task
{
   "id" "2",
   "title": "Buy milk",
   "deadline": "2024-12-08T10:45:35.000Z",
   "completed": true,
   "personId": "1"
}
*/
export const updateTask = async (request, response) => {
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

   if (typeof request.body.id != "string" || typeof request.body.personId != "string") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   if (request.body.personId != request.params.id) {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   let task = await taskRepository.findById(request.body.id)

   if (task) {
      if (task.personId != request.params.id) {
         // 400 Bad Request
         return response.status(400).send({
            status: 400,
            message: "Bad Request"
         })
      }

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
PATCH /person/1/task/title
{"id": "2", "title": "Buy milk"}
*/
export const patchTaskTitle = async (request, response) => {
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
      if (task.personId != request.params.id) {
         // 400 Bad Request
         return response.status(400).send({
            status: 400,
            message: "Bad Request"
         })
      }

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
PATCH /person/1/task/completed
{"id": "2", "completed": true}
*/
export const patchTaskCompleted = async (request, response) => {
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
      if (task.personId != request.params.id) {
         // 400 Bad Request
         return response.status(400).send({
            status: 400,
            message: "Bad Request"
         })
      }

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
DELETE /person/1/task
{"id": "2"}
*/
export const removeTask = async (request, response) => {
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
      if (task.personId != request.params.id) {
         // 400 Bad Request
         return response.status(400).send({
            status: 400,
            message: "Bad Request"
         })
      }

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
GET /person/1/task/count
*/
export const getCountTask = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   let count = await taskRepository.countByPersonId(request.params.id)

   if (count != undefined) {
      response.status(200).json({count})
   }
   else {
      response.status(204).send()
   }
}

/*
GET /person/1/task/2
*/
export const getTask = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   let task = await taskRepository.findById(request.params.taskId)

   if (task) {
      if (task.personId != request.params.id) {
         // 400 Bad Request
         return response.status(400).send({
            status: 400,
            message: "Bad Request"
         })
      }

      task.completed = task.completed == 1
      response.status(200).json(task)
   }
   else {
      response.status(204).send()
   }
}