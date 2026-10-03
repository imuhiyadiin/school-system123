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
exports.requireOwnStudent = exports.requireStudent = exports.requireDashboardAccess = exports.requireApiPermission = exports.requireAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lip/prisma"));
const secret = process.env.SECRET_KEY;
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Bearer data
        const token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.startsWith("Bearer")) && req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "unAuthorized!."
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (decoded.role === "STUDENT") {
            const student = yield prisma_1.default.student.findUnique({ where: { id: decoded.id }, select: { id: true } });
            if (!student)
                return res.status(401).json({ message: "invalid token" });
            req.user = Object.assign(Object.assign({}, decoded), { role: "STUDENT", permissions: [] });
        }
        else {
            const user = yield prisma_1.default.user.findUnique({ where: { id: decoded.id }, select: { role: true, permissions: true } });
            if (!user)
                return res.status(401).json({ message: "invalid token" });
            req.user = Object.assign(Object.assign({}, decoded), { role: user.role, permissions: user.permissions });
        }
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401).json({
            message: "invalid token"
        });
    }
});
exports.verifyToken = verifyToken;
const requireAdmin = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "ADMIN") {
        return res.status(403).json({
            message: "Admin access is required",
        });
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireApiPermission = (req, res, next) => {
    var _a, _b, _c, _d, _e;
    const path = req.path;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === "ADMIN")
        return next();
    if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === "TEACHER") {
        const teacherReadablePrefixes = [
            "/auth/whoami",
            "/exam",
            "/result",
            "/subject",
            "/classroom",
            "/student",
            "/students",
        ];
        const allowedPrefix = teacherReadablePrefixes.find((prefix) => path === prefix || path.startsWith(`${prefix}/`));
        const readOnlyPrefix = ["/exam", "/subject", "/classroom", "/student", "/students"].some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
        if (!allowedPrefix || (readOnlyPrefix && req.method !== "GET")) {
            return res.status(403).json({ message: "Teachers can access exams and results only." });
        }
        return next();
    }
    if (!((_d = (_c = req.user) === null || _c === void 0 ? void 0 : _c.permissions) === null || _d === void 0 ? void 0 : _d.length))
        return next();
    const permissions = [
        ["/students", "/dashboud/students"], ["/student", "/dashboud/students"],
        ["/teacher", "/dashboud/teachers"], ["/classroom", "/dashboud/classrooms"],
        ["/subject", "/dashboud/subjects"], ["/exam", "/dashboud/exams"],
        ["/result", "/dashboud/results"], ["/attendance", "/dashboud/attendance"],
        ["/timetable", "/dashboud/timetable"], ["/fees", "/dashboud/fees"],
        ["/bus", "/dashboud/buses"],
        ["/payroll", "/dashboud/payroll"],
        ["/staff", "/dashboud/staff"],
        ["/issue", "/dashboud/issues"], ["/user", "/dashboud/users"],
    ];
    const required = (_e = permissions.find(([prefix]) => path.startsWith(prefix))) === null || _e === void 0 ? void 0 : _e[1];
    if (!required || req.user.permissions.includes(required))
        return next();
    return res.status(403).json({ message: "You are not authorized to access this page." });
};
exports.requireApiPermission = requireApiPermission;
const requireDashboardAccess = (req, res, next) => {
    var _a, _b;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "ADMIN" && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "TEACHER") {
        return res.status(403).json({
            message: "You are not authorized to access this dashboard",
        });
    }
    next();
};
exports.requireDashboardAccess = requireDashboardAccess;
const requireStudent = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "STUDENT")
        return res.status(403).json({ message: "Student access is required" });
    next();
};
exports.requireStudent = requireStudent;
const requireOwnStudent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const requestedId = String((_a = req.params.studentId) !== null && _a !== void 0 ? _a : req.params.id);
        const student = yield prisma_1.default.student.findUnique({ where: { id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id } });
        if (!student || requestedId !== student.id) {
            return res.status(403).json({ message: "You are not authorized to access this student record" });
        }
        next();
    }
    catch (_c) {
        res.status(500).json({ message: "Unable to verify student access" });
    }
});
exports.requireOwnStudent = requireOwnStudent;
