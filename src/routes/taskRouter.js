import { Router } from "express"
import { authenticate } from "../services/authenticate.js"
import { getAll, save, update, patchTitle, patchCompleted, remove, getCount, get } from "../controllers/taskController.js"

const router = Router()
router.use(authenticate)

// GET
router.get("/task", getAll)

// POST
router.post("/task", save)

// PUT
router.put("/task", update)

// PATCH
router.patch("/task/title", patchTitle)

// PATCH
router.patch("/task/completed", patchCompleted)

// DELETE
router.delete("/task", remove)

// GET
router.get("/task/count", getCount)

// GET
router.get("/task/:id", get)

export default router