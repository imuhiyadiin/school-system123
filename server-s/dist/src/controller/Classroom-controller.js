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
exports.removeStudentFromClassroom = exports.assignStudentToClassroom = exports.deleteClassroom = exports.updateClassroom = exports.getClassroom = exports.getClassrooms = exports.createClassroom = void 0;
const prisma_1 = __importDefault(require("../lip/prisma"));
const createClassroom = (req, res) => __awaiter(void 0, void 0, void 0, function* () { try {
    const { name, section, grade, teacherId } = req.body;
    if (!name || !section || !Number.isInteger(Number(grade)) || !teacherId)
        return res.status(400).json({ message: "Name, section, grade and teacherId are required" });
    res.status(201).json(yield prisma_1.default.classroom.create({ data: { name, section, grade: Number(grade), teacherId } }));
}
catch (_a) {
    res.status(500).json({ message: "Failed to create classroom" });
} });
exports.createClassroom = createClassroom;
const getClassrooms = (_req, res) => __awaiter(void 0, void 0, void 0, function* () { try {
    res.json({ result: yield prisma_1.default.classroom.findMany({ orderBy: { id: "desc" }, include: { teacher: true, students: { include: { student: true } } } }) });
}
catch (_a) {
    res.status(500).json({ message: "Failed to get classrooms" });
} });
exports.getClassrooms = getClassrooms;
const getClassroom = (req, res) => __awaiter(void 0, void 0, void 0, function* () { try {
    const classroom = yield prisma_1.default.classroom.findUnique({ where: { id: String(req.params.id) }, include: { teacher: true, students: { include: { student: true } } } });
    if (!classroom)
        return res.status(404).json({ message: "Classroom not found" });
    res.json(classroom);
}
catch (_a) {
    res.status(500).json({ message: "Failed to get classroom" });
} });
exports.getClassroom = getClassroom;
const updateClassroom = (req, res) => __awaiter(void 0, void 0, void 0, function* () { try {
    const { name, section, grade, teacherId } = req.body;
    res.json(yield prisma_1.default.classroom.update({ where: { id: String(req.params.id) }, data: Object.assign(Object.assign(Object.assign(Object.assign({}, (name !== undefined ? { name } : {})), (section !== undefined ? { section } : {})), (grade !== undefined ? { grade: Number(grade) } : {})), (teacherId !== undefined ? { teacherId } : {})) }));
}
catch (_a) {
    res.status(500).json({ message: "Failed to update classroom" });
} });
exports.updateClassroom = updateClassroom;
const deleteClassroom = (req, res) => __awaiter(void 0, void 0, void 0, function* () { try {
    yield prisma_1.default.classroom.delete({ where: { id: String(req.params.id) } });
    res.json({ message: "Classroom deleted successfully" });
}
catch (_a) {
    res.status(500).json({ message: "Failed to delete classroom" });
} });
exports.deleteClassroom = deleteClassroom;
const assignStudentToClassroom = (req, res) => __awaiter(void 0, void 0, void 0, function* () { try {
    const { classroomId, studentId } = req.body;
    res.status(201).json(yield prisma_1.default.classroomStudent.upsert({ where: { classroomId_studentId: { classroomId, studentId } }, update: {}, create: { classroomId, studentId } }));
}
catch (_a) {
    res.status(500).json({ message: "Failed to assign student" });
} });
exports.assignStudentToClassroom = assignStudentToClassroom;
const removeStudentFromClassroom = (req, res) => __awaiter(void 0, void 0, void 0, function* () { try {
    const { classroomId, studentId } = req.body;
    yield prisma_1.default.classroomStudent.delete({ where: { classroomId_studentId: { classroomId, studentId } } });
    res.json({ message: "Student removed successfully" });
}
catch (_a) {
    res.status(500).json({ message: "Failed to remove student" });
} });
exports.removeStudentFromClassroom = removeStudentFromClassroom;
