export class Person {
   constructor(id, name, email, phone, birthdate, createdAt, address, tasks = []) {
      this.id = id || ""
      this.name = name || ""
      this.email = email || ""
      this.phone = phone || ""
      this.birthdate = birthdate || ""
      this.createdAt = createdAt || ""
      this.address = address || null
      this.tasks = tasks
   }

   static from(person) {
      return new Person(
         person.id,
         person.name,
         person.email,
         person.phone,
         person.birthdate,
         person.createdAt,
         person.address,
         person.tasks
      )
   }
}