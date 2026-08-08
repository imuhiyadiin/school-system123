import { Router } from "express"
import prisma from "../lip/prisma"
import { AuthRequest, verifyToken } from "../middelwere/auth"

const router = Router()
router.get("/", verifyToken, async (req: AuthRequest, res) => { const setting = await prisma.setting.findUnique({ where: { userId: req.user!.id } }); res.json(setting) })
router.put("/", verifyToken, async (req: AuthRequest, res) => { const { schoolName, timezone } = req.body; const setting = await prisma.setting.upsert({ where: { userId: req.user!.id }, update: { schoolName, timezone }, create: { userId: req.user!.id, schoolName, timezone } }); res.json(setting) })
export default router
