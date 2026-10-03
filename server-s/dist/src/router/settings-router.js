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
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lip/prisma"));
const auth_1 = require("../middelwere/auth");
const router = (0, express_1.Router)();
router.get("/", auth_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () { const setting = yield prisma_1.default.setting.findUnique({ where: { userId: req.user.id } }); res.json(setting); }));
router.put("/", auth_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () { const { schoolName, timezone } = req.body; const setting = yield prisma_1.default.setting.upsert({ where: { userId: req.user.id }, update: { schoolName, timezone }, create: { userId: req.user.id, schoolName, timezone } }); res.json(setting); }));
exports.default = router;
