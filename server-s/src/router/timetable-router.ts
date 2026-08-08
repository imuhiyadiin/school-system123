import { Router } from "express";
import { createTimetable, deleteTimetable, getTimetable, getTimetables, updateTimetable } from "../controller/timeable-controller";
import { requireStudent, verifyToken } from "../middelwere/auth";
const router = Router();
router.post("/", createTimetable); router.get("/", verifyToken, requireStudent, getTimetables); router.get("/:id", getTimetable); router.patch("/:id", updateTimetable); router.delete("/:id", deleteTimetable);
export default router;
