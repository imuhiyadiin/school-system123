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
      studentID,
    } = req.body;

    if (
     !  address ||
      ! parentName ||
      ! phone ||
      !fullName ||
      !gender ||
      !dob ||
      !password ||
      !classroomId ||
      !studentID
    ) {
      return res.status(400).json({
        message: "Complete student data",
      });
    }

    const studentId = typeof studentID === "string" ? studentID.trim() : "";
    if (!studentId) return res.status(400).json({ message: "Student ID is required" });

    const existingStudentId = await prisma.student.findUnique({ where: { studentID: studentId } });
    if (existingStudentId) return res.status(409).json({ message: "Student ID already exists. Please choose a unique ID." });

    const hash = hashpass.hashSync(password, 10);
    const studentIdentity = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const student = await prisma.student.create({
      data: {
        studentID: studentId,
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
    const students = await prisma.student.findMany({
        orderBy: { admissionDate: "desc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
          classrooms: {
            include: {
              classroom: true,
            },
          },
        },
      });
    res.json({ result: students.map(({ user, ...student }) => ({ ...student, studentID: student.studentID, user })) });
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
              username: true,
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

    res.json({ student: { ...student, studentID: student.studentID } });

  } catch {
    res.status(500).json({
      message: "Failed to get student",
    });
  }
};

export const getStudentOverview = async (req: Request, res: Response) => {
  try {
    const studentId = String(req.params.id);
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        payments: { orderBy: { paymentDate: "desc" } },
        attendances: { orderBy: { date: "asc" } },
        results: {
          orderBy: { id: "desc" },
          include: { subject: true, exam: true },
        },
      },
    });

    if (!student) return res.status(404).json({ message: "Student not found" });
    return res.json(student);
  } catch {
    return res.status(500).json({ message: "Failed to get student overview" });
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
          studentID,
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

          ...(studentID !== undefined
            ? {
                studentID: String(studentID).trim(),
              }
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
