import { Request, Response } from "express"
import prisma from "../lip/prisma"

const monthRange = (value: string) => { const start = new Date(`${value.slice(0, 7)}-01T00:00:00.000Z`); const end = new Date(start); end.setUTCMonth(end.getUTCMonth() + 1); return { start, end } }

export const createCashier = async (req: Request, res: Response) => { try { const { userId, fullName } = req.body; if (!userId || !fullName) return res.status(400).json({ message: "userId and fullName are required" }); res.status(201).json(await prisma.cashier.create({ data: { userId, fullName } })) } catch { res.status(500).json({ message: "Failed to create cashier" }) } }
export const getCashiers = async (_req: Request, res: Response) => { try { res.json(await prisma.cashier.findMany({ orderBy: { id: "desc" }, include: { user: { select: { id: true, email: true, username: true } } } })) } catch { res.status(500).json({ message: "Failed to get cashiers" }) } }
export const getCashier = async (req: Request, res: Response) => { try { const cashier = await prisma.cashier.findUnique({ where: { id: String(req.params.id) } }); if (!cashier) return res.status(404).json({ message: "Cashier not found" }); res.json(cashier) } catch { res.status(500).json({ message: "Failed to get cashier" }) } }
export const updateCashier = async (req: Request, res: Response) => { try { res.json(await prisma.cashier.update({ where: { id: String(req.params.id) }, data: { fullName: req.body.fullName } })) } catch { res.status(500).json({ message: "Failed to update cashier" }) } }
export const deleteCashier = async (req: Request, res: Response) => { try { await prisma.cashier.delete({ where: { id: String(req.params.id) } }); res.json({ message: "Cashier deleted successfully" }) } catch { res.status(500).json({ message: "Failed to delete cashier" }) } }

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { studentId, paymentDate, paymentMode, amount, reference, note } = req.body
    if (!studentId || !paymentDate || !paymentMode || !Number.isFinite(Number(amount)) || Number(amount) <= 0) return res.status(400).json({ message: "Student, date, payment mode and a valid amount are required" })
    if (new Date(paymentDate) > new Date()) return res.status(400).json({ message: "A payment cannot be recorded for a future month." })
    const { start, end } = monthRange(String(paymentDate))
    const existingPayment = await prisma.payment.findFirst({ where: { studentId, paymentDate: { gte: start, lt: end } } })
    if (existingPayment) return res.status(409).json({ message: "This student has already paid for the selected month." })
    const payment = await prisma.payment.create({ data: { studentId, paymentDate: new Date(paymentDate), paymentMode, amount: Number(amount), reference: reference || null, note: note || null } })
    res.status(201).json({ payment })
  } catch { res.status(500).json({ message: "Failed to save payment" }) }
}

export const getStudentPayments = async (req: Request, res: Response) => {
  try {
    const studentId = String(req.params.studentId)
    const payments = await prisma.payment.findMany({ where: { studentId }, orderBy: { createdAt: "desc" } })
    const paid = payments.reduce((sum, payment) => sum + payment.amount, 0)
    res.json({ payments, summary: { paid } })
  } catch { res.status(500).json({ message: "Failed to get payments" }) }
}

export const getPayments = async (_req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
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
    })
    res.json({ payments })
  }
  catch { res.status(500).json({ message: "Failed to get payment history" }) }
}

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { paymentDate, paymentMode, amount, reference, note } = req.body
    if (!paymentDate || !paymentMode || !Number.isFinite(Number(amount)) || Number(amount) <= 0) return res.status(400).json({ message: "Date, payment mode and a valid amount are required" })
    if (new Date(paymentDate) > new Date()) return res.status(400).json({ message: "A payment cannot be recorded for a future month." })
    const id = String(req.params.id)
    const currentPayment = await prisma.payment.findUnique({ where: { id } })
    if (!currentPayment) return res.status(404).json({ message: "Payment not found" })
    const { start, end } = monthRange(String(paymentDate))
    const existingPayment = await prisma.payment.findFirst({ where: { studentId: currentPayment.studentId, paymentDate: { gte: start, lt: end }, id: { not: id } } })
    if (existingPayment) return res.status(409).json({ message: "This student has already paid for the selected month." })
    const payment = await prisma.payment.update({ where: { id }, data: { paymentDate: new Date(paymentDate), paymentMode, amount: Number(amount), reference: reference || null, note: note || null } })
    res.json({ payment })
  } catch { res.status(500).json({ message: "Failed to update payment" }) }
}

export const deletePayment = async (req: Request, res: Response) => {
  try { await prisma.payment.delete({ where: { id: String(req.params.id) } }); res.json({ message: "Payment deleted successfully" }) }
  catch { res.status(500).json({ message: "Failed to delete payment" }) }
}
