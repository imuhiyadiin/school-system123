import { Request, Response } from "express"
import prisma from "../lip/prisma"

const busData = (body: Record<string, unknown>) => ({
  ...(body.fullName !== undefined ? { fullName: String(body.fullName).trim() } : {}),
  ...(body.phone !== undefined ? { phone: String(body.phone).trim() } : {}),
  ...(body.vehiclePlate !== undefined
    ? { vehiclePlate: String(body.vehiclePlate).trim() || null }
    : {}),
  ...(body.location !== undefined ? { location: String(body.location).trim() } : {}),
  ...(body.arrivalTime !== undefined
    ? { arrivalTime: String(body.arrivalTime).trim() || null }
    : {}),
})

export const createBus = async (req: Request, res: Response) => {
  try {
    const { fullName, phone, location } = req.body
    if (!String(fullName ?? "").trim() || !String(phone ?? "").trim() || !String(location ?? "").trim())
      return res.status(400).json({ message: "Full name, phone, and location are required" })
    const bus = await prisma.bus.create({ data: busData(req.body) as { fullName: string; phone: string; vehiclePlate?: string | null; location: string; arrivalTime?: string | null } })
    return res.status(201).json({ bus })
  } catch {
    return res.status(500).json({ message: "Failed to create bus" })
  }
}

export const getBuses = async (_req: Request, res: Response) => {
  try {
    return res.json({ result: await prisma.bus.findMany({ orderBy: { createdAt: "desc" } }) })
  } catch {
    return res.status(500).json({ message: "Failed to get buses" })
  }
}

export const getBus = async (req: Request, res: Response) => {
  try {
    const bus = await prisma.bus.findUnique({ where: { id: String(req.params.id) } })
    if (!bus) return res.status(404).json({ message: "Bus not found" })
    return res.json({ bus })
  } catch {
    return res.status(500).json({ message: "Failed to get bus" })
  }
}

export const updateBus = async (req: Request, res: Response) => {
  try {
    const bus = await prisma.bus.update({ where: { id: String(req.params.id) }, data: busData(req.body) })
    return res.json({ bus })
  } catch {
    return res.status(500).json({ message: "Failed to update bus" })
  }
}

export const deleteBus = async (req: Request, res: Response) => {
  try {
    await prisma.bus.delete({ where: { id: String(req.params.id) } })
    return res.json({ message: "Bus deleted successfully" })
  } catch {
    return res.status(500).json({ message: "Failed to delete bus" })
  }
}
