"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentAttendance = exports.deleteAttendance = exports.updateAttendance = exports.getAttendance = exports.saveClassroomAttendance = exports.getClassroomAttendance = exports.markAttendance = exports.createAttendance = exports.saveTeacherAttendance = exports.getTeacherAttendance = void 0;
const prisma_1 = __importDefault(require("../lip/prisma"));
const dayRange = (value) => { const start = new Date(`${value.slice(0, 10)}T00:00:00.000Z`); const end = new Date(start); end.setUTCDate(end.getUTCDate() + 1); return { start, end }; };
const getTeacherAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { start, end } = dayRange(String((_a = req.query.date) !== null && _a !== void 0 ? _a : new Date().toISOString().slice(0, 10)));
        const [teachers, attendance] = yield Promise.all([
            prisma_1.default.teacher.findMany({ select: { id: true, fullName: true, phone: true }, orderBy: { fullName: "asc" } }),
            prisma_1.default.teacherAttendance.findMany({ where: { date: { gte: start, lt: end } } }),
        ]);
        res.json({ teachers, attendance });
    }
    catch (_b) {
        res.status(500).json({ message: "Failed to load teacher attendance" });
    }
});
exports.getTeacherAttendance = getTeacherAttendance;
const saveTeacherAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, records } = req.body;
        if (!date || !Array.isArray(records) || !records.length)
            return res.status(400).json({ message: "Date and teacher attendance records are required" });
        const valid = new Set(["PRESENT", "ABSENT", "ON_LEAVE"]);
        if (records.some((record) => !record.teacherId || !valid.has(record.status)))
            return res.status(400).json({ message: "Invalid teacher attendance record" });
        const { start, end } = dayRange(date);
        yield prisma_1.default.$transaction([prisma_1.default.teacherAttendance.deleteMany({ where: { date: { gte: start, lt: end } } }), prisma_1.default.teacherAttendance.createMany({ data: records.map((record) => ({ teacherId: record.teacherId, date: start, status: record.status, remark: record.remark || null })) })]);
        res.json({ message: "Teacher attendance saved successfully" });
    }
    catch (_a) {
        res.status(500).json({ message: "Failed to save teacher attendance" });
    }
});
exports.saveTeacherAttendance = saveTeacherAttendance;
const createAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId, date, status, remark, classroomId, } = req.body;
        if (!studentId || !date || status === undefined) {
            return res.status(400).json({
                message: "Fill required data",
            });
        }
        const attendance = yield prisma_1.default.attendance.create({
            data: {
                studentId,
                date: new Date(date),
                status: typeof status === "string" ? status : status ? "PRESENT" : "ABSENT",
                remark: remark || null,
                classroomId: classroomId || null,
            },
            include: {
                student: true,
            },
        });
        return res.status(201).json({
            message: "Attendance created successfully",
            attendance,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.createAttendance = createAttendance;
exports.markAttendance = exports.createAttendance;
const getClassroomAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const classroomId = String(req.params.classroomId);
        const { start, end } = dayRange(String((_a = req.query.date) !== null && _a !== void 0 ? _a : new Date().toISOString().slice(0, 10)));
        const classroom = yield prisma_1.default.classroom.findUnique({
            where: { id: classroomId },
            include: {
                teacher: { select: { fullName: true } },
                students: { include: { student: true } },
            },
        });
        if (!classroom)
            return res.status(404).json({ message: "Classroom not found" });
        const attendance = yield prisma_1.default.attendance.findMany({
            where: {
                date: { gte: start, lt: end },
                OR: [
                    { classroomId },
                    {
                        classroomId: null,
                        studentId: { in: classroom.students.map(({ student }) => student.id) },
                    },
                ],
            },
            orderBy: { date: "asc" },
        });
        res.json({ classroom, attendance });
    }
    catch (_b) {
        res.status(500).json({ message: "Failed to load classroom attendance" });
    }
});
exports.getClassroomAttendance = getClassroomAttendance;
const saveClassroomAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { classroomId, date, records } = req.body;
        if (!classroomId || !date || !Array.isArray(records) || !records.length)
            return res.status(400).json({ message: "Classroom, date and attendance records are required" });
        const valid = new Set(["PRESENT", "ABSENT", "HALF_DAY"]);
        if (records.some((record) => !record.studentId || !valid.has(record.status)))
            return res.status(400).json({ message: "Invalid attendance record" });
        const { start, end } = dayRange(date);
        yield prisma_1.default.$transaction([prisma_1.default.attendance.deleteMany({ where: { classroomId, date: { gte: start, lt: end } } }), prisma_1.default.attendance.createMany({ data: records.map((record) => ({ studentId: record.studentId, classroomId, date: start, status: record.status, remark: record.remark || null })) })]);
        res.json({ message: "Attendance saved successfully" });
    }
    catch (_a) {
        res.status(500).json({ message: "Failed to save attendance" });
    }
});
exports.saveClassroomAttendance = saveClassroomAttendance;
const getAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.params.id) {
            const attendance = yield prisma_1.default.attendance.findMany({ include: { student: true }, orderBy: { date: "desc" } });
            return res.status(200).json(attendance);
        }
        const id = String(req.params.id);
        const attendance = yield prisma_1.default.attendance.findUnique({
            where: {
                id,
            },
            include: {
                student: true,
            },
        });
        if (!attendance) {
            return res.status(404).json({
                message: "Attendance not found",
            });
        }
        return res.status(200).json({
            attendance,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.getAttendance = getAttendance;
const updateAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const { date, status, } = req.body;
        const attendance = yield prisma_1.default.attendance.findUnique({
            where: {
                id,
            },
        });
        if (!attendance) {
            return res.status(404).json({
                message: "Attendance not found",
            });
        }
        const updatedAttendance = yield prisma_1.default.attendance.update({
            where: {
                id,
            },
            data: Object.assign({ date: date ? new Date(date) : undefined }, (status !== undefined ? { status: typeof status === "string" ? status : status ? "PRESENT" : "ABSENT" } : {})),
            include: {
                student: true,
            },
        });
        return res.status(200).json({
            message: "Attendance updated successfully",
            attendance: updatedAttendance,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.updateAttendance = updateAttendance;
const deleteAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const attendance = yield prisma_1.default.attendance.findUnique({
            where: {
                id,
            },
        });
        if (!attendance) {
            return res.status(404).json({
                message: "Attendance not found",
            });
        }
        yield prisma_1.default.attendance.delete({
            where: {
                id,
            },
        });
        return res.status(200).json({
            message: "Attendance deleted successfully",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.deleteAttendance = deleteAttendance;
const studentAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const attendance = yield prisma_1.default.attendance.findMany({
            where: {
                studentId: String(req.params.studentId),
            },
        });
        res.status(200).json(attendance);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to get student attendance" });
    }
});
exports.studentAttendance = studentAttendance;
