import { opendb } from "../database.js"
import { addressRepository } from "./addressRepository.js"
import { taskRepository } from "./taskRepository.js"

let database = opendb("data")

async function createTable() {
   return database.then(db => {
      return db.exec("CREATE TABLE IF NOT EXISTS Person (id TEXT, name TEXT, email TEXT, phone TEXT, birthdate TEXT, createdAt TEXT)").then(result => {
         return true
      }).catch(error => {
         return false
      })
   })
}

async function savePerson(person) {
   return database.then(db => {
      return db.run("INSERT INTO Person (id, name, email, phone, birthdate, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      [
         person.id,
         person.name,
         person.email,
         person.phone,
         person.birthdate,
         person.createdAt
      ]).then(result => true).catch(error => false)
   })
}

async function save(person) {
   let result = await savePerson(person)
   if (!result) { return false }

   result = await addressRepository.save(person.address)
   if (!result) { return false }

   for (let i = 0; i < person.tasks.length; i++) {
      result = await taskRepository.save(person.tasks[i])
      if (!result) { return false }
   }

   return true
}

async function updatePerson(person) {
   return database.then(db => {
      return db.run("UPDATE Person SET name = ?, email = ?, phone = ?, birthdate = ? WHERE id = ?",
      [
         person.name,
         person.email,
         person.phone,
         person.birthdate,
         person.id
      ]).then(result => true).catch(error => false)
   })
}

async function update(person) {
   let result = await updatePerson(person)
   if (!result) { return false }

   result = await addressRepository.update(person.address)
   if (!result) { return false }

   return true
}

async function updateName(person) {
   return database.then(db => {
      return db.run("UPDATE Person SET name = ? WHERE id = ?",
      [
         person.name,
         person.id
      ]).then(result => true).catch(error => false)
   })
}

async function updateEmail(person) {
   return database.then(db => {
      return db.run("UPDATE Person SET email = ? WHERE id = ?",
      [
         person.email,
         person.id
      ]).then(result => true).catch(error => false)
   })
}

async function removePerson(id) {
   return database.then(db => {
      return db.run("DELETE FROM Person WHERE id = ?", [id]).then(result => true).catch(error => false)
   })
}

async function remove(id) {
   let result = await removePerson(id)
   if (!result) { return false }

   result = await addressRepository.removeByPersonId(id)
   if (!result) { return false }

   result = await taskRepository.removeByPersonId(id)
   if (!result) { return false }

   return true
}

async function findAllPerson(index = 0, size = PAGE_SIZE) {
   if (index < 0) { index = 0 }
   if (size < 0 || size > PAGE_SIZE) { size = PAGE_SIZE }
   return database.then(db => {
      return db.all("SELECT * FROM Person LIMIT ? OFFSET ?", [size, index * size]).then(result => result).catch(error => undefined)
   })
}

async function findAll(index, size) {
   let persons = await findAllPerson(index, size)
   if (!persons) { return undefined }

   for (let i = 0; i < persons.length; i++) {
      persons[i].address = await addressRepository.findByPersonId(persons[i].id)
      if (!persons[i].address) { return undefined }

      persons[i].tasks = await taskRepository.findByPersonId(persons[i].id)
      if (!persons[i].tasks) { return undefined }
   }

   return persons
}

async function findPerson(name, index = 0, size = PAGE_SIZE) {
   if (index < 0) { index = 0 }
   if (size < 0 || size > PAGE_SIZE) { size = PAGE_SIZE }
   return database.then(db => {
      return db.all("SELECT * FROM Person WHERE name = ? LIMIT ? OFFSET ?", [name, size, index * size]).then(result => result).catch(error => undefined)
   })
}

async function find(name, index, size) {
   let persons = await findPerson(name, index, size)
   if (!persons) { return undefined }

   for (let i = 0; i < persons.length; i++) {
      persons[i].address = await addressRepository.findByPersonId(persons[i].id)
      if (!persons[i].address) { return undefined }

      persons[i].tasks = await taskRepository.findByPersonId(persons[i].id)
      if (!persons[i].tasks) { return undefined }
   }

   return persons
}

async function findPersonById(id) {
   return database.then(db => {
      return db.get("SELECT * FROM Person WHERE id = ?", [id]).then(result => result).catch(error => undefined)
   })
}

async function findById(id) {
   let person = await findPersonById(id)
   if (!person) { return undefined }

   person.address = await addressRepository.findByPersonId(person.id)
   if (!person.address) { return undefined }

   person.tasks = await taskRepository.findByPersonId(person.id)
   if (!person.tasks) { return undefined }

   return person
}

async function count() {
   return database.then(db => {
      return db.get("SELECT COUNT(1) FROM Person").then(result => Object.values(result)[0]).catch(error => undefined)
   })
}

createTable()

export const personRepository = {save, update, updateName, updateEmail, remove, findAll, find, findById, count}