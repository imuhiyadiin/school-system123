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
exports.logout = exports.studentLogin = exports.chanegRole = exports.allUsers = exports.deleteUser = exports.updateUser = exports.whoami = exports.userLogin = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../lip/prisma"));
const generate_token_1 = require("../secure/generate-token");
// register user
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, password, email, role, permissions } = req.body;
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        const normalizedName = typeof name === "string" ? name.trim() : "";
        if (!normalizedName || typeof password !== "string" || !password.length || !normalizedEmail) {
            return res.status(400).json({
                message: "complete data name,email and password",
                status: 400,
            });
        }
        const checkEmail = yield prisma_1.default.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });
        if (checkEmail) {
            return res.status(400).json({
                message: "user email is already exist!..",
                status: 400,
            });
        }
        const passwordHash = bcryptjs_1.default.hashSync(password);
        // create data
        // findFirst where
        // update data where
        // delete where
        const selectedRole = role === "ADMIN"
            || role === "TEACHER"
            || role === "User"
            ? role
            : "STUDENT";
        const allowedPermissions = ["/dashboud/students", "/dashboud/teachers", "/dashboud/classrooms", "/dashboud/subjects", "/dashboud/exams", "/dashboud/results", "/dashboud/attendance", "/dashboud/timetable", "/dashboud/buses", "/dashboud/fees", "/dashboud/staff", "/dashboud/payroll", "/dashboud/issues", "/dashboud/users"];
        const selectedPermissions = Array.isArray(permissions)
            ? permissions.filter((permission) => typeof permission === "string" && allowedPermissions.includes(permission))
            : [];
        const newUser = yield prisma_1.default.user.create({
            data: {
                email: normalizedEmail,
                username: normalizedName,
                password: passwordHash,
                role: selectedRole,
                permissions: selectedPermissions,
            },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
                role: true,
                permissions: true,
            },
        });
        const access_token = (0, generate_token_1.generateToken)({
            email: newUser.email,
            id: newUser.id,
            role: newUser.role,
        });
        res.json({
            message: "user created success ✔️",
            user: Object.assign(Object.assign({}, newUser), { fullName: newUser.username, access_token }),
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "server error",
            status: 500,
        });
    }
});
exports.registerUser = registerUser;
// login user
const userLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        if (!normalizedEmail || typeof password !== "string" || !password.length) {
            return res.status(400).json({
                message: "enter your email and password",
                status: 400,
            });
        }
        const user = yield prisma_1.default.user.findFirst({
            where: { email: normalizedEmail },
        });
        if (!user) {
            return res.status(401).json({
                message: "wrong credentials!.",
                status: 401,
            });
        }
        const dehashPass = bcryptjs_1.default.compareSync(password, user === null || user === void 0 ? void 0 : user.password);
        if (!dehashPass) {
            return res.status(401).json({
                message: "wrong credentials!.",
                status: 401,
            });
        }
        const userData = {
            id: user.id,
            email: user.email,
            fullName: user.username,
            createdAt: user.createdAt,
            role: user.role,
            permissions: user.permissions,
            access_token: (0, generate_token_1.generateToken)({
                email: user.email,
                id: user.id,
                role: user.role,
            }),
        };
        res.json({
            message: "successfully loged!.",
            user: userData,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "server error",
            status: 500,
        });
    }
});
exports.userLogin = userLogin;
// whoami
const whoami = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = yield prisma_1.default.user.findFirst({
            where: { id: req.user.id },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                permissions: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.json({
            message: "operation success",
            user,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "sever error",
            error,
        });
    }
});
exports.whoami = whoami;
// update user
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { fullname, name, email, password, role, permissions } = req.body;
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const updatedName = String((_a = fullname !== null && fullname !== void 0 ? fullname : name) !== null && _a !== void 0 ? _a : "").trim();
        const updatedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        const validRoles = ["ADMIN", "TEACHER", "STUDENT", "CASHIER", "User"];
        if (!id || (!updatedName && !updatedEmail && !password && !role && !Array.isArray(permissions))) {
            return res.status(400).json({
                message: "Provide at least one user field to update.",
            });
        }
        const user = yield prisma_1.default.user.findFirst({
            where: { id },
        });
        if (!user) {
            return res.status(404).json({
                message: "User Not Found!!!.",
            });
        }
        if (updatedEmail && updatedEmail !== user.email) {
            const existingEmail = yield prisma_1.default.user.findUnique({ where: { email: updatedEmail } });
            if (existingEmail && existingEmail.id !== id)
                return res.status(409).json({ message: "That email is already used by another account." });
        }
        if (role && !validRoles.includes(role))
            return res.status(400).json({ message: "Invalid user role." });
        if (password !== undefined && (typeof password !== "string" || !password.length))
            return res.status(400).json({ message: "Password cannot be empty." });
        const updatedUser = yield prisma_1.default.user.update({
            where: {
                id,
            },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (updatedName ? { username: updatedName } : {})), (updatedEmail ? { email: updatedEmail } : {})), (password ? { password: bcryptjs_1.default.hashSync(password, 10) } : {})), (role ? { role } : {})), (Array.isArray(permissions)
                ? {
                    permissions: permissions.filter((permission) => typeof permission === "string" &&
                        ["/dashboud/students", "/dashboud/teachers", "/dashboud/classrooms", "/dashboud/subjects", "/dashboud/exams", "/dashboud/results", "/dashboud/attendance", "/dashboud/timetable", "/dashboud/buses", "/dashboud/fees", "/dashboud/staff", "/dashboud/payroll", "/dashboud/issues", "/dashboud/users"].includes(permission)),
                }
                : {})),
            select: { id: true, username: true, email: true, role: true, permissions: true },
        });
        res.json({
            message: "user updated success",
            user: updatedUser,
        });
    }
    catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002")
            return res.status(409).json({ message: "That email or username is already used by another account." });
        res.status(500).json({
            message: "server error",
        });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = String(req.params.id);
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === id)
            return res.status(400).json({ message: "You cannot delete your own account" });
        yield prisma_1.default.user.delete({ where: { id } });
        res.json({ message: "User deleted successfully" });
    }
    catch (_b) {
        res.status(500).json({ message: "Failed to delete user" });
    }
});
exports.deleteUser = deleteUser;
// get all users
const allUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.default.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.json({
            result: [...users],
        });
    }
    catch (error) {
        res.status(500).json({
            message: "server error",
            error,
        });
    }
});
exports.allUsers = allUsers;
// change role
const chanegRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id, role } = req.body;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "ADMIN") {
            return res.status(405).json({
                message: "not have permission to change role",
            });
        }
        if (!id || !role) {
            return res.status(400).json({
                message: "complete info",
            });
        }
        const user = yield prisma_1.default.user.findFirst({
            where: { id },
        });
        if (!user) {
            return res.status(404).json({
                message: "User Not Found",
            });
        }
        const updateRole = yield prisma_1.default.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        res.json({
            message: "user role changed success",
            result: updateRole,
        });
    }
    catch (error) {
        error;
    }
});
exports.chanegRole = chanegRole;
const studentLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Enter your username and password" });
        }
        const user = yield prisma_1.default.user.findFirst({
            where: { OR: [{ username }, { email: username }] },
        });
        if (!user || user.role !== "STUDENT" || !bcryptjs_1.default.compareSync(password, user.password)) {
            return res.status(401).json({ message: "Student credentials are incorrect" });
        }
        const access_token = (0, generate_token_1.generateToken)({ id: user.id, email: user.email, role: user.role });
        res.json({
            message: "Student signed in successfully",
            user: { id: user.id, email: user.email, fullName: user.username, role: user.role, access_token },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to sign in student" });
    }
});
exports.studentLogin = studentLogin;
const logout = (_req, res) => {
    res.json({ message: "Signed out successfully" });
};
exports.logout = logout;
