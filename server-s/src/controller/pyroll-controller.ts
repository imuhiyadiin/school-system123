import { Request, Response } from "express";
import prisma from "../lip/prisma";

// Create Payroll
export const createPayroll = async (req: Request, res: Response) => {
  try {
    const {
      teacherId,
      staffId,
      month,
      year,
      basicSalary,
      allowance,
      deduction,
      advance,
      status,
      paymentDate,
      paymentMethod,
      note,
    } = req.body;

    if (
      !month ||
      !year ||
      basicSalary === undefined
    ) {
      return res.status(400).json({
        message: "Complete payroll data",
      });
    }

    if (!teacherId && !staffId) {
      return res.status(400).json({
        message: "Teacher or staff is required",
      });
    }

    if (teacherId && staffId) {
      return res.status(400).json({
        message: "Select either teacher or staff",
      });
    }

    const basic = Number(basicSalary);
    const allow = Number(allowance || 0);
    const deduct = Number(deduction || 0);
    const adv = Number(advance || 0);

    const netSalary = basic + allow - deduct - adv;

    const payroll = await prisma.payroll.create({
      data: {
        teacherId: teacherId || null,
        staffId: staffId || null,
        month: Number(month),
        year: Number(year),
        basicSalary: basic,
        allowance: allow,
        deduction: deduct,
        advance: adv,
        netSalary,
        status: status || "PENDING",
        paymentDate: paymentDate
          ? new Date(paymentDate)
          : null,
        paymentMethod: paymentMethod || null,
        note: note || null,
      },
    });

    res.status(201).json({ payroll });
  } catch {
    res.status(500).json({
      message: "Failed to create payroll",
    });
  }
};

// Get All Payrolls
export const getPayrolls = async (
  _req: Request,
  res: Response
) => {
  try {
    const result = await prisma.payroll.findMany({
      orderBy: [
        { year: "desc" },
        { month: "desc" },
      ],
      include: {
        teacher: true,
        staff: true,
      },
    });

    res.json({ result });
  } catch {
    res.status(500).json({
      message: "Failed to get payrolls",
    });
  }
};

// Get Monthly Payroll Reports
export const getPayrollReports = async (
  _req: Request,
  res: Response
) => {
  try {
    const payrolls = await prisma.payroll.findMany({
      select: {
        month: true,
        year: true,
        basicSalary: true,
        allowance: true,
        deduction: true,
        netSalary: true,
        status: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    const grouped = new Map<
      string,
      {
        month: number;
        year: number;
        totalEmployees: number;
        totalBasicSalary: number;
        totalAllowance: number;
        totalDeduction: number;
        totalNetSalary: number;
        paymentStatus: string;
        paid: boolean;
      }
    >();

    for (const payroll of payrolls) {
      const key = `${payroll.year}-${payroll.month}`;
      const report = grouped.get(key) ?? {
        month: payroll.month,
        year: payroll.year,
        totalEmployees: 0,
        totalBasicSalary: 0,
        totalAllowance: 0,
        totalDeduction: 0,
        totalNetSalary: 0,
        paymentStatus: "PAID",
        paid: true,
      };

      report.totalEmployees += 1;
      report.totalBasicSalary += payroll.basicSalary;
      report.totalAllowance += payroll.allowance;
      report.totalDeduction += payroll.deduction;
      report.totalNetSalary += payroll.netSalary;
      report.paid = report.paid && payroll.status === "PAID";
      report.paymentStatus = report.paid ? "PAID" : "PENDING";
      grouped.set(key, report);
    }

    const reports = Array.from(grouped.values()).map(({ paid: _paid, ...report }) => report);
    res.json({ reports });
  } catch {
    res.status(500).json({
      message: "Failed to get payroll reports",
    });
  }
};

// Get Single Payroll
export const getPayroll = async (
  req: Request,
  res: Response
) => {
  try {
    const payroll = await prisma.payroll.findUnique({
      where: {
        id: String(req.params.id),
      },
      include: {
        teacher: true,
        staff: true,
      },
    });

    if (!payroll) {
      return res.status(404).json({
        message: "Payroll not found",
      });
    }

    res.json({ payroll });
  } catch {
    res.status(500).json({
      message: "Failed to get payroll",
    });
  }
};

// Update Payroll
export const updatePayroll = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      teacherId,
      staffId,
      month,
      year,
      basicSalary,
      allowance,
      deduction,
      advance,
      status,
      paymentDate,
      paymentMethod,
      note,
    } = req.body;

    const currentPayroll = await prisma.payroll.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!currentPayroll) {
      return res.status(404).json({
        message: "Payroll not found",
      });
    }

    const basic =
      basicSalary !== undefined
        ? Number(basicSalary)
        : currentPayroll.basicSalary;

    const allow =
      allowance !== undefined
        ? Number(allowance)
        : currentPayroll.allowance;

    const deduct =
      deduction !== undefined
        ? Number(deduction)
        : currentPayroll.deduction;

    const adv =
      advance !== undefined
        ? Number(advance)
        : currentPayroll.advance;

    const netSalary = basic + allow - deduct - adv;

    const payroll = await prisma.payroll.update({
      where: {
        id: String(req.params.id),
      },
      data: {
        ...(teacherId !== undefined && {
          teacherId: teacherId || null,
        }),

        ...(staffId !== undefined && {
          staffId: staffId || null,
        }),

        ...(month !== undefined && {
          month: Number(month),
        }),

        ...(year !== undefined && {
          year: Number(year),
        }),

        ...(basicSalary !== undefined && {
          basicSalary: Number(basicSalary),
        }),

        ...(allowance !== undefined && {
          allowance: Number(allowance),
        }),

        ...(deduction !== undefined && {
          deduction: Number(deduction),
        }),

        ...(advance !== undefined && {
          advance: Number(advance),
        }),

        netSalary,

        ...(status !== undefined && {
          status,
        }),

        ...(paymentDate !== undefined && {
          paymentDate: paymentDate
            ? new Date(paymentDate)
            : null,
        }),

        ...(paymentMethod !== undefined && {
          paymentMethod,
        }),

        ...(note !== undefined && {
          note,
        }),
      },
    });

    res.json({ payroll });
  } catch {
    res.status(500).json({
      message: "Failed to update payroll",
    });
  }
};

// Delete Payroll
export const deletePayroll = async (
  req: Request,
  res: Response
) => {
  try {
    const payroll = await prisma.payroll.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!payroll) {
      return res.status(404).json({
        message: "Payroll not found",
      });
    }

    await prisma.payroll.delete({
      where: {
        id: String(req.params.id),
      },
    });

    res.json({
      message: "Payroll deleted successfully",
    });
  } catch {
    res.status(500).json({
      message: "Failed to delete payroll",
    });
  }
};
