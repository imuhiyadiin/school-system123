import hashpass from "bcryptjs";
import { Request, Response } from "express";
import prisma from "../lip/prisma";
import { generateToken } from "../secure/generate-token";

// ===============================
// CREATE TEACHER
// ===============================
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
      subjectIds,
      basicSalary,
      allowance,
      arrivalTime,
    } = req.body;

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedUsername =
      typeof username === "string" ? username.trim() : "";

    const requiredFields: [string, unknown][] = [
      ["email", normalizedEmail],
      ["username", normalizedUsername],
      ["fullName", fullName],
      ["gender", gender],
      ["dob", dob],
      ["password", password],
    ];
    const missingFields = requiredFields
      .filter(([, value]) => typeof value !== "string" || !value.trim())
      .map(([field]) => field);

    if (
      missingFields.length > 0 ||
      !Array.isArray(subjectIds) ||
      subjectIds.length === 0
    ) {
      return res.status(400).json({
        message:
          missingFields.length > 0
            ? `Missing teacher fields: ${missingFields.join(", ")}`
            : "Select at least one teaching subject.",
      });
    }

    const selectedSubjectIds: string[] = [...new Set(subjectIds.map(String))];
    const availableSubjects = await prisma.subject.findMany({
      where: {
        id: {
          in: selectedSubjectIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (availableSubjects.length !== selectedSubjectIds.length) {
      return res.status(400).json({
        message: "One or more selected subjects were not found",
      });
    }

    // Check existing email
    const existingEmail = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Check existing username
    const existingUsername = await prisma.user.findUnique({
      where: {
        username: normalizedUsername,
      },
    });

    if (existingUsername) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    // Hash password
    const hashedPassword = await hashpass.hash(password, 10);

    // Create User + Teacher
    const teacher = await prisma.teacher.create({
      data: {
        fullName,
        gender,
        dob: new Date(dob),
        phone,
        address,
        password: hashedPassword,
        basicSalary: basicSalary ? Number(basicSalary) : 0,
        allowance: allowance ? Number(allowance) : 0,
        arrivalTime: arrivalTime || null,
        ...(selectedSubjectIds.length > 0
          ? {
              subjects: {
                create: selectedSubjectIds.map((subjectId) => ({
                  subject: {
                    connect: {
                      id: subjectId,
                    },
                  },
                })),
              },
            }
          : {}),

        user: {
          create: {
            email: normalizedEmail,
            username: normalizedUsername,
            password: hashedPassword,
            role: "TEACHER",
          },
        },
      },

      include: {
        user: true,
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Teacher created successfully",

      teacher: {
        id: teacher.id,
        userId: teacher.userId,
        fullName: teacher.fullName,
        gender: teacher.gender,
        dob: teacher.dob,
        phone: teacher.phone,
        address: teacher.address,
        joinedAt: teacher.joinedAt,
        basicSalary: teacher.basicSalary,
        allowance: teacher.allowance,
        arrivalTime: teacher.arrivalTime,
        email: teacher.user.email,
        username: teacher.user.username,
        role: teacher.user.role,
        user: {
          email: teacher.user.email,
          username: teacher.user.username,
        },
        subjects: teacher.subjects,
      },
    });
  } catch (error) {
    console.error("Create Teacher Error:", error);

    return res.status(500).json({
      message: "Failed to create teacher",
      error,
    });
  }
};

// ===============================
// TEACHER LOGIN
// ===============================
export const loginTeacher = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find teacher
    const teacher = await prisma.teacher.findFirst({
      where: {
        user: {
          email: normalizedEmail,
          role: "TEACHER",
        },
      },
      include: {
        user: true,
      },
    });

    if (!teacher) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // Check password
    const isPasswordCorrect =
      (await hashpass.compare(password, teacher.user.password)) ||
      (await hashpass.compare(password, teacher.password));

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // Generate JWT
    const token = generateToken({
      id: teacher.user.id,
      email: teacher.user.email,
      role: teacher.user.role,
    });

    return res.status(200).json({
      message: "Teacher login successful",

      token,

      teacher: {
        id: teacher.id,
        userId: teacher.userId,
        fullName: teacher.fullName,
        gender: teacher.gender,
        dob: teacher.dob,
        phone: teacher.phone,
        address: teacher.address,
        joinedAt: teacher.joinedAt,
        basicSalary: teacher.basicSalary,
        allowance: teacher.allowance,
        arrivalTime: teacher.arrivalTime,
        email: teacher.user.email,
        username: teacher.user.username,
        role: teacher.user.role,
      },
    });
  } catch (error) {
    console.error("Teacher Login Error:", error);

    return res.status(500).json({
      message: "Teacher login failed",
      error,
    });
  }
};

// ===============================
// GET ALL TEACHERS
// ===============================
export const getAllTeachers = async (
  req: Request,
  res: Response
) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: true,
        subjects: {
          include: {
            subject: true,
          },
        },
        classrooms: true,
        payrolls: true,
        attendances: true,
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    const data = teachers.map((teacher) => ({
      id: teacher.id,
      userId: teacher.userId,
      fullName: teacher.fullName,
      gender: teacher.gender,
      dob: teacher.dob,
      phone: teacher.phone,
      address: teacher.address,
      joinedAt: teacher.joinedAt,
      basicSalary: teacher.basicSalary,
      allowance: teacher.allowance,
      arrivalTime: teacher.arrivalTime,

      email: teacher.user.email,
      username: teacher.user.username,
      role: teacher.user.role,
      user: {
        email: teacher.user.email,
        username: teacher.user.username,
      },

      subjects: teacher.subjects,
      classrooms: teacher.classrooms,
      payrolls: teacher.payrolls,
      attendances: teacher.attendances,
    }));

    return res.status(200).json({
      message: "Teachers fetched successfully",
      count: data.length,
      teachers: data,
    });
  } catch (error) {
    console.error("Get All Teachers Error:", error);

    return res.status(500).json({
      message: "Failed to get teachers",
      error,
    });
  }
};

// ===============================
// GET ONE TEACHER
// ===============================
export const getTeacher = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const teacher = await prisma.teacher.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        subjects: {
          include: {
            subject: true,
          },
        },
        classrooms: true,
        payrolls: true,
        attendances: true,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      message: "Teacher fetched successfully",

      teacher: {
        id: teacher.id,
        userId: teacher.userId,
        fullName: teacher.fullName,
        gender: teacher.gender,
        dob: teacher.dob,
        phone: teacher.phone,
        address: teacher.address,
        joinedAt: teacher.joinedAt,
        basicSalary: teacher.basicSalary,
        allowance: teacher.allowance,
        arrivalTime: teacher.arrivalTime,

        email: teacher.user.email,
        username: teacher.user.username,
        role: teacher.user.role,
        user: {
          email: teacher.user.email,
          username: teacher.user.username,
        },

        subjects: teacher.subjects,
        classrooms: teacher.classrooms,
        payrolls: teacher.payrolls,
        attendances: teacher.attendances,
      },
    });
  } catch (error) {
    console.error("Get Teacher Error:", error);

    return res.status(500).json({
      message: "Failed to get teacher",
      error,
    });
  }
};

// ===============================
// UPDATE TEACHER
// ===============================
export const updateTeacher = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const {
      email,
      username,
      fullName,
      gender,
      dob,
      phone,
      address,
      password,
      basicSalary,
      allowance,
      arrivalTime,
      subjectIds,
    } = req.body;

    // Find teacher
    const existingTeacher = await prisma.teacher.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });

    if (!existingTeacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    // Prepare teacher data
    const teacherData: any = {};

    if (fullName !== undefined) {
      teacherData.fullName = fullName;
    }

    if (gender !== undefined) {
      teacherData.gender = gender;
    }

    if (dob !== undefined) {
      teacherData.dob = new Date(dob);
    }

    if (phone !== undefined) {
      teacherData.phone = phone;
    }

    if (address !== undefined) {
      teacherData.address = address;
    }

    if (basicSalary !== undefined) {
      teacherData.basicSalary = Number(basicSalary);
    }

    if (allowance !== undefined) {
      teacherData.allowance = Number(allowance);
    }

    if (arrivalTime !== undefined) {
      teacherData.arrivalTime = arrivalTime;
    }

    if (subjectIds !== undefined) {
      if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
        return res.status(400).json({
          message: "Select at least one teaching subject",
        });
      }

      const selectedSubjectIds = [...new Set(subjectIds)];
      const availableSubjects = await prisma.subject.findMany({
        where: {
          id: {
            in: selectedSubjectIds,
          },
        },
        select: {
          id: true,
        },
      });

      if (availableSubjects.length !== selectedSubjectIds.length) {
        return res.status(400).json({
          message: "One or more selected subjects were not found",
        });
      }

      teacherData.subjects = {
        deleteMany: {},
        create: selectedSubjectIds.map((subjectId: string) => ({
          subject: {
            connect: {
              id: subjectId,
            },
          },
        })),
      };
    }

    // Update password
    if (password) {
      const hashedPassword = await hashpass.hash(password, 10);

      teacherData.password = hashedPassword;

      await prisma.user.update({
        where: {
          id: existingTeacher.userId,
        },
        data: {
          password: hashedPassword,
        },
      });
    }

    // Update User
    const userData: any = {};

    if (email !== undefined) {
      userData.email = email;
    }

    if (username !== undefined) {
      userData.username = username;
    }

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: {
          id: existingTeacher.userId,
        },
        data: userData,
      });
    }

    // Update Teacher
    const updatedTeacher = await prisma.teacher.update({
      where: {
        id,
      },
      data: teacherData,
      include: {
        user: true,
      },
    });

    return res.status(200).json({
      message: "Teacher updated successfully",

      teacher: {
        id: updatedTeacher.id,
        userId: updatedTeacher.userId,
        fullName: updatedTeacher.fullName,
        gender: updatedTeacher.gender,
        dob: updatedTeacher.dob,
        phone: updatedTeacher.phone,
        address: updatedTeacher.address,
        joinedAt: updatedTeacher.joinedAt,
        basicSalary: updatedTeacher.basicSalary,
        allowance: updatedTeacher.allowance,
        arrivalTime: updatedTeacher.arrivalTime,

        email: updatedTeacher.user.email,
        username: updatedTeacher.user.username,
        role: updatedTeacher.user.role,
      },
    });
  } catch (error) {
    console.error("Update Teacher Error:", error);

    return res.status(500).json({
      message: "Failed to update teacher",
      error,
    });
  }
};

// ===============================
// DELETE TEACHER
// ===============================
export const deleteTeacher = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const teacher = await prisma.teacher.findUnique({
      where: {
        id,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    // Because User relation has onDelete: Cascade,
    // deleting User will also delete Teacher.
    await prisma.user.delete({
      where: {
        id: teacher.userId,
      },
    });

    return res.status(200).json({
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    console.error("Delete Teacher Error:", error);

    return res.status(500).json({
      message: "Failed to delete teacher",
      error,
    });
  }
};
