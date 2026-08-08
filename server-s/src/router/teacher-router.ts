import { Router } from "express";
import { createTeacher, deleteTeacher, getTeacher, getTeachers, updateTeacher } from "../controller/teacher-controller";
const router = Router();
router.post("/", createTeacher); 
router.get("/", getTeachers); 
router.get("/:id", getTeacher); 
router.patch("/:id", updateTeacher); 
router.delete("/:id", deleteTeacher);
export default router;
