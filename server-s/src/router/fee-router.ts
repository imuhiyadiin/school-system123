import { Router } from "express"
import { createFee, deleteFee, getFee, getFees, updateFee } from "../controller/fee-controller"

const router = Router()
router.post("/", createFee)
router.get("/", getFees)
router.get("/:id", getFee)
router.patch("/:id", updateFee)
router.delete("/:id", deleteFee)
export default router
