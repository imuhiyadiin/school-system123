import hashpass from "bcryptjs";
import { Request, Response } from "express";
import prisma from "../lip/prisma";

// Create Teacher
export const createTeacher = async (req: Request, res: Response) => {
  try {
    const {
      email,
      username,
      fullName,
      gender,
      dob,
      phone,
      address,
      password,
    } = req.body;

    if (
      !email ||
      !username ||
      !fullName ||
      !gender ||
      !dob ||
      !password
    ) {
      return res.status(400).json({
        message: "Complete teacher data",
      });
    }

    const hash = hashpass.hashSync(password, 10);

    const teacher = await prisma.teacher.create({
      data: {
        fullName,
        gender,
        dob: new Date(dob),
        phone: phone || null,
        address: address || null,
        password: hash,
        user: {
          create: {
            email,
            username,
            password: hash,
            role: "TEACHER",
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json({ teacher });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return res.status(409).json({
        message: "Email or username already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create teacher",
    });
  }
};

// Get All Teachers
export const getTeachers = async (
  _req: Request,
  res: Response
) => {
  try {
    const result = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    res.json({ result });
  } catch {
    res.status(500).json({
      message: "Failed to get teachers",
    });
  }
};

// Get Single Teacher
export const getTeacher = async (
  req: Request,
  res: Response
) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: {
        id: String(req.params.id),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    res.json({ teacher });
  } catch {
    res.status(500).json({
      message: "Failed to get teacher",
    });
  }
};

// Update Teacher
export const updateTeacher = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      fullName,
      gender,
      dob,
      phone,
      address,
      password,
    } = req.body;

    const teacher = await prisma.teacher.update({
      where: {
        id: String(req.params.id),
      },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(gender !== undefined && { gender }),
        ...(dob !== undefined && {
          dob: new Date(dob),
        }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(password && {
          password: hashpass.hashSync(password, 10),
        }),
      },
    });

    res.json({ teacher });
  } catch {
    res.status(500).json({
      message: "Failed to update teacher",
    });
  }
};

// Delete Teacher
export const deleteTeacher = async (
  req: Request,
  res: Response
) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: {
        id: String(req.params.id),
      },
      select: {
        userId: true,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    await prisma.user.delete({
      where: {
        id: teacher.userId,
      },
    });

    res.json({
      message: "Teacher deleted successfully",
    });
  } catch {
    res.status(500).json({
      message: "Failed to delete teacher",
    });
  }
};
