import { Router } from "express";
import { deleteAttendance, getAttendance, getClassroomAttendance, getTeacherAttendance, markAttendance, saveClassroomAttendance, saveTeacherAttendance, studentAttendance, updateAttendance } from "../controller/attendence-controller";
import { requireOwnStudent, requireStudent, verifyToken } from "../middelwere/auth";
const router = Router();
router.post("/", markAttendance); router.post("/classroom", saveClassroomAttendance); router.get("/teachers", getTeacherAttendance); router.post("/teachers", saveTeacherAttendance); router.get("/", getAttendance); router.get("/classroom/:classroomId", getClassroomAttendance); router.get("/student/:studentId", verifyToken, requireStudent, requireOwnStudent, studentAttendance); router.patch("/:id", updateAttendance); router.delete("/:id", deleteAttendance);
export default router;
