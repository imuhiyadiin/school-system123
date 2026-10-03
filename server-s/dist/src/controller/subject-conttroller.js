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
exports.deleteSubject = exports.updateSubject = exports.getSubject = exports.getSubjects = exports.createSubject = void 0;
const prisma_1 = __importDefault(require("../lip/prisma"));
const teacherIdForRequest = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "TEACHER")
        return null;
    const teacher = yield prisma_1.default.teacher.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
    });
    return (_b = teacher === null || teacher === void 0 ? void 0 : teacher.id) !== null && _b !== void 0 ? _b : "";
});
// Create Subject
const createSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, description, } = req.body;
        const grade = Number((_a = req.body.grade) !== null && _a !== void 0 ? _a : 1);
        if (!name || !grade) {
            return res.status(400).json({
                message: "Fill required data",
            });
        }
        const existingSubject = yield prisma_1.default.subject.findFirst({
            where: {
                name,
                grade,
            },
        });
        if (existingSubject) {
            return res.status(400).json({
                message: "Subject already exists",
            });
        }
        const subject = yield prisma_1.default.subject.create({
            data: {
                name,
                grade,
                description,
            },
        });
        return res.status(201).json({
            message: "Subject created successfully",
            subject,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.createSubject = createSubject;
// Get All Subjects
const getSubjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teacherId = yield teacherIdForRequest(req);
        if (teacherId === "") {
            return res.status(403).json({ message: "Teacher account was not found." });
        }
        const subjects = yield prisma_1.default.subject.findMany({
            where: teacherId ? { teachers: { some: { teacherId } } } : undefined,
            orderBy: { id: "desc" },
            include: {
                results: true,
            },
        });
        return res.status(200).json({
            subjects,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.getSubjects = getSubjects;
// Get Single Subject
const getSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const teacherId = yield teacherIdForRequest(req);
        if (teacherId === "") {
            return res.status(403).json({ message: "Teacher account was not found." });
        }
        const subject = yield prisma_1.default.subject.findUnique({
            where: {
                id,
            },
            include: {
                results: {
                    include: {
                        student: true,
                        exam: true,
                    },
                },
            },
        });
        if (!subject) {
            return res.status(404).json({
                message: "Subject not found",
            });
        }
        if (teacherId &&
            !(yield prisma_1.default.teacherSubject.findUnique({
                where: { teacherId_subjectId: { teacherId, subjectId: id } },
                select: { teacherId: true },
            }))) {
            return res.status(403).json({
                message: "You can only view your assigned subjects.",
            });
        }
        return res.status(200).json({
            subject,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.getSubject = getSubject;
// Update Subject
const updateSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const { name, grade, description, } = req.body;
        const subject = yield prisma_1.default.subject.findUnique({
            where: {
                id,
            },
        });
        if (!subject) {
            return res.status(404).json({
                message: "Subject not found",
            });
        }
        const updatedSubject = yield prisma_1.default.subject.update({
            where: {
                id,
            },
            data: Object.assign(Object.assign({ name }, (grade !== undefined ? { grade } : {})), { description }),
        });
        return res.status(200).json({
            message: "Subject updated successfully",
            subject: updatedSubject,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.updateSubject = updateSubject;
// Delete Subject
const deleteSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const subject = yield prisma_1.default.subject.findUnique({
            where: {
                id,
            },
        });
        if (!subject) {
            return res.status(404).json({
                message: "Subject not found",
            });
        }
        yield prisma_1.default.subject.delete({
            where: {
                id,
            },
        });
        return res.status(200).json({
            message: "Subject deleted successfully",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.deleteSubject = deleteSubject;
