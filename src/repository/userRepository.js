import { opendb } from "../database.js"

let database = opendb("user")

async function createTable() {
   return database.then(db => {
      return db.exec("CREATE TABLE IF NOT EXISTS User (id TEXT, username TEXT, password TEXT, role TEXT, name TEXT, email TEXT, phone TEXT, birthdate TEXT, createdAt TEXT, active BOOLEAN)").then(result => {
         return true
      }).catch(error => {
         return false
      })
   })
}

async function save(user) {
   return database.then(db => {
      return db.run("INSERT INTO User (id, username, password, role, name, email, phone, birthdate, createdAt, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
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
      ]).then(result => true).catch(error => false)
   })
}

async function update(user) {
   return database.then(db => {
      return db.run("UPDATE User SET username = ?, password = ?, role = ?, name = ?, email = ?, phone = ?, birthdate = ?, active = ? WHERE id = ?",
      [
         user.username,
         user.password,
         user.role,
         user.name,
         user.email,
         user.phone,
         user.birthdate,
         user.active,
         user.id
      ]).then(result => true).catch(error => false)
   })
}

async function updateActive(user) {
   return database.then(db => {
      return db.run("UPDATE User SET active = ? WHERE id = ?",
      [
         user.active,
         user.id
      ]).then(result => true).catch(error => false)
   })
}

async function remove(id) {
   return database.then(db => {
      return db.run("DELETE FROM User WHERE id = ?", [id]).then(result => true).catch(error => false)
   })
}

async function findAll(index = 0, size = PAGE_SIZE) {
   if (index < 0) { index = 0 }
   if (size < 0 || size > PAGE_SIZE) { size = PAGE_SIZE }
   return database.then(db => {
      return db.all("SELECT * FROM User LIMIT ? OFFSET ?", [size, index * size]).then(result => result).catch(error => undefined)
   })
}

async function find(username) {
   return database.then(db => {
      return db.get("SELECT * FROM User WHERE username = ?", [username]).then(result => result).catch(error => undefined)
   })
}

async function findById(id) {
   return database.then(db => {
      return db.get("SELECT * FROM User WHERE id = ?", [id]).then(result => result).catch(error => undefined)
   })
}

async function count() {
   return database.then(db => {
      return db.get("SELECT COUNT(1) FROM User").then(result => Object.values(result)[0]).catch(error => undefined)
   })
}

createTable()

export const userRepository = {save, update, updateActive, remove, findAll, find, findById, count}