import { Router } from "express";
import { classResults, createResult, deleteResult, getResult, getResults, studentResults, updateResult } from "../controller/result-controller";
import { requireOwnStudent, requireStudent, verifyToken } from "../middelwere/auth";
const router = Router();
router.post("/", createResult); router.get("/", getResults); router.get("/student/:studentId", verifyToken, requireStudent, requireOwnStudent, studentResults); router.get("/class/:classId", classResults); router.get("/:id", getResult); router.patch("/:id", updateResult); router.delete("/:id", deleteResult);
export default router;
