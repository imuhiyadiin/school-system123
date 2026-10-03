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
exports.deleteTimetable = exports.updateTimetable = exports.getTimetable = exports.getTimetables = exports.createTimetable = void 0;
const prisma_1 = __importDefault(require("../lip/prisma"));
const createTimetable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const timetable = yield prisma_1.default.timetable.create({
            data: req.body,
        });
        res.status(201).json(timetable);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create timetable" });
    }
});
exports.createTimetable = createTimetable;
const getTimetables = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const timetables = yield prisma_1.default.timetable.findMany({ orderBy: { id: "desc" } });
        res.status(200).json(timetables);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to get timetables" });
    }
});
exports.getTimetables = getTimetables;
const getTimetable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const timetable = yield prisma_1.default.timetable.findUnique({
            where: {
                id: String(req.params.id),
            },
        });
        res.status(200).json(timetable);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to get timetable" });
    }
});
exports.getTimetable = getTimetable;
const updateTimetable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const timetable = yield prisma_1.default.timetable.update({
            where: {
                id: String(req.params.id),
            },
            data: req.body,
        });
        res.status(200).json(timetable);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update timetable" });
    }
});
exports.updateTimetable = updateTimetable;
const deleteTimetable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.timetable.delete({
            where: {
                id: String(req.params.id),
            },
        });
        res.status(200).json({
            message: "Timetable deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete timetable" });
    }
});
exports.deleteTimetable = deleteTimetable;
