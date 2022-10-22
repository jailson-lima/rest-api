import { Router } from "express"
import { authenticate } from "../services/authenticate.js"
import { signup, signin, signout, token, update, patchActive, remove, getAll, getCount, get } from "../controllers/accountController.js"

const router = Router()

// POST
router.post("/account/signup", signup)

// POST
router.post("/account/signin", signin)

// POST
router.post("/account/signout", signout)

// POST
router.post("/account/token", token)

// PUT
router.put("/account/update", authenticate, update)

// PATCH
router.patch("/account/active", authenticate, patchActive)

// DELETE
router.delete("/account/remove", authenticate, remove)

// GET
router.get("/account/user", authenticate, getAll)

// GET
router.get("/account/user/count", authenticate, getCount)

// GET
router.get("/account/user/:id", authenticate, get)

export default router