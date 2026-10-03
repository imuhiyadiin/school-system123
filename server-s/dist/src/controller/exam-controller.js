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
exports.deleteExam = exports.updateExam = exports.getExam = exports.getExams = exports.createExam = void 0;
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
const validMarks = (total, minMarks) => {
    const parsedTotal = Number(total);
    const parsedMinimum = Number(minMarks);
    return (Number.isInteger(parsedTotal) &&
        parsedTotal > 0 &&
        Number.isInteger(parsedMinimum) &&
        parsedMinimum >= 0 &&
        parsedMinimum <= parsedTotal);
};
// Create Exam
const createExam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, date, type, subjectId, subjectIds, total, minMarks, } = req.body;
        const selectedSubjectIds = Array.isArray(subjectIds)
            ? [...new Set(subjectIds.map(String))]
            : subjectId
                ? [String(subjectId)]
                : [];
        const examDate = new Date(date);
        if (!name ||
            !date ||
            Number.isNaN(examDate.getTime()) ||
            !type ||
            selectedSubjectIds.length === 0 ||
            !validMarks(total, minMarks)) {
            return res.status(400).json({
                message: "Complete the exam details, choose at least one subject, and enter valid marks.",
            });
        }
        const availableSubjects = yield prisma_1.default.subject.findMany({
            where: { id: { in: selectedSubjectIds } },
            select: { id: true },
        });
        if (availableSubjects.length !== selectedSubjectIds.length) {
            return res.status(400).json({ message: "One or more selected subjects were not found." });
        }
        const exams = yield prisma_1.default.$transaction(selectedSubjectIds.map((selectedSubjectId) => prisma_1.default.exam.create({
            data: {
                name,
                date: examDate,
                type,
                subjectId: selectedSubjectId,
                total: Number(total),
                minMarks: Number(minMarks),
            },
        })));
        return res.status(201).json({
            message: `${exams.length} exam${exams.length === 1 ? "" : "s"} created successfully.`,
            count: exams.length,
            exams,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.createExam = createExam;
// Get All Exams
const getExams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teacherId = yield teacherIdForRequest(req);
        if (teacherId === "") {
            return res.status(403).json({ message: "Teacher account was not found." });
        }
        const exams = yield prisma_1.default.exam.findMany({
            where: teacherId
                ? { subject: { is: { teachers: { some: { teacherId } } } } }
                : undefined,
            orderBy: { id: "desc" },
            include: {
                results: true,
                subject: true,
            },
        });
        return res.status(200).json({
            exams,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.getExams = getExams;
// Get Single Exam
const getExam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const teacherId = yield teacherIdForRequest(req);
        if (teacherId === "") {
            return res.status(403).json({ message: "Teacher account was not found." });
        }
        const exam = yield prisma_1.default.exam.findUnique({
            where: {
                id,
            },
            include: {
                subject: true,
                results: {
                    include: {
                        student: true,
                        subject: true,
                    },
                },
            },
        });
        if (!exam) {
            return res.status(404).json({
                message: "Exam not found",
            });
        }
        if (teacherId) {
            if (!exam.subjectId) {
                return res.status(403).json({
                    message: "You can only view exams for your assigned subjects.",
                });
            }
            const assignedSubject = yield prisma_1.default.teacherSubject.findUnique({
                where: {
                    teacherId_subjectId: {
                        teacherId,
                        subjectId: exam.subjectId,
                    },
                },
                select: { teacherId: true },
            });
            if (!assignedSubject) {
                return res.status(403).json({
                    message: "You can only view exams for your assigned subjects.",
                });
            }
        }
        return res.status(200).json({
            exam,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.getExam = getExam;
// Update Exam
const updateExam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const { name, date, type, subjectId, total, minMarks, } = req.body;
        const exam = yield prisma_1.default.exam.findUnique({
            where: {
                id,
            },
        });
        if (!exam) {
            return res.status(404).json({
                message: "Exam not found",
            });
        }
        const nextTotal = total === undefined ? exam.total : total;
        const nextMinMarks = minMarks === undefined ? exam.minMarks : minMarks;
        if (!validMarks(nextTotal, nextMinMarks)) {
            return res.status(400).json({
                message: "Minimum pass marks must be between 0 and total marks.",
            });
        }
        const updatedExam = yield prisma_1.default.exam.update({
            where: {
                id,
            },
            data: Object.assign(Object.assign(Object.assign({ name, date: date ? new Date(date) : undefined, type }, (subjectId !== undefined ? { subjectId } : {})), (total !== undefined ? { total: Number(total) } : {})), (minMarks !== undefined ? { minMarks: Number(minMarks) } : {})),
        });
        return res.status(200).json({
            message: "Exam updated successfully",
            exam: updatedExam,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.updateExam = updateExam;
// Delete Exam
const deleteExam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const exam = yield prisma_1.default.exam.findUnique({
            where: {
                id,
            },
        });
        if (!exam) {
            return res.status(404).json({
                message: "Exam not found",
            });
        }
        yield prisma_1.default.exam.delete({
            where: {
                id,
            },
        });
        return res.status(200).json({
            message: "Exam deleted successfully",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.deleteExam = deleteExam;
