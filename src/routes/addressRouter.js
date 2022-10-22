import { Router } from "express"
import { authenticate } from "../services/authenticate.js"
import { getAll, update, getCount, get } from "../controllers/addressController.js"

const router = Router()
router.use(authenticate)

// GET
router.get("/address", getAll)

// PUT
router.put("/address", update)

// GET
router.get("/address/count", getCount)

// GET
router.get("/address/:id", get)

export default router