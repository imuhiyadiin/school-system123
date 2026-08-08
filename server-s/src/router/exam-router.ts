import { Router } from "express";
import { createExam, deleteExam, getExam, getExams, updateExam } from "../controller/exam-controller";
import { requireAdmin, verifyToken } from "../middelwere/auth";
const router = Router();
router.post("/", verifyToken, requireAdmin, createExam); router.get("/", verifyToken, getExams); router.get("/:id", verifyToken, getExam); router.patch("/:id", verifyToken, requireAdmin, updateExam); router.delete("/:id", verifyToken, requireAdmin, deleteExam);
export default router;
