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
exports.deletePayment = exports.updatePayment = exports.getPayments = exports.getStudentPayments = exports.createPayment = exports.deleteCashier = exports.updateCashier = exports.getCashier = exports.getCashiers = exports.createCashier = void 0;
const prisma_1 = __importDefault(require("../lip/prisma"));
const monthRange = (value) => { const start = new Date(`${value.slice(0, 7)}-01T00:00:00.000Z`); const end = new Date(start); end.setUTCMonth(end.getUTCMonth() + 1); return { start, end }; };
const createCashier = (req, res) => __awaiter(void 0, void 0, void 0, function* () { try {
    const { userId, fullName } = req.body;
    if (!userId || !fullName)
        return res.status(400).json({ message: "userId and fullName are required" });
    res.status(201).json(yield prisma_1.default.cashier.create({ data: { userId, fullName } }));
}
catch (_a) {
    res.status(500).json({ message: "Failed to create cashier" });
} });
exports.createCashier = createCashier;
const getCashiers = (_req, res) => __awaiter(void 0, void 0, void 0, function* () { try {
    res.json(yield prisma_1.default.cashier.findMany({ orderBy: { id: "desc" }, include: { user: { select: { id: true, email: true, username: true } } } }));
}
catch (_a) {
    res.status(500).json({ message: "Failed to get cashiers" });
} });
exports.getCashiers = getCashiers;
const getCashier = (req, res) => __awaiter(void 0, void 0, void 0, function* () { try {
    const cashier = yield prisma_1.default.cashier.findUnique({ where: { id: String(req.params.id) } });
    if (!cashier)
        return res.status(404).json({ message: "Cashier not found" });
    res.json(cashier);
}
catch (_a) {
    res.status(500).json({ message: "Failed to get cashier" });
} });
exports.getCashier = getCashier;
const updateCashier = (req, res) => __awaiter(void 0, void 0, void 0, function* () { try {
    res.json(yield prisma_1.default.cashier.update({ where: { id: String(req.params.id) }, data: { fullName: req.body.fullName } }));
}
catch (_a) {
    res.status(500).json({ message: "Failed to update cashier" });
} });
exports.updateCashier = updateCashier;
const deleteCashier = (req, res) => __awaiter(void 0, void 0, void 0, function* () { try {
    yield prisma_1.default.cashier.delete({ where: { id: String(req.params.id) } });
    res.json({ message: "Cashier deleted successfully" });
}
catch (_a) {
    res.status(500).json({ message: "Failed to delete cashier" });
} });
exports.deleteCashier = deleteCashier;
const createPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId, paymentDate, paymentMode, amount, reference, note } = req.body;
        if (!studentId || !paymentDate || !paymentMode || !Number.isFinite(Number(amount)) || Number(amount) <= 0)
            return res.status(400).json({ message: "Student, date, payment mode and a valid amount are required" });
        if (new Date(paymentDate) > new Date())
            return res.status(400).json({ message: "A payment cannot be recorded for a future month." });
        const { start, end } = monthRange(String(paymentDate));
        const existingPayment = yield prisma_1.default.payment.findFirst({ where: { studentId, paymentDate: { gte: start, lt: end } } });
        if (existingPayment)
            return res.status(409).json({ message: "This student has already paid for the selected month." });
        const payment = yield prisma_1.default.payment.create({ data: { studentId, paymentDate: new Date(paymentDate), paymentMode, amount: Number(amount), reference: reference || null, note: note || null } });
        res.status(201).json({ payment });
    }
    catch (_a) {
        res.status(500).json({ message: "Failed to save payment" });
    }
});
exports.createPayment = createPayment;
const getStudentPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const studentId = String(req.params.studentId);
        const payments = yield prisma_1.default.payment.findMany({ where: { studentId }, orderBy: { createdAt: "desc" } });
        const paid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        res.json({ payments, summary: { paid } });
    }
    catch (_a) {
        res.status(500).json({ message: "Failed to get payments" });
    }
});
exports.getStudentPayments = getStudentPayments;
const getPayments = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payments = yield prisma_1.default.payment.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                student: {
                    select: {
                        fullName: true,
                        studentID: true,
                        classrooms: {
                            include: { classroom: { select: { id: true, name: true, section: true } } },
                        },
                    },
                },
            },
        });
        res.json({ payments });
    }
    catch (_a) {
        res.status(500).json({ message: "Failed to get payment history" });
    }
});
exports.getPayments = getPayments;
const updatePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentDate, paymentMode, amount, reference, note } = req.body;
        if (!paymentDate || !paymentMode || !Number.isFinite(Number(amount)) || Number(amount) <= 0)
            return res.status(400).json({ message: "Date, payment mode and a valid amount are required" });
        if (new Date(paymentDate) > new Date())
            return res.status(400).json({ message: "A payment cannot be recorded for a future month." });
        const id = String(req.params.id);
        const currentPayment = yield prisma_1.default.payment.findUnique({ where: { id } });
        if (!currentPayment)
            return res.status(404).json({ message: "Payment not found" });
        const { start, end } = monthRange(String(paymentDate));
        const existingPayment = yield prisma_1.default.payment.findFirst({ where: { studentId: currentPayment.studentId, paymentDate: { gte: start, lt: end }, id: { not: id } } });
        if (existingPayment)
            return res.status(409).json({ message: "This student has already paid for the selected month." });
        const payment = yield prisma_1.default.payment.update({ where: { id }, data: { paymentDate: new Date(paymentDate), paymentMode, amount: Number(amount), reference: reference || null, note: note || null } });
        res.json({ payment });
    }
    catch (_a) {
        res.status(500).json({ message: "Failed to update payment" });
    }
});
exports.updatePayment = updatePayment;
const deletePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.payment.delete({ where: { id: String(req.params.id) } });
        res.json({ message: "Payment deleted successfully" });
    }
    catch (_a) {
        res.status(500).json({ message: "Failed to delete payment" });
    }
});
exports.deletePayment = deletePayment;
