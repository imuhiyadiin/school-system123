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
exports.classResults = exports.studentResults = exports.deleteResult = exports.updateResult = exports.getResult = exports.getResults = exports.createResult = void 0;
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
const resultInclude = {
    student: true,
    classroom: true,
    subject: true,
    exam: true,
};
const validateMarks = (marks, total) => {
    const value = typeof marks === "number" ? marks : Number(marks);
    if (!Number.isInteger(value) || value < 0 || value > total) {
        return `Marks must be a whole number between 0 and ${total}.`;
    }
    return null;
};
// Older records may contain duplicate entries. Keep the newest entry for each
// student, subject, exam type, and school year.
const uniqueResults = (results) => [...new Map(results.map((result) => {
        var _a;
        return [
            `${result.studentId}-${result.subjectId}-${result.exam.type}-${(_a = result.schoolYear) !== null && _a !== void 0 ? _a : result.exam.date.getFullYear()}`,
            result,
        ];
    })).values()];
const createResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { studentId, classId, subjectId, examId, examType, examDate, schoolYear, marks, } = req.body;
        if (!studentId || !classId || marks === undefined || (!examId && (!examType || !examDate))) {
            return res.status(400).json({
                message: "Fill required data",
            });
        }
        const teacherId = yield teacherIdForRequest(req);
        if (teacherId === "") {
            return res.status(403).json({ message: "Teacher account was not found." });
        }
        if (teacherId && !examId) {
            return res.status(400).json({ message: "Choose an existing exam to enter marks." });
        }
        let resultExamId = examId;
        if (!resultExamId) {
            const date = new Date(examDate);
            const existingExam = yield prisma_1.default.exam.findFirst({
                where: { type: examType, date },
            });
            const exam = existingExam !== null && existingExam !== void 0 ? existingExam : yield prisma_1.default.exam.create({
                data: { name: `${examType} Exam`, type: examType, date },
            });
            resultExamId = exam.id;
        }
        const classroom = yield prisma_1.default.classroom.findUnique({
            where: { id: classId },
            select: { grade: true },
        });
        const selectedExam = yield prisma_1.default.exam.findUnique({
            where: { id: resultExamId },
            select: { subjectId: true, type: true, total: true },
        });
        if (!selectedExam) {
            return res.status(400).json({ message: "Selected exam was not found." });
        }
        if (subjectId && selectedExam.subjectId && subjectId !== selectedExam.subjectId) {
            return res.status(400).json({ message: "The subject does not match the selected exam." });
        }
        if (teacherId) {
            if (!selectedExam.subjectId || !classroom) {
                return res.status(403).json({ message: "Choose a valid class and your assigned subject exam." });
            }
            const [assignment, studentInClass] = yield Promise.all([
                prisma_1.default.teacherSubject.findUnique({
                    where: {
                        teacherId_subjectId: {
                            teacherId,
                            subjectId: selectedExam.subjectId,
                        },
                    },
                    select: { teacherId: true },
                }),
                prisma_1.default.classroomStudent.findUnique({
                    where: {
                        classroomId_studentId: { classroomId: classId, studentId },
                    },
                    select: { studentId: true },
                }),
            ]);
            if (!assignment) {
                return res.status(403).json({ message: "You can only enter marks for your assigned subjects." });
            }
            if (!studentInClass) {
                return res.status(400).json({ message: "The selected student is not in this classroom." });
            }
        }
        const marksError = validateMarks(marks, selectedExam.total);
        if (marksError) {
            return res.status(400).json({ message: marksError });
        }
        let defaultSubject = subjectId || (selectedExam === null || selectedExam === void 0 ? void 0 : selectedExam.subjectId) ? null : yield prisma_1.default.subject.findFirst({
            where: classroom ? { grade: classroom.grade } : undefined,
            orderBy: { name: "asc" },
        });
        if (!subjectId && !(selectedExam === null || selectedExam === void 0 ? void 0 : selectedExam.subjectId) && !defaultSubject) {
            defaultSubject = yield prisma_1.default.subject.findFirst({
                orderBy: { name: "asc" },
            });
        }
        if (!subjectId && !(selectedExam === null || selectedExam === void 0 ? void 0 : selectedExam.subjectId) && !defaultSubject) {
            defaultSubject = yield prisma_1.default.subject.create({
                data: {
                    name: "General Subject",
                    grade: (_a = classroom === null || classroom === void 0 ? void 0 : classroom.grade) !== null && _a !== void 0 ? _a : 1,
                    description: "Automatically created for result entry",
                },
            });
        }
        const resolvedSubjectId = (_b = subjectId !== null && subjectId !== void 0 ? subjectId : selectedExam === null || selectedExam === void 0 ? void 0 : selectedExam.subjectId) !== null && _b !== void 0 ? _b : defaultSubject.id;
        const duplicateResult = yield prisma_1.default.result.findFirst({
            where: {
                studentId,
                subjectId: resolvedSubjectId,
                exam: { is: { type: selectedExam.type } },
            },
        });
        if (duplicateResult) {
            return res.status(409).json({
                message: "This student already has a result for this subject and exam type.",
            });
        }
        const result = yield prisma_1.default.result.create({
            data: {
                studentId,
                classId,
                subjectId: resolvedSubjectId,
                examId: resultExamId,
                schoolYear,
                marks: Number(marks),
            },
            include: resultInclude,
        });
        return res.status(201).json({
            message: "Result created successfully",
            result,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.createResult = createResult;
const getResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teacherId = yield teacherIdForRequest(req);
        if (teacherId === "") {
            return res.status(403).json({ message: "Teacher account was not found." });
        }
        const results = yield prisma_1.default.result.findMany({
            where: teacherId
                ? { subject: { teachers: { some: { teacherId } } } }
                : undefined,
            orderBy: { id: "desc" },
            include: resultInclude,
        });
        return res.status(200).json({
            results: uniqueResults(results),
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.getResults = getResults;
const getResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teacherId = yield teacherIdForRequest(req);
        if (teacherId === "") {
            return res.status(403).json({ message: "Teacher account was not found." });
        }
        const id = String(req.params.id);
        const result = yield prisma_1.default.result.findUnique({
            where: { id },
            include: resultInclude,
        });
        if (!result) {
            return res.status(404).json({
                message: "Result not found",
            });
        }
        if (teacherId &&
            !(yield prisma_1.default.teacherSubject.findUnique({
                where: {
                    teacherId_subjectId: { teacherId, subjectId: result.subjectId },
                },
                select: { teacherId: true },
            }))) {
            return res.status(403).json({
                message: "You can only view results for your assigned subjects.",
            });
        }
        return res.status(200).json({ result });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.getResult = getResult;
const updateResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const { studentId, classId, subjectId, examId, schoolYear, marks, } = req.body;
        const existingResult = yield prisma_1.default.result.findUnique({
            where: { id },
            include: { exam: { select: { total: true } } },
        });
        if (!existingResult) {
            return res.status(404).json({
                message: "Result not found",
            });
        }
        if (marks !== undefined || examId !== undefined) {
            const exam = examId === undefined
                ? existingResult.exam
                : yield prisma_1.default.exam.findUnique({ where: { id: examId }, select: { total: true } });
            if (!exam) {
                return res.status(400).json({ message: "Selected exam was not found." });
            }
            const marksError = validateMarks(marks !== null && marks !== void 0 ? marks : existingResult.marks, exam.total);
            if (marksError) {
                return res.status(400).json({ message: marksError });
            }
        }
        const result = yield prisma_1.default.result.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (studentId !== undefined ? { studentId } : {})), (classId !== undefined ? { classId } : {})), (subjectId !== undefined ? { subjectId } : {})), (examId !== undefined ? { examId } : {})), (schoolYear !== undefined ? { schoolYear } : {})), (marks !== undefined ? { marks: Number(marks) } : {})),
            include: resultInclude,
        });
        return res.status(200).json({
            message: "Result updated successfully",
            result,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.updateResult = updateResult;
const deleteResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const result = yield prisma_1.default.result.findUnique({
            where: { id },
        });
        if (!result) {
            return res.status(404).json({
                message: "Result not found",
            });
        }
        yield prisma_1.default.result.delete({
            where: { id },
        });
        return res.status(200).json({
            message: "Result deleted successfully",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
});
exports.deleteResult = deleteResult;
const studentResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield prisma_1.default.result.findMany({
            where: {
                studentId: String(req.params.studentId),
            },
            orderBy: { id: "desc" },
            include: resultInclude,
        });
        return res.status(200).json(uniqueResults(results));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get student results",
        });
    }
});
exports.studentResults = studentResults;
const classResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teacherId = yield teacherIdForRequest(req);
        if (teacherId === "") {
            return res.status(403).json({ message: "Teacher account was not found." });
        }
        const results = yield prisma_1.default.result.findMany({
            where: Object.assign({ classId: String(req.params.classId) }, (teacherId
                ? { subject: { teachers: { some: { teacherId } } } }
                : {})),
            orderBy: { id: "desc" },
            include: resultInclude,
        });
        return res.status(200).json(results);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get class results",
        });
    }
});
exports.classResults = classResults;
