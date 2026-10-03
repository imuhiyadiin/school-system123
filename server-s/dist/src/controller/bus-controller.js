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
exports.deleteBus = exports.updateBus = exports.getBus = exports.getBuses = exports.createBus = void 0;
const prisma_1 = __importDefault(require("../lip/prisma"));
const busData = (body) => (Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (body.fullName !== undefined ? { fullName: String(body.fullName).trim() } : {})), (body.phone !== undefined ? { phone: String(body.phone).trim() } : {})), (body.vehiclePlate !== undefined
    ? { vehiclePlate: String(body.vehiclePlate).trim() || null }
    : {})), (body.location !== undefined ? { location: String(body.location).trim() } : {})), (body.arrivalTime !== undefined
    ? { arrivalTime: String(body.arrivalTime).trim() || null }
    : {})));
const createBus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, phone, location } = req.body;
        if (!String(fullName !== null && fullName !== void 0 ? fullName : "").trim() || !String(phone !== null && phone !== void 0 ? phone : "").trim() || !String(location !== null && location !== void 0 ? location : "").trim())
            return res.status(400).json({ message: "Full name, phone, and location are required" });
        const bus = yield prisma_1.default.bus.create({ data: busData(req.body) });
        return res.status(201).json({ bus });
    }
    catch (_a) {
        return res.status(500).json({ message: "Failed to create bus" });
    }
});
exports.createBus = createBus;
const getBuses = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.json({ result: yield prisma_1.default.bus.findMany({ orderBy: { createdAt: "desc" } }) });
    }
    catch (_a) {
        return res.status(500).json({ message: "Failed to get buses" });
    }
});
exports.getBuses = getBuses;
const getBus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bus = yield prisma_1.default.bus.findUnique({ where: { id: String(req.params.id) } });
        if (!bus)
            return res.status(404).json({ message: "Bus not found" });
        return res.json({ bus });
    }
    catch (_a) {
        return res.status(500).json({ message: "Failed to get bus" });
    }
});
exports.getBus = getBus;
const updateBus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bus = yield prisma_1.default.bus.update({ where: { id: String(req.params.id) }, data: busData(req.body) });
        return res.json({ bus });
    }
    catch (_a) {
        return res.status(500).json({ message: "Failed to update bus" });
    }
});
exports.updateBus = updateBus;
const deleteBus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.bus.delete({ where: { id: String(req.params.id) } });
        return res.json({ message: "Bus deleted successfully" });
    }
    catch (_a) {
        return res.status(500).json({ message: "Failed to delete bus" });
    }
});
exports.deleteBus = deleteBus;
