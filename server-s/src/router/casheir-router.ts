import { Router } from "express";
import { createCashier, createPayment, deleteCashier, deletePayment, getCashier, getCashiers, getPayments, getStudentPayments, updateCashier, updatePayment } from "../controller/casheir-controller";
const router = Router();
router.post("/", createCashier); router.get("/", getCashiers); router.post("/payment", createPayment); router.patch("/payment/:id", updatePayment); router.delete("/payment/:id", deletePayment); router.get("/payments", getPayments); router.get("/student/:studentId/payments", getStudentPayments); router.get("/:id", getCashier); router.patch("/:id", updateCashier); router.delete("/:id", deleteCashier);
export default router;
