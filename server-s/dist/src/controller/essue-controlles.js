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
exports.resolveIssue = exports.deleteIssue = exports.updateIssue = exports.getIssue = exports.getIssues = exports.createIssue = void 0;
const prisma_1 = __importDefault(require("../lip/prisma"));
// Create Issue
const createIssue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId, classId, type, details } = req.body;
        if (!studentId || !classId || !type || !details) {
            return res.status(400).json({
                message: "Fill required data",
            });
        }
        const issue = yield prisma_1.default.issue.create({
            data: {
                studentId,
                classId,
                type,
                details,
            },
        });
        res.status(201).json({
            message: "Issue created successfully",
            data: issue,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to create issue",
            error,
        });
    }
});
exports.createIssue = createIssue;
// Get All Issues
const getIssues = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const issues = yield prisma_1.default.issue.findMany({
            where: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === "STUDENT"
                ? { studentId: req.user.id }
                : {},
            orderBy: { id: "desc" },
            include: {
                student: true,
                classroom: true,
            },
        });
        res.status(200).json(issues);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to get issues",
            error,
        });
    }
});
exports.getIssues = getIssues;
// Get Single Issue
const getIssue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const issue = yield prisma_1.default.issue.findUnique({
            where: {
                id,
            },
            include: {
                student: true,
                classroom: true,
            },
        });
        if (!issue) {
            return res.status(404).json({
                message: "Issue not found",
            });
        }
        res.status(200).json(issue);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to get issue",
            error,
        });
    }
});
exports.getIssue = getIssue;
// Update Issue
const updateIssue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        const { classId, type, details, isResolved } = req.body;
        const issue = yield prisma_1.default.issue.update({
            where: {
                id,
            },
            data: Object.assign(Object.assign(Object.assign(Object.assign({}, (classId !== undefined ? { classId } : {})), (type !== undefined ? { type } : {})), (details !== undefined ? { details } : {})), (isResolved !== undefined ? { isResolved } : {})),
        });
        res.status(200).json({
            message: "Issue updated successfully",
            data: issue,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to update issue",
            error,
        });
    }
});
exports.updateIssue = updateIssue;
// Delete Issue
const deleteIssue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        yield prisma_1.default.issue.delete({
            where: {
                id,
            },
        });
        res.status(200).json({
            message: "Issue deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to delete issue",
            error,
        });
    }
});
exports.deleteIssue = deleteIssue;
const resolveIssue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const issue = yield prisma_1.default.issue.update({ where: { id: String(req.params.id) }, data: { isResolved: true } });
        res.status(200).json({ message: "Issue resolved successfully", issue });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to resolve issue", error });
    }
});
exports.resolveIssue = resolveIssue;
