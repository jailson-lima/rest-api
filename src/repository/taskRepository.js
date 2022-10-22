import { opendb } from "../database.js"

let database = opendb("data")

async function createTable() {
   return database.then(db => {
      return db.exec("CREATE TABLE IF NOT EXISTS Task (id TEXT, title TEXT, deadline TEXT, completed BOOLEAN, personId TEXT)").then(result => {
         return true
      }).catch(error => {
         return false
      })
   })
}

async function save(task) {
   return database.then(db => {
      return db.run("INSERT INTO Task (id, title, deadline, completed, personId) VALUES (?, ?, ?, ?, ?)",
      [
         task.id,
         task.title,
         task.deadline,
         task.completed,
         task.personId
      ]).then(result => true).catch(error => false)
   })
}

async function update(task) {
   return database.then(db => {
      return db.run("UPDATE Task SET title = ?, deadline = ?, completed = ? WHERE id = ?",
      [
         task.title,
         task.deadline,
         task.completed,
         task.id
      ]).then(result => true).catch(error => false)
   })
}

async function updateTitle(task) {
   return database.then(db => {
      return db.run("UPDATE Task SET title = ? WHERE id = ?",
      [
         task.title,
         task.id
      ]).then(result => true).catch(error => false)
   })
}

async function updateCompleted(task) {
   return database.then(db => {
      return db.run("UPDATE Task SET completed = ? WHERE id = ?",
      [
         task.completed,
         task.id
      ]).then(result => true).catch(error => false)
   })
}

async function remove(id) {
   return database.then(db => {
      return db.run("DELETE FROM Task WHERE id = ?", [id]).then(result => true).catch(error => false)
   })
}

async function removeByPersonId(personId) {
   return database.then(db => {
      return db.run("DELETE FROM Task WHERE personId = ?", [personId]).then(result => true).catch(error => false)
   })
}

async function findAll(index = 0, size = PAGE_SIZE) {
   if (index < 0) { index = 0 }
   if (size < 0 || size > PAGE_SIZE) { size = PAGE_SIZE }
   return database.then(db => {
      return db.all("SELECT * FROM Task LIMIT ? OFFSET ?", [size, index * size]).then(result => result).catch(error => undefined)
   })
}

async function find(title, index = 0, size = PAGE_SIZE) {
   if (index < 0) { index = 0 }
   if (size < 0 || size > PAGE_SIZE) { size = PAGE_SIZE }
   return database.then(db => {
      return db.all("SELECT * FROM Task WHERE title = ? LIMIT ? OFFSET ?", [title, size, index * size]).then(result => result).catch(error => undefined)
   })
}

async function findById(id) {
   return database.then(db => {
      return db.get("SELECT * FROM Task WHERE id = ?", [id]).then(result => result).catch(error => undefined)
   })
}

async function findByPersonId(personId, index = 0, size = PAGE_SIZE) {
   if (index < 0) { index = 0 }
   if (size < 0 || size > PAGE_SIZE) { size = PAGE_SIZE }
   return database.then(db => {
      return db.all("SELECT * FROM Task WHERE personId = ? LIMIT ? OFFSET ?", [personId, size, index * size]).then(result => result).catch(error => undefined)
   })
}

async function count() {
   return database.then(db => {
      return db.get("SELECT COUNT(1) FROM Task").then(result => Object.values(result)[0]).catch(error => undefined)
   })
}

async function countByPersonId(personId) {
   return database.then(db => {
      return db.get("SELECT COUNT(1) FROM Task WHERE personId = ?", [personId]).then(result => Object.values(result)[0]).catch(error => undefined)
   })
}

createTable()

export const taskRepository = {save, update, updateTitle, updateCompleted, remove, removeByPersonId, findAll, find, findById, findByPersonId, count, countByPersonId}