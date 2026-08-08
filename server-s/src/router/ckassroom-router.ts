import { Router } from "express";
import { assignStudentToClassroom, createClassroom, deleteClassroom, getClassroom, getClassrooms, removeStudentFromClassroom, updateClassroom } from "../controller/Classroom-controller";
const router = Router();
router.post("/", createClassroom); router.get("/", getClassrooms); router.get("/:id", getClassroom); router.patch("/:id", updateClassroom); router.delete("/:id", deleteClassroom); router.post("/assign-student", assignStudentToClassroom); router.delete("/remove-student", removeStudentFromClassroom);
export default router;
