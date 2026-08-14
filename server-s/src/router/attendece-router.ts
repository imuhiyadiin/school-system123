import { Router } from "express";
import { deleteAttendance, getAttendance, getClassroomAttendance, markAttendance, saveClassroomAttendance, studentAttendance, updateAttendance } from "../controller/attendence-controller";
import { requireOwnStudent, requireStudent, verifyToken } from "../middelwere/auth";
const router = Router();
router.post("/", markAttendance); router.post("/classroom", saveClassroomAttendance); router.get("/", getAttendance); router.get("/classroom/:classroomId", getClassroomAttendance); router.get("/student/:studentId", verifyToken, requireStudent, requireOwnStudent, studentAttendance); router.patch("/:id", updateAttendance); router.delete("/:id", deleteAttendance);
export default router;
