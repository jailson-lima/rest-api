import { opendb } from "../database.js"

let database = opendb("data")

async function createTable() {
   return database.then(db => {
      return db.exec("CREATE TABLE IF NOT EXISTS Address (id TEXT, street TEXT, number TEXT, district TEXT, city TEXT, state TEXT, country TEXT, complement TEXT, zipCode TEXT, personId TEXT)").then(result => {
         return true
      }).catch(error => {
         return false
      })
   })
}

async function save(address) {
   return database.then(db => {
      return db.run("INSERT INTO Address (id, street, number, district, city, state, country, complement, zipCode, personId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
         address.id,
         address.street,
         address.number,
         address.district,
         address.city,
         address.state,
         address.country,
         address.complement,
         address.zipCode,
         address.personId
      ]).then(result => true).catch(error => false)
   })
}

async function update(address) {
   return database.then(db => {
      return db.run("UPDATE Address SET street = ?, number = ?, district = ?, city = ?, state = ?, country = ?, complement = ?, zipCode = ? WHERE id = ?",
      [
         address.street,
         address.number,
         address.district,
         address.city,
         address.state,
         address.country,
         address.complement,
         address.zipCode,
         address.id
      ]).then(result => true).catch(error => false)
   })
}

async function remove(id) {
   return database.then(db => {
      return db.run("DELETE FROM Address WHERE id = ?", [id]).then(result => true).catch(error => false)
   })
}

async function removeByPersonId(personId) {
   return database.then(db => {
      return db.run("DELETE FROM Address WHERE personId = ?", [personId]).then(result => true).catch(error => false)
   })
}

async function findAll(index = 0, size = PAGE_SIZE) {
   if (index < 0) { index = 0 }
   if (size < 0 || size > PAGE_SIZE) { size = PAGE_SIZE }
   return database.then(db => {
      return db.all("SELECT * FROM Address LIMIT ? OFFSET ?", [size, index * size]).then(result => result).catch(error => undefined)
   })
}

async function findById(id) {
   return database.then(db => {
      return db.get("SELECT * FROM Address WHERE id = ?", [id]).then(result => result).catch(error => undefined)
   })
}

async function findByPersonId(personId) {
   return database.then(db => {
      return db.get("SELECT * FROM Address WHERE personId = ?", [personId]).then(result => result).catch(error => undefined)
   })
}

async function count() {
   return database.then(db => {
      return db.get("SELECT COUNT(1) FROM Address").then(result => Object.values(result)[0]).catch(error => undefined)
   })
}

createTable()

export const addressRepository = {save, update, remove, removeByPersonId, findAll, findById, findByPersonId, count}