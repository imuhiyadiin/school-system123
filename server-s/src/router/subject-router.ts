import { Router } from "express";
import { createSubject, deleteSubject, getSubject, getSubjects, updateSubject } from "../controller/subject-conttroller";
import { requireAdmin, verifyToken } from "../middelwere/auth";
const router = Router();
router.post("/", verifyToken, requireAdmin, createSubject); router.get("/", verifyToken, getSubjects); router.get("/:id", verifyToken, getSubject); router.patch("/:id", verifyToken, requireAdmin, updateSubject); router.delete("/:id", verifyToken, requireAdmin, deleteSubject);
export default router;
