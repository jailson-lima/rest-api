import { Router } from "express"
import { authenticate } from "../services/authenticate.js"
import {
   getAll,
   save,
   update,
   patchName,
   patchEmail,
   remove,
   getCount,
   get,
   getAddress,
   updateAddress,
   getAllTask,
   saveTask,
   updateTask,
   patchTaskTitle,
   patchTaskCompleted,
   removeTask,
   getCountTask,
   getTask
} from "../controllers/personController.js"

const router = Router()
router.use(authenticate)

// GET
router.get("/person", getAll)

// POST
router.post("/person", save)

// PUT
router.put("/person", update)

// PATCH
router.patch("/person/name", patchName)

// PATCH
router.patch("/person/email", patchEmail)

// DELETE
router.delete("/person", remove)

// GET
router.get("/person/count", getCount)

// GET
router.get("/person/:id", get)

// GET
router.get("/person/:id/address", getAddress)

// PUT
router.put("/person/:id/address", updateAddress)

// GET
router.get("/person/:id/task", getAllTask)

// POST
router.post("/person/:id/task", saveTask)

// PUT
router.put("/person/:id/task", updateTask)

// PATCH
router.patch("/person/:id/task/title", patchTaskTitle)

// PATCH
router.patch("/person/:id/task/completed", patchTaskCompleted)

// DELETE
router.delete("/person/:id/task", removeTask)

// GET
router.get("/person/:id/task/count", getCountTask)

// GET
router.get("/person/:id/task/:taskId", getTask)

export default router