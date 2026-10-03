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
exports.deleteFee = exports.updateFee = exports.getFee = exports.getFees = exports.createFee = void 0;
const prisma_1 = __importDefault(require("../lip/prisma"));
const createFee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, amount, description, isActive } = req.body;
        if (!name || !Number.isFinite(Number(amount)) || Number(amount) < 0)
            return res.status(400).json({ message: "Fee name and a valid amount are required" });
        const fee = yield prisma_1.default.fee.create({ data: Object.assign({ name: String(name).trim(), amount: Number(amount), description: description || null }, (typeof isActive === "boolean" ? { isActive } : {})) });
        res.status(201).json({ fee });
    }
    catch (_a) {
        res.status(500).json({ message: "Failed to create fee" });
    }
});
exports.createFee = createFee;
const getFees = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json({ result: yield prisma_1.default.fee.findMany({ orderBy: { createdAt: "desc" } }) });
    }
    catch (_a) {
        res.status(500).json({ message: "Failed to get fees" });
    }
});
exports.getFees = getFees;
const getFee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fee = yield prisma_1.default.fee.findUnique({ where: { id: String(req.params.id) } });
        if (!fee)
            return res.status(404).json({ message: "Fee not found" });
        res.json({ fee });
    }
    catch (_a) {
        res.status(500).json({ message: "Failed to get fee" });
    }
});
exports.getFee = getFee;
const updateFee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, amount, description, isActive } = req.body;
        const fee = yield prisma_1.default.fee.update({ where: { id: String(req.params.id) }, data: Object.assign(Object.assign(Object.assign(Object.assign({}, (name !== undefined ? { name: String(name).trim() } : {})), (amount !== undefined ? { amount: Number(amount) } : {})), (description !== undefined ? { description: description || null } : {})), (typeof isActive === "boolean" ? { isActive } : {})) });
        res.json({ fee });
    }
    catch (_a) {
        res.status(500).json({ message: "Failed to update fee" });
    }
});
exports.updateFee = updateFee;
const deleteFee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.fee.delete({ where: { id: String(req.params.id) } });
        res.json({ message: "Fee deleted successfully" });
    }
    catch (_a) {
        res.status(500).json({ message: "Failed to delete fee" });
    }
});
exports.deleteFee = deleteFee;
