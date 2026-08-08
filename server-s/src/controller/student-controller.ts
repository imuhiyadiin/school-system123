import hashpass from "bcryptjs";
import { Request, Response } from "express";
import prisma from "../lip/prisma";
import { generateToken } from "../secure/generate-token";

export const createStudent = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      gender,
      dob,
      phone,
      address,
      parentName,
      password,
      classroomId,
    } = req.body;

    if (
     !  address ||
      ! parentName ||
      ! phone ||
      !fullName ||
      !gender ||
      !dob ||
      !password ||
      !classroomId
    ) {
      return res.status(400).json({
        message: "Complete student data",
      });
    }

    const hash = hashpass.hashSync(password, 10);
    const studentIdentity = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const student = await prisma.student.create({
      data: {
        fullName,
        password: hash,
        gender,
        dob: new Date(dob),
        phone: phone ,
        address: address ,
        parentName: parentName ,
        classrooms: {
          create: { classroomId },
        },

        user: {
          create: {
            email: `student-${studentIdentity}@school.local`,
            username: `student-${studentIdentity}`,
            password: hash,
            role: "STUDENT",
          },
        },
      },

      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({ student });

  } catch {
    res.status(500).json({
      message: "Failed to create student",
    });
  }
};




export const studentLogin = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone, password } = req.body;
    const studentPhone = typeof phone === "string" ? phone.trim() : "";

    if (!studentPhone || typeof password !== "string" || !password) {
      return res.status(400).json({
        message: "Phone and password are required",
      });
    }

    const students = await prisma.student.findMany({
      where: {
        phone: studentPhone,
      },
      include: {
        user: true,
        classrooms: {
          include: {
            classroom: true,
          },
        },
      },
    });

    const student = students.find((candidate) =>
      hashpass.compareSync(password, candidate.password)
    );

    if (!student) {
      return res.status(401).json({
        message: "Invalid phone number or password",
      });
    }

    const token = generateToken({
      id: student.user.id,
      email: student.user.email,
      role: student.user.role,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      student: {
        id: student.id,
        fullName: student.fullName,
        username: student.user.username,
        email: student.user.email,
        gender: student.gender,
        phone: student.phone,
        address: student.address,
        parentName: student.parentName,
        role: student.user.role,
        classrooms: student.classrooms,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Student login failed",
    });
  }
};



export const getStudents = async (_req: Request, res: Response) => {
  try {
    res.json({
      result: await prisma.student.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
          classrooms: {
            include: {
              classroom: true,
            },
          },
        },
      }),
    });
  } catch {
    res.status(500).json({
      message: "Failed to get students",
    });
  }
};


export const getStudent = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id },
          { userId: id },
        ],
      },

      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },

        classrooms: {
          include: {
            classroom: true,
          },
        },
      },
    });


    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json({ student });

  } catch {
    res.status(500).json({
      message: "Failed to get student",
    });
  }
};



export const updateStudent = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      gender,
      dob,
      phone,
      address,
      parentName,
          password,
          classroomId,
    } = req.body;


    res.json({
      student: await prisma.student.update({
        where: {
          id: String(req.params.id),
        },

        data: {
          ...(fullName !== undefined ? { fullName } : {}),

          ...(gender !== undefined ? { gender } : {}),

          ...(dob !== undefined
            ? { dob: new Date(dob) }
            : {}),

          ...(phone !== undefined
            ? { phone }
            : {}),

          ...(address !== undefined
            ? { address }
            : {}),

          ...(parentName !== undefined
            ? { parentName }
            : {}),

          ...(password
            ? {
                password: hashpass.hashSync(password, 10),
              }
            : {}),

          ...(classroomId !== undefined
            ? {
                classrooms: {
                  deleteMany: {},
                  create: { classroomId },
                },
              }
            : {}),
        },
      }),
    });

  } catch {
    res.status(500).json({
      message: "Failed to update student",
    });
  }
};



export const deleteStudent = async (req: Request, res: Response) => {
  try {

    const student = await prisma.student.findUnique({
      where: {
        id: String(req.params.id),
      },

      select: {
        userId: true,
      },
    });


    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }


    await prisma.user.delete({
      where: {
        id: student.userId,
      },
    });


    res.json({
      message: "Student deleted successfully",
    });


  } catch {
    res.status(500).json({
      message: "Failed to delete student",
    });
  }
};
