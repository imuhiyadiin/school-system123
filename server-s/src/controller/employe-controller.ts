import { Request, Response } from "express";
import prisma from "../lip/prisma";

// Create Employee
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const {
      employeeId,
      fullName,
      email,
      phone,
      gender,
      dob,
      address,
      position,
      department,
      joinedAt,
      basicSalary,
      allowance,
      status,
    } = req.body;

    if (
      !employeeId ||
      !fullName ||
      !email ||
      !position ||
      !department
    ) {
      return res.status(400).json({
        message: "Complete employee data",
      });
    }

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        fullName,
        email,
        phone: phone || null,
        gender: gender || null,
        dob: dob ? new Date(dob) : null,
        address: address || null,
        position,
        department,
        joinedAt: joinedAt ? new Date(joinedAt) : new Date(),
        basicSalary:
          basicSalary !== undefined &&
          Number.isFinite(Number(basicSalary))
            ? Number(basicSalary)
            : 0,
        allowance:
          allowance !== undefined &&
          Number.isFinite(Number(allowance))
            ? Number(allowance)
            : 0,
        status: status || "ACTIVE",
      },
    });

    res.status(201).json({ employee });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        message: "Employee ID or email already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create employee",
    });
  }
};

// Get All Employees
export const getEmployees = async (
  _req: Request,
  res: Response
) => {
  try {
    const result = await prisma.employee.findMany({
      orderBy: { joinedAt: "desc" },
    });

    res.json({ result });
  } catch {
    res.status(500).json({
      message: "Failed to get employees",
    });
  }
};

// Get Single Employee
export const getEmployee = async (
  req: Request,
  res: Response
) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.json({ employee });
  } catch {
    res.status(500).json({
      message: "Failed to get employee",
    });
  }
};

// Get Employee Salary History
export const getEmployeeSalaryHistory = async (
  req: Request,
  res: Response
) => {
  try {
    const payrolls = await prisma.payroll.findMany({
      where: { staffId: String(req.params.id) },
      orderBy: { createdAt: "asc" },
    });

    const salaryHistory = payrolls.map((payroll, index) => ({
      id: payroll.id,
      basicSalary: payroll.basicSalary,
      previousSalary:
        index > 0 ? payrolls[index - 1].basicSalary : null,
      allowance: payroll.allowance,
      effectiveDate: payroll.paymentDate ?? payroll.createdAt,
      reason: payroll.note,
    }));

    res.json({ salaryHistory });
  } catch {
    res.status(500).json({
      message: "Failed to get employee salary history",
    });
  }
};

// Update Employee
export const updateEmployee = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      employeeId,
      fullName,
      email,
      phone,
      gender,
      dob,
      address,
      position,
      department,
      joinedAt,
      basicSalary,
      allowance,
      status,
    } = req.body;

    const employee = await prisma.employee.update({
      where: {
        id: String(req.params.id),
      },
      data: {
        ...(employeeId !== undefined && { employeeId }),
        ...(fullName !== undefined && { fullName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(gender !== undefined && { gender }),
        ...(dob !== undefined && {
          dob: new Date(dob),
        }),
        ...(address !== undefined && { address }),
        ...(position !== undefined && { position }),
        ...(department !== undefined && { department }),
        ...(joinedAt !== undefined && {
          joinedAt: new Date(joinedAt),
        }),
        ...(basicSalary !== undefined &&
          Number.isFinite(Number(basicSalary)) && {
            basicSalary: Number(basicSalary),
          }),
        ...(allowance !== undefined &&
          Number.isFinite(Number(allowance)) && {
            allowance: Number(allowance),
          }),
        ...(status !== undefined && { status }),
      },
    });

    res.json({ employee });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        message: "Employee ID or email already exists",
      });
    }

    res.status(500).json({
      message: "Failed to update employee",
    });
  }
};

// Delete Employee
export const deleteEmployee = async (
  req: Request,
  res: Response
) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    await prisma.employee.delete({
      where: {
        id: String(req.params.id),
      },
    });

    res.json({
      message: "Employee deleted successfully",
    });
  } catch {
    res.status(500).json({
      message: "Failed to delete employee",
    });
  }
};
