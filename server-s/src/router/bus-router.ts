import { Router } from "express"
import { createBus, deleteBus, getBus, getBuses, updateBus } from "../controller/bus-controller"

const router = Router()
router.post("/", createBus)
router.get("/", getBuses)
router.get("/:id", getBus)
router.patch("/:id", updateBus)
router.delete("/:id", deleteBus)

export default router
