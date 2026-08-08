import { Router } from "express";
import { createCashier, deleteCashier, getCashier, getCashiers, updateCashier } from "../controller/casheir-controller";
const router = Router();
router.post("/", createCashier); router.get("/", getCashiers); router.get("/:id", getCashier); router.patch("/:id", updateCashier); router.delete("/:id", deleteCashier);
export default router;
