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
exports.deletePayroll = exports.updatePayroll = exports.getPayroll = exports.getPayrollReports = exports.getPayrolls = exports.createPayroll = void 0;
const prisma_1 = __importDefault(require("../lip/prisma"));
// Create Payroll
const createPayroll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherId, staffId, month, year, basicSalary, allowance, deduction, advance, status, paymentDate, paymentMethod, note, } = req.body;
        if (!month ||
            !year ||
            basicSalary === undefined) {
            return res.status(400).json({
                message: "Complete payroll data",
            });
        }
        if (!teacherId && !staffId) {
            return res.status(400).json({
                message: "Teacher or staff is required",
            });
        }
        if (teacherId && staffId) {
            return res.status(400).json({
                message: "Select either teacher or staff",
            });
        }
        const basic = Number(basicSalary);
        const allow = Number(allowance || 0);
        const deduct = Number(deduction || 0);
        const adv = Number(advance || 0);
        const netSalary = basic + allow - deduct - adv;
        const payroll = yield prisma_1.default.payroll.create({
            data: {
                teacherId: teacherId || null,
                staffId: staffId || null,
                month: Number(month),
                year: Number(year),
                basicSalary: basic,
                allowance: allow,
                deduction: deduct,
                advance: adv,
                netSalary,
                status: status || "PENDING",
                paymentDate: paymentDate
                    ? new Date(paymentDate)
                    : null,
                paymentMethod: paymentMethod || null,
                note: note || null,
            },
        });
        res.status(201).json({ payroll });
    }
    catch (_a) {
        res.status(500).json({
            message: "Failed to create payroll",
        });
    }
});
exports.createPayroll = createPayroll;
// Get All Payrolls
const getPayrolls = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma_1.default.payroll.findMany({
            orderBy: [
                { year: "desc" },
                { month: "desc" },
            ],
            include: {
                teacher: true,
                staff: true,
            },
        });
        res.json({ result });
    }
    catch (_a) {
        res.status(500).json({
            message: "Failed to get payrolls",
        });
    }
});
exports.getPayrolls = getPayrolls;
// Get Monthly Payroll Reports
const getPayrollReports = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const payrolls = yield prisma_1.default.payroll.findMany({
            select: {
                month: true,
                year: true,
                basicSalary: true,
                allowance: true,
                deduction: true,
                netSalary: true,
                status: true,
            },
            orderBy: [{ year: "desc" }, { month: "desc" }],
        });
        const grouped = new Map();
        for (const payroll of payrolls) {
            const key = `${payroll.year}-${payroll.month}`;
            const report = (_a = grouped.get(key)) !== null && _a !== void 0 ? _a : {
                month: payroll.month,
                year: payroll.year,
                totalEmployees: 0,
                totalBasicSalary: 0,
                totalAllowance: 0,
                totalDeduction: 0,
                totalNetSalary: 0,
                paymentStatus: "PAID",
                paid: true,
            };
            report.totalEmployees += 1;
            report.totalBasicSalary += payroll.basicSalary;
            report.totalAllowance += payroll.allowance;
            report.totalDeduction += payroll.deduction;
            report.totalNetSalary += payroll.netSalary;
            report.paid = report.paid && payroll.status === "PAID";
            report.paymentStatus = report.paid ? "PAID" : "PENDING";
            grouped.set(key, report);
        }
        const reports = Array.from(grouped.values()).map((_a) => {
            var { paid: _paid } = _a, report = __rest(_a, ["paid"]);
            return report;
        });
        res.json({ reports });
    }
    catch (_b) {
        res.status(500).json({
            message: "Failed to get payroll reports",
        });
    }
});
exports.getPayrollReports = getPayrollReports;
// Get Single Payroll
const getPayroll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payroll = yield prisma_1.default.payroll.findUnique({
            where: {
                id: String(req.params.id),
            },
            include: {
                teacher: true,
                staff: true,
            },
        });
        if (!payroll) {
            return res.status(404).json({
                message: "Payroll not found",
            });
        }
        res.json({ payroll });
    }
    catch (_a) {
        res.status(500).json({
            message: "Failed to get payroll",
        });
    }
});
exports.getPayroll = getPayroll;
// Update Payroll
const updatePayroll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherId, staffId, month, year, basicSalary, allowance, deduction, advance, status, paymentDate, paymentMethod, note, } = req.body;
        const currentPayroll = yield prisma_1.default.payroll.findUnique({
            where: {
                id: String(req.params.id),
            },
        });
        if (!currentPayroll) {
            return res.status(404).json({
                message: "Payroll not found",
            });
        }
        const basic = basicSalary !== undefined
            ? Number(basicSalary)
            : currentPayroll.basicSalary;
        const allow = allowance !== undefined
            ? Number(allowance)
            : currentPayroll.allowance;
        const deduct = deduction !== undefined
            ? Number(deduction)
            : currentPayroll.deduction;
        const adv = advance !== undefined
            ? Number(advance)
            : currentPayroll.advance;
        const netSalary = basic + allow - deduct - adv;
        const payroll = yield prisma_1.default.payroll.update({
            where: {
                id: String(req.params.id),
            },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (teacherId !== undefined && {
                teacherId: teacherId || null,
            })), (staffId !== undefined && {
                staffId: staffId || null,
            })), (month !== undefined && {
                month: Number(month),
            })), (year !== undefined && {
                year: Number(year),
            })), (basicSalary !== undefined && {
                basicSalary: Number(basicSalary),
            })), (allowance !== undefined && {
                allowance: Number(allowance),
            })), (deduction !== undefined && {
                deduction: Number(deduction),
            })), (advance !== undefined && {
                advance: Number(advance),
            })), { netSalary }), (status !== undefined && {
                status,
            })), (paymentDate !== undefined && {
                paymentDate: paymentDate
                    ? new Date(paymentDate)
                    : null,
            })), (paymentMethod !== undefined && {
                paymentMethod,
            })), (note !== undefined && {
                note,
            })),
        });
        res.json({ payroll });
    }
    catch (_a) {
        res.status(500).json({
            message: "Failed to update payroll",
        });
    }
});
exports.updatePayroll = updatePayroll;
// Delete Payroll
const deletePayroll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payroll = yield prisma_1.default.payroll.findUnique({
            where: {
                id: String(req.params.id),
            },
        });
        if (!payroll) {
            return res.status(404).json({
                message: "Payroll not found",
            });
        }
        yield prisma_1.default.payroll.delete({
            where: {
                id: String(req.params.id),
            },
        });
        res.json({
            message: "Payroll deleted successfully",
        });
    }
    catch (_a) {
        res.status(500).json({
            message: "Failed to delete payroll",
        });
    }
});
exports.deletePayroll = deletePayroll;
