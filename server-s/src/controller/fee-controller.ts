import { Request, Response } from "express"
import prisma from "../lip/prisma"

export const createFee = async (req: Request, res: Response) => {
  try {
    const { name, amount, description, isActive } = req.body
    if (!name || !Number.isFinite(Number(amount)) || Number(amount) < 0) return res.status(400).json({ message: "Fee name and a valid amount are required" })
    const fee = await prisma.fee.create({ data: { name: String(name).trim(), amount: Number(amount), description: description || null, ...(typeof isActive === "boolean" ? { isActive } : {}) } })
    res.status(201).json({ fee })
  } catch { res.status(500).json({ message: "Failed to create fee" }) }
}

export const getFees = async (_req: Request, res: Response) => {
  try { res.json({ result: await prisma.fee.findMany({ orderBy: { createdAt: "desc" } }) }) }
  catch { res.status(500).json({ message: "Failed to get fees" }) }
}

export const getFee = async (req: Request, res: Response) => {
  try {
    const fee = await prisma.fee.findUnique({ where: { id: String(req.params.id) } })
    if (!fee) return res.status(404).json({ message: "Fee not found" })
    res.json({ fee })
  } catch { res.status(500).json({ message: "Failed to get fee" }) }
}

export const updateFee = async (req: Request, res: Response) => {
  try {
    const { name, amount, description, isActive } = req.body
    const fee = await prisma.fee.update({ where: { id: String(req.params.id) }, data: { ...(name !== undefined ? { name: String(name).trim() } : {}), ...(amount !== undefined ? { amount: Number(amount) } : {}), ...(description !== undefined ? { description: description || null } : {}), ...(typeof isActive === "boolean" ? { isActive } : {}) } })
    res.json({ fee })
  } catch { res.status(500).json({ message: "Failed to update fee" }) }
}

export const deleteFee = async (req: Request, res: Response) => {
  try { await prisma.fee.delete({ where: { id: String(req.params.id) } }); res.json({ message: "Fee deleted successfully" }) }
  catch { res.status(500).json({ message: "Failed to delete fee" }) }
}
