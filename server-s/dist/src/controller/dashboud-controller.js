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
exports.deleteUser = exports.changeRole = exports.getUsers = exports.getDashboard = void 0;
const prisma_1 = __importDefault(require("../lip/prisma"));
const getDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const [users, students, teachers, classrooms, subjects, exams, results, attendance, issues, timetable, buses, studentsWithBus, studentFees, teacherSalaries, staffSalaries, recentResults, recentAttendance, recentIssues] = yield Promise.all([
            prisma_1.default.user.count(),
            prisma_1.default.student.count(),
            prisma_1.default.teacher.count(),
            prisma_1.default.classroom.count(),
            prisma_1.default.subject.count(),
            prisma_1.default.exam.count(),
            prisma_1.default.result.count(),
            prisma_1.default.attendance.count(),
            prisma_1.default.issue.count(),
            prisma_1.default.timetable.count(),
            prisma_1.default.bus.count(),
            prisma_1.default.student.count({ where: { busId: { not: null } } }),
            prisma_1.default.student.aggregate({ _sum: { totalFee: true } }),
            prisma_1.default.teacher.aggregate({ _sum: { basicSalary: true } }),
            prisma_1.default.employee.aggregate({ _sum: { basicSalary: true } }),
            prisma_1.default.result.findMany({ orderBy: { id: "desc" }, take: 5 }),
            prisma_1.default.attendance.findMany({ orderBy: { date: "desc" }, take: 5 }),
            prisma_1.default.issue.findMany({ orderBy: { id: "desc" }, take: 5 }),
        ]);
        res.status(200).json({
            users,
            students,
            teachers,
            classrooms,
            subjects,
            exams,
            results,
            attendance,
            issues,
            timetable,
            buses,
            studentsWithBus,
            totalFees: (_a = studentFees._sum.totalFee) !== null && _a !== void 0 ? _a : 0,
            totalBasicSalary: ((_b = teacherSalaries._sum.basicSalary) !== null && _b !== void 0 ? _b : 0) +
                ((_c = staffSalaries._sum.basicSalary) !== null && _c !== void 0 ? _c : 0),
            recentResults,
            recentAttendance,
            recentIssues,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to get dashboard data" });
    }
});
exports.getDashboard = getDashboard;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.default.user.findMany();
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to get users" });
    }
});
exports.getUsers = getUsers;
const changeRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.default.user.update({
            where: {
                id: String(req.params.id),
            },
            data: {
                role: req.body.role,
            },
        });
        res.status(200).json({
            message: "User role changed successfully",
            user,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to change user role" });
    }
});
exports.changeRole = changeRole;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.user.delete({
            where: {
                id: String(req.params.id),
            },
        });
        res.status(200).json({
            message: "User deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete user" });
    }
});
exports.deleteUser = deleteUser;
