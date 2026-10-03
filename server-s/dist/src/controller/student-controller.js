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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.updateStudent = exports.getStudentOverview = exports.getStudent = exports.getStudents = exports.studentLogin = exports.createStudent = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../lip/prisma"));
const generate_token_1 = require("../secure/generate-token");
const nextStudentID = () => __awaiter(void 0, void 0, void 0, function* () {
    const students = yield prisma_1.default.student.findMany({ select: { studentID: true } });
    const highestID = students.reduce((highest, student) => {
        const id = Number(student.studentID);
        return Number.isInteger(id) && id >= 1000 ? Math.max(highest, id) : highest;
    }, 999);
    return String(highestID + 1);
});
const createStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, gender, dob, phone, address, parentName, parentPhone, password, classroomId, totalFee, busId, } = req.body;
        if (!address ||
            !parentName ||
            !parentPhone ||
            !phone ||
            !fullName ||
            !gender ||
            !dob ||
            !password ||
            !classroomId) {
            return res.status(400).json({
                message: "Complete student data",
            });
        }
        const parsedTotalFee = Number(totalFee);
        if (!Number.isFinite(parsedTotalFee) || parsedTotalFee < 0) {
            return res.status(400).json({ message: "A valid total fee is required" });
        }
        const hash = bcryptjs_1.default.hashSync(password, 10);
        // The unique constraint protects this sequence if two students are created at once.
        // On the unlikely collision, calculate the next available ID and try again.
        let student;
        for (let attempt = 0; attempt < 3; attempt += 1) {
            const studentID = yield nextStudentID();
            try {
                student = yield prisma_1.default.student.create({
                    data: Object.assign(Object.assign({ studentID,
                        fullName, password: hash, gender, dob: new Date(dob), phone: phone, address: address, parentName: parentName, parentPhone: parentPhone, totalFee: parsedTotalFee }, (busId ? { busId: String(busId) } : {})), { classrooms: {
                            create: { classroomId },
                        } }),
                });
                break;
            }
            catch (error) {
                const code = error.code;
                if (code !== "P2002" || attempt === 2)
                    throw error;
            }
        }
        res.status(201).json({ student });
    }
    catch (_a) {
        res.status(500).json({
            message: "Failed to create student",
        });
    }
});
exports.createStudent = createStudent;
const studentLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone, password } = req.body;
        const studentPhone = typeof phone === "string" ? phone.trim() : "";
        if (!studentPhone || typeof password !== "string" || !password) {
            return res.status(400).json({
                message: "Phone and password are required",
            });
        }
        const students = (yield prisma_1.default.student.findMany({
            where: {
                phone: studentPhone,
            },
            include: {
                classrooms: {
                    include: {
                        classroom: true,
                    },
                },
            },
        }));
        for (const student of students) {
            if (!bcryptjs_1.default.compareSync(password, student.password))
                continue;
            const token = (0, generate_token_1.generateToken)({
                id: student.id,
                email: `student-${student.id}@school.local`,
                role: "STUDENT",
            });
            return res.status(200).json({
                message: "Login successful",
                token,
                student: {
                    id: student.id,
                    fullName: student.fullName,
                    gender: student.gender,
                    phone: student.phone,
                    address: student.address,
                    parentName: student.parentName,
                    role: "STUDENT",
                    classrooms: student.classrooms,
                },
            });
        }
        return res.status(401).json({
            message: "Invalid phone number or password",
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Student login failed",
        });
    }
});
exports.studentLogin = studentLogin;
const getStudents = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield prisma_1.default.student.findMany({
            orderBy: { admissionDate: "desc" },
            include: {
                classrooms: {
                    include: {
                        classroom: true,
                    },
                },
                bus: true,
            },
        });
        res.json({
            result: students.map((_a) => {
                var { password } = _a, student = __rest(_a, ["password"]);
                void password;
                return student;
            }),
        });
    }
    catch (_a) {
        res.status(500).json({
            message: "Failed to get students",
        });
    }
});
exports.getStudents = getStudents;
const getStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const student = yield prisma_1.default.student.findFirst({
            where: {
                id,
            },
            include: {
                classrooms: {
                    include: {
                        classroom: true,
                    },
                },
                bus: true,
            },
        });
        if (!student) {
            return res.status(404).json({
                message: "Student not found",
            });
        }
        const { password } = student, studentData = __rest(student, ["password"]);
        void password;
        res.json({ student: studentData });
    }
    catch (_a) {
        res.status(500).json({
            message: "Failed to get student",
        });
    }
});
exports.getStudent = getStudent;
const getStudentOverview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const studentId = String(req.params.id);
        const student = yield prisma_1.default.student.findUnique({
            where: { id: studentId },
            select: {
                payments: { orderBy: { paymentDate: "desc" } },
                attendances: { orderBy: { date: "asc" } },
                results: {
                    orderBy: { id: "desc" },
                    include: { subject: true, exam: true },
                },
            },
        });
        if (!student)
            return res.status(404).json({ message: "Student not found" });
        return res.json(student);
    }
    catch (_a) {
        return res.status(500).json({ message: "Failed to get student overview" });
    }
});
exports.getStudentOverview = getStudentOverview;
const updateStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, gender, dob, phone, address, parentName, parentPhone, password, classroomId, studentID, totalFee, busId, } = req.body;
        res.json({
            student: yield prisma_1.default.student.update({
                where: {
                    id: String(req.params.id),
                },
                data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (fullName !== undefined ? { fullName } : {})), (gender !== undefined ? { gender } : {})), (dob !== undefined
                    ? { dob: new Date(dob) }
                    : {})), (phone !== undefined
                    ? { phone }
                    : {})), (address !== undefined
                    ? { address }
                    : {})), (parentName !== undefined
                    ? { parentName }
                    : {})), (parentPhone !== undefined
                    ? { parentPhone }
                    : {})), (studentID !== undefined
                    ? {
                        studentID: String(studentID).trim(),
                    }
                    : {})), (totalFee !== undefined
                    ? { totalFee: Number(totalFee) }
                    : {})), (busId !== undefined
                    ? { busId: String(busId).trim() || null }
                    : {})), (password
                    ? {
                        password: bcryptjs_1.default.hashSync(password, 10),
                    }
                    : {})), (classroomId !== undefined
                    ? {
                        classrooms: {
                            deleteMany: {},
                            create: { classroomId },
                        },
                    }
                    : {})),
            }),
        });
    }
    catch (_a) {
        res.status(500).json({
            message: "Failed to update student",
        });
    }
});
exports.updateStudent = updateStudent;
const deleteStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const student = yield prisma_1.default.student.findUnique({ where: { id: String(req.params.id) } });
        if (!student) {
            return res.status(404).json({
                message: "Student not found",
            });
        }
        yield prisma_1.default.student.delete({ where: { id: student.id } });
        res.json({
            message: "Student deleted successfully",
        });
    }
    catch (_a) {
        res.status(500).json({
            message: "Failed to delete student",
        });
    }
});
exports.deleteStudent = deleteStudent;
