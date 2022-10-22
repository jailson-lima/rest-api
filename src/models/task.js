export class Task {
   constructor(id, title, deadline, completed = false, personId) {
      this.id = id || ""
      this.title = title || ""
      this.deadline = deadline || ""
      this.completed = completed
      this.personId = personId || ""
   }

   static from(task) {
      return new Task(task.id, task.title, task.deadline, task.completed, task.personId)
   }
}