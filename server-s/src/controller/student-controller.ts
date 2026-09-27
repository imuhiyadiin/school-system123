import hashpass from "bcryptjs";
import { Request, Response } from "express";
import prisma from "../lip/prisma";
import { generateToken } from "../secure/generate-token";

const nextStudentID = async () => {
  const students = await prisma.student.findMany({ select: { studentID: true } });
  const highestID = students.reduce((highest, student) => {
    const id = Number(student.studentID);
    return Number.isInteger(id) && id >= 1000 ? Math.max(highest, id) : highest;
  }, 999);

  return String(highestID + 1);
};

type StudentLoginRecord = {
  id: string;
  fullName: string;
  password: string;
  gender: string;
  phone: string | null;
  address: string | null;
  parentName: string | null;
  classrooms: unknown[];
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      gender,
      dob,
      phone,
      address,
      parentName,
      parentPhone,
      password,
      classroomId,
      totalFee,
      busId,
    } = req.body;

    if (
     !  address ||
      ! parentName ||
      ! parentPhone ||
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

    const parsedTotalFee = Number(totalFee);
    if (!Number.isFinite(parsedTotalFee) || parsedTotalFee < 0) {
      return res.status(400).json({ message: "A valid total fee is required" });
    }

    const hash = hashpass.hashSync(password, 10);
    // The unique constraint protects this sequence if two students are created at once.
    // On the unlikely collision, calculate the next available ID and try again.
    let student;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const studentID = await nextStudentID();
      try {
        student = await prisma.student.create({
          data: {
            studentID,
        fullName,
        password: hash,
        gender,
        dob: new Date(dob),
        phone: phone ,
        address: address ,
        parentName: parentName ,
        parentPhone: parentPhone ,
        totalFee: parsedTotalFee,
        ...(busId ? { busId: String(busId) } : {}),
        classrooms: {
          create: { classroomId },
        },
          },
        });
        break;
      } catch (error) {
        const code = (error as { code?: string }).code;
        if (code !== "P2002" || attempt === 2) throw error;
      }
    }

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

    const students = (await prisma.student.findMany({
      where: {
        phone: studentPhone,
      },
      include: {
        classrooms: {
          include: {
            classroom: true,
          },
        },
      },
    })) as unknown as StudentLoginRecord[];

    for (const student of students) {
      if (!hashpass.compareSync(password, student.password)) continue;

      const token = generateToken({
        id: student.id,
        email: `student-${student.id}@school.local`,
        role: "STUDENT",
      });

      return res.status(200).json({
        message: "Login successful",
        token,
        student: {
          id: student.id,
          fullName: student.fullName,
          gender: student.gender,
          phone: student.phone,
          address: student.address,
          parentName: student.parentName,
          role: "STUDENT",
          classrooms: student.classrooms,
        },
      });
    }

    return res.status(401).json({
      message: "Invalid phone number or password",
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
          classrooms: {
            include: {
              classroom: true,
            },
          },
          bus: true,
        },
      });
    res.json({ result: students });
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
        id,
      },

      include: {
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
          parentPhone,
          password,
          classroomId,
          studentID,
          totalFee,
          busId,
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

          ...(parentPhone !== undefined
            ? { parentPhone }
            : {}),

          ...(studentID !== undefined
            ? {
                studentID: String(studentID).trim(),
              }
            : {}),

          ...(totalFee !== undefined
            ? { totalFee: Number(totalFee) }
            : {}),

          ...(busId !== undefined
            ? { busId: String(busId).trim() || null }
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

    const student = await prisma.student.findUnique({ where: { id: String(req.params.id) } });


    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }


    await prisma.student.delete({ where: { id: student.id } });


    res.json({
      message: "Student deleted successfully",
    });


  } catch {
    res.status(500).json({
      message: "Failed to delete student",
    });
  }
};
