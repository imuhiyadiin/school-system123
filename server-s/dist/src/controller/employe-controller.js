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
exports.deleteEmployee = exports.updateEmployee = exports.getEmployeeSalaryHistory = exports.getEmployee = exports.getEmployees = exports.createEmployee = void 0;
const prisma_1 = __importDefault(require("../lip/prisma"));
// Create Employee
const createEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, fullName, email, phone, gender, dob, address, position, department, joinedAt, basicSalary, allowance, status, } = req.body;
        if (!employeeId ||
            !fullName ||
            !email ||
            !position ||
            !department) {
            return res.status(400).json({
                message: "Complete employee data",
            });
        }
        const employee = yield prisma_1.default.employee.create({
            data: {
                employeeId,
                fullName,
                email,
                phone: phone || null,
                gender: gender || null,
                dob: dob ? new Date(dob) : null,
                address: address || null,
                position,
                department,
                joinedAt: joinedAt ? new Date(joinedAt) : new Date(),
                basicSalary: basicSalary !== undefined &&
                    Number.isFinite(Number(basicSalary))
                    ? Number(basicSalary)
                    : 0,
                allowance: allowance !== undefined &&
                    Number.isFinite(Number(allowance))
                    ? Number(allowance)
                    : 0,
                status: status || "ACTIVE",
            },
        });
        res.status(201).json({ employee });
    }
    catch (error) {
        if (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002") {
            return res.status(409).json({
                message: "Employee ID or email already exists",
            });
        }
        res.status(500).json({
            message: "Failed to create employee",
        });
    }
});
exports.createEmployee = createEmployee;
// Get All Employees
const getEmployees = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma_1.default.employee.findMany({
            orderBy: { joinedAt: "desc" },
        });
        res.json({ result });
    }
    catch (_a) {
        res.status(500).json({
            message: "Failed to get employees",
        });
    }
});
exports.getEmployees = getEmployees;
// Get Single Employee
const getEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employee = yield prisma_1.default.employee.findUnique({
            where: {
                id: String(req.params.id),
            },
        });
        if (!employee) {
            return res.status(404).json({
                message: "Employee not found",
            });
        }
        res.json({ employee });
    }
    catch (_a) {
        res.status(500).json({
            message: "Failed to get employee",
        });
    }
});
exports.getEmployee = getEmployee;
// Get Employee Salary History
const getEmployeeSalaryHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payrolls = yield prisma_1.default.payroll.findMany({
            where: { staffId: String(req.params.id) },
            orderBy: { createdAt: "asc" },
        });
        const salaryHistory = payrolls.map((payroll, index) => {
            var _a;
            return ({
                id: payroll.id,
                basicSalary: payroll.basicSalary,
                previousSalary: index > 0 ? payrolls[index - 1].basicSalary : null,
                allowance: payroll.allowance,
                effectiveDate: (_a = payroll.paymentDate) !== null && _a !== void 0 ? _a : payroll.createdAt,
                reason: payroll.note,
            });
        });
        res.json({ salaryHistory });
    }
    catch (_a) {
        res.status(500).json({
            message: "Failed to get employee salary history",
        });
    }
});
exports.getEmployeeSalaryHistory = getEmployeeSalaryHistory;
// Update Employee
const updateEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, fullName, email, phone, gender, dob, address, position, department, joinedAt, basicSalary, allowance, status, } = req.body;
        const employee = yield prisma_1.default.employee.update({
            where: {
                id: String(req.params.id),
            },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (employeeId !== undefined && { employeeId })), (fullName !== undefined && { fullName })), (email !== undefined && { email })), (phone !== undefined && { phone })), (gender !== undefined && { gender })), (dob !== undefined && {
                dob: new Date(dob),
            })), (address !== undefined && { address })), (position !== undefined && { position })), (department !== undefined && { department })), (joinedAt !== undefined && {
                joinedAt: new Date(joinedAt),
            })), (basicSalary !== undefined &&
                Number.isFinite(Number(basicSalary)) && {
                basicSalary: Number(basicSalary),
            })), (allowance !== undefined &&
                Number.isFinite(Number(allowance)) && {
                allowance: Number(allowance),
            })), (status !== undefined && { status })),
        });
        res.json({ employee });
    }
    catch (error) {
        if (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002") {
            return res.status(409).json({
                message: "Employee ID or email already exists",
            });
        }
        res.status(500).json({
            message: "Failed to update employee",
        });
    }
});
exports.updateEmployee = updateEmployee;
// Delete Employee
const deleteEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employee = yield prisma_1.default.employee.findUnique({
            where: {
                id: String(req.params.id),
            },
        });
        if (!employee) {
            return res.status(404).json({
                message: "Employee not found",
            });
        }
        yield prisma_1.default.employee.delete({
            where: {
                id: String(req.params.id),
            },
        });
        res.json({
            message: "Employee deleted successfully",
        });
    }
    catch (_a) {
        res.status(500).json({
            message: "Failed to delete employee",
        });
    }
});
exports.deleteEmployee = deleteEmployee;
