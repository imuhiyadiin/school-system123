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
exports.deleteTeacher = exports.updateTeacher = exports.getTeacher = exports.getAllTeachers = exports.loginTeacher = exports.createTeacher = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../lip/prisma"));
const generate_token_1 = require("../secure/generate-token");
// ===============================
// CREATE TEACHER
// ===============================
const createTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, username, fullName, gender, dob, phone, address, password, subjectIds, basicSalary, allowance, arrivalTime, } = req.body;
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        const normalizedUsername = typeof username === "string" ? username.trim() : "";
        const requiredFields = [
            ["email", normalizedEmail],
            ["username", normalizedUsername],
            ["fullName", fullName],
            ["gender", gender],
            ["dob", dob],
            ["password", password],
        ];
        const missingFields = requiredFields
            .filter(([, value]) => typeof value !== "string" || !value.trim())
            .map(([field]) => field);
        if (missingFields.length > 0 ||
            !Array.isArray(subjectIds) ||
            subjectIds.length === 0) {
            return res.status(400).json({
                message: missingFields.length > 0
                    ? `Missing teacher fields: ${missingFields.join(", ")}`
                    : "Select at least one teaching subject.",
            });
        }
        const selectedSubjectIds = [...new Set(subjectIds.map(String))];
        const availableSubjects = yield prisma_1.default.subject.findMany({
            where: {
                id: {
                    in: selectedSubjectIds,
                },
            },
            select: {
                id: true,
            },
        });
        if (availableSubjects.length !== selectedSubjectIds.length) {
            return res.status(400).json({
                message: "One or more selected subjects were not found",
            });
        }
        // Check existing email
        const existingEmail = yield prisma_1.default.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });
        if (existingEmail) {
            return res.status(400).json({
                message: "Email already exists",
            });
        }
        // Check existing username
        const existingUsername = yield prisma_1.default.user.findUnique({
            where: {
                username: normalizedUsername,
            },
        });
        if (existingUsername) {
            return res.status(400).json({
                message: "Username already exists",
            });
        }
        // Hash password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Create User + Teacher
        const teacher = yield prisma_1.default.teacher.create({
            data: Object.assign(Object.assign({ fullName,
                gender, dob: new Date(dob), phone,
                address, password: hashedPassword, basicSalary: basicSalary ? Number(basicSalary) : 0, allowance: allowance ? Number(allowance) : 0, arrivalTime: arrivalTime || null }, (selectedSubjectIds.length > 0
                ? {
                    subjects: {
                        create: selectedSubjectIds.map((subjectId) => ({
                            subject: {
                                connect: {
                                    id: subjectId,
                                },
                            },
                        })),
                    },
                }
                : {})), { user: {
                    create: {
                        email: normalizedEmail,
                        username: normalizedUsername,
                        password: hashedPassword,
                        role: "TEACHER",
                    },
                } }),
            include: {
                user: true,
                subjects: {
                    include: {
                        subject: true,
                    },
                },
            },
        });
        return res.status(201).json({
            message: "Teacher created successfully",
            teacher: {
                id: teacher.id,
                userId: teacher.userId,
                fullName: teacher.fullName,
                gender: teacher.gender,
                dob: teacher.dob,
                phone: teacher.phone,
                address: teacher.address,
                joinedAt: teacher.joinedAt,
                basicSalary: teacher.basicSalary,
                allowance: teacher.allowance,
                arrivalTime: teacher.arrivalTime,
                email: teacher.user.email,
                username: teacher.user.username,
                role: teacher.user.role,
                user: {
                    email: teacher.user.email,
                    username: teacher.user.username,
                },
                subjects: teacher.subjects,
            },
        });
    }
    catch (error) {
        console.error("Create Teacher Error:", error);
        return res.status(500).json({
            message: "Failed to create teacher",
            error,
        });
    }
});
exports.createTeacher = createTeacher;
// ===============================
// TEACHER LOGIN
// ===============================
const loginTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        if (!normalizedEmail || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }
        // Find teacher
        const teacher = yield prisma_1.default.teacher.findFirst({
            where: {
                user: {
                    email: normalizedEmail,
                    role: "TEACHER",
                },
            },
            include: {
                user: true,
            },
        });
        if (!teacher) {
            return res.status(401).json({
                message: "Invalid username or password",
            });
        }
        // Check password
        const isPasswordCorrect = (yield bcryptjs_1.default.compare(password, teacher.user.password)) ||
            (yield bcryptjs_1.default.compare(password, teacher.password));
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid username or password",
            });
        }
        // Generate JWT
        const token = (0, generate_token_1.generateToken)({
            id: teacher.user.id,
            email: teacher.user.email,
            role: teacher.user.role,
        });
        return res.status(200).json({
            message: "Teacher login successful",
            token,
            teacher: {
                id: teacher.id,
                userId: teacher.userId,
                fullName: teacher.fullName,
                gender: teacher.gender,
                dob: teacher.dob,
                phone: teacher.phone,
                address: teacher.address,
                joinedAt: teacher.joinedAt,
                basicSalary: teacher.basicSalary,
                allowance: teacher.allowance,
                arrivalTime: teacher.arrivalTime,
                email: teacher.user.email,
                username: teacher.user.username,
                role: teacher.user.role,
            },
        });
    }
    catch (error) {
        console.error("Teacher Login Error:", error);
        return res.status(500).json({
            message: "Teacher login failed",
            error,
        });
    }
});
exports.loginTeacher = loginTeacher;
// ===============================
// GET ALL TEACHERS
// ===============================
const getAllTeachers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teachers = yield prisma_1.default.teacher.findMany({
            include: {
                user: true,
                subjects: {
                    include: {
                        subject: true,
                    },
                },
                classrooms: true,
                payrolls: true,
                attendances: true,
            },
            orderBy: {
                joinedAt: "desc",
            },
        });
        const data = teachers.map((teacher) => ({
            id: teacher.id,
            userId: teacher.userId,
            fullName: teacher.fullName,
            gender: teacher.gender,
            dob: teacher.dob,
            phone: teacher.phone,
            address: teacher.address,
            joinedAt: teacher.joinedAt,
            basicSalary: teacher.basicSalary,
            allowance: teacher.allowance,
            arrivalTime: teacher.arrivalTime,
            email: teacher.user.email,
            username: teacher.user.username,
            role: teacher.user.role,
            user: {
                email: teacher.user.email,
                username: teacher.user.username,
            },
            subjects: teacher.subjects,
            classrooms: teacher.classrooms,
            payrolls: teacher.payrolls,
            attendances: teacher.attendances,
        }));
        return res.status(200).json({
            message: "Teachers fetched successfully",
            count: data.length,
            teachers: data,
        });
    }
    catch (error) {
        console.error("Get All Teachers Error:", error);
        return res.status(500).json({
            message: "Failed to get teachers",
            error,
        });
    }
});
exports.getAllTeachers = getAllTeachers;
// ===============================
// GET ONE TEACHER
// ===============================
const getTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const teacher = yield prisma_1.default.teacher.findUnique({
            where: {
                id,
            },
            include: {
                user: true,
                subjects: {
                    include: {
                        subject: true,
                    },
                },
                classrooms: true,
                payrolls: true,
                attendances: true,
            },
        });
        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found",
            });
        }
        return res.status(200).json({
            message: "Teacher fetched successfully",
            teacher: {
                id: teacher.id,
                userId: teacher.userId,
                fullName: teacher.fullName,
                gender: teacher.gender,
                dob: teacher.dob,
                phone: teacher.phone,
                address: teacher.address,
                joinedAt: teacher.joinedAt,
                basicSalary: teacher.basicSalary,
                allowance: teacher.allowance,
                arrivalTime: teacher.arrivalTime,
                email: teacher.user.email,
                username: teacher.user.username,
                role: teacher.user.role,
                user: {
                    email: teacher.user.email,
                    username: teacher.user.username,
                },
                subjects: teacher.subjects,
                classrooms: teacher.classrooms,
                payrolls: teacher.payrolls,
                attendances: teacher.attendances,
            },
        });
    }
    catch (error) {
        console.error("Get Teacher Error:", error);
        return res.status(500).json({
            message: "Failed to get teacher",
            error,
        });
    }
});
exports.getTeacher = getTeacher;
// ===============================
// UPDATE TEACHER
// ===============================
const updateTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const { email, username, fullName, gender, dob, phone, address, password, basicSalary, allowance, arrivalTime, subjectIds, } = req.body;
        // Find teacher
        const existingTeacher = yield prisma_1.default.teacher.findUnique({
            where: {
                id,
            },
            include: {
                user: true,
            },
        });
        if (!existingTeacher) {
            return res.status(404).json({
                message: "Teacher not found",
            });
        }
        // Prepare teacher data
        const teacherData = {};
        if (fullName !== undefined) {
            teacherData.fullName = fullName;
        }
        if (gender !== undefined) {
            teacherData.gender = gender;
        }
        if (dob !== undefined) {
            teacherData.dob = new Date(dob);
        }
        if (phone !== undefined) {
            teacherData.phone = phone;
        }
        if (address !== undefined) {
            teacherData.address = address;
        }
        if (basicSalary !== undefined) {
            teacherData.basicSalary = Number(basicSalary);
        }
        if (allowance !== undefined) {
            teacherData.allowance = Number(allowance);
        }
        if (arrivalTime !== undefined) {
            teacherData.arrivalTime = arrivalTime;
        }
        if (subjectIds !== undefined) {
            if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
                return res.status(400).json({
                    message: "Select at least one teaching subject",
                });
            }
            const selectedSubjectIds = [...new Set(subjectIds)];
            const availableSubjects = yield prisma_1.default.subject.findMany({
                where: {
                    id: {
                        in: selectedSubjectIds,
                    },
                },
                select: {
                    id: true,
                },
            });
            if (availableSubjects.length !== selectedSubjectIds.length) {
                return res.status(400).json({
                    message: "One or more selected subjects were not found",
                });
            }
            teacherData.subjects = {
                deleteMany: {},
                create: selectedSubjectIds.map((subjectId) => ({
                    subject: {
                        connect: {
                            id: subjectId,
                        },
                    },
                })),
            };
        }
        // Update password
        if (password) {
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            teacherData.password = hashedPassword;
            yield prisma_1.default.user.update({
                where: {
                    id: existingTeacher.userId,
                },
                data: {
                    password: hashedPassword,
                },
            });
        }
        // Update User
        const userData = {};
        if (email !== undefined) {
            userData.email = email;
        }
        if (username !== undefined) {
            userData.username = username;
        }
        if (Object.keys(userData).length > 0) {
            yield prisma_1.default.user.update({
                where: {
                    id: existingTeacher.userId,
                },
                data: userData,
            });
        }
        // Update Teacher
        const updatedTeacher = yield prisma_1.default.teacher.update({
            where: {
                id,
            },
            data: teacherData,
            include: {
                user: true,
            },
        });
        return res.status(200).json({
            message: "Teacher updated successfully",
            teacher: {
                id: updatedTeacher.id,
                userId: updatedTeacher.userId,
                fullName: updatedTeacher.fullName,
                gender: updatedTeacher.gender,
                dob: updatedTeacher.dob,
                phone: updatedTeacher.phone,
                address: updatedTeacher.address,
                joinedAt: updatedTeacher.joinedAt,
                basicSalary: updatedTeacher.basicSalary,
                allowance: updatedTeacher.allowance,
                arrivalTime: updatedTeacher.arrivalTime,
                email: updatedTeacher.user.email,
                username: updatedTeacher.user.username,
                role: updatedTeacher.user.role,
            },
        });
    }
    catch (error) {
        console.error("Update Teacher Error:", error);
        return res.status(500).json({
            message: "Failed to update teacher",
            error,
        });
    }
});
exports.updateTeacher = updateTeacher;
// ===============================
// DELETE TEACHER
// ===============================
const deleteTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const teacher = yield prisma_1.default.teacher.findUnique({
            where: {
                id,
            },
        });
        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found",
            });
        }
        // Because User relation has onDelete: Cascade,
        // deleting User will also delete Teacher.
        yield prisma_1.default.user.delete({
            where: {
                id: teacher.userId,
            },
        });
        return res.status(200).json({
            message: "Teacher deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete Teacher Error:", error);
        return res.status(500).json({
            message: "Failed to delete teacher",
            error,
        });
    }
});
exports.deleteTeacher = deleteTeacher;
