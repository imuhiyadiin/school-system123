import { Request, Response } from "express";
import prisma from "../lip/prisma";
import type { AuthRequest } from "../middelwere/auth";

const teacherIdForRequest = async (req: AuthRequest) => {
  if (req.user?.role !== "TEACHER") return null;
  const teacher = await prisma.teacher.findUnique({
    where: { userId: req.user.id },
    select: { id: true },
  });
  return teacher?.id ?? "";
};

// Create Subject

export const createSubject = async (req: Request, res: Response) => {
  try {

    const {
      name,
      description,
    } = req.body;
    const grade = Number(req.body.grade ?? 1);


    if (!name || !grade) {
      return res.status(400).json({
        message: "Fill required data",
      });
    }


    const existingSubject = await prisma.subject.findFirst({
      where: {
        name,
        grade,
      },
    });


    if (existingSubject) {
      return res.status(400).json({
        message: "Subject already exists",
      });
    }


    const subject = await prisma.subject.create({
      data: {
        name,
        grade,
        description,
      },
    });


    return res.status(201).json({
      message: "Subject created successfully",
      subject,
    });


  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });

  }
};

// Get All Subjects

export const getSubjects = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = await teacherIdForRequest(req);
    if (teacherId === "") {
      return res.status(403).json({ message: "Teacher account was not found." });
    }

    const subjects = await prisma.subject.findMany({
      where: teacherId ? { teachers: { some: { teacherId } } } : undefined,
      orderBy: { id: "desc" },
      include: {
        results: true,
      },
    });


    return res.status(200).json({
      subjects,
    });


  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });

  }
};

// Get Single Subject

export const getSubject = async (req: AuthRequest, res: Response) => {
  try {

    const id = String(req.params.id);
    const teacherId = await teacherIdForRequest(req);
    if (teacherId === "") {
      return res.status(403).json({ message: "Teacher account was not found." });
    }


    const subject = await prisma.subject.findUnique({
      where: {
        id,
      },

      include: {
        results: {
          include: {
            student: true,
            exam: true,
          },
        },
      },
    });


    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    if (
      teacherId &&
      !(await prisma.teacherSubject.findUnique({
        where: { teacherId_subjectId: { teacherId, subjectId: id } },
        select: { teacherId: true },
      }))
    ) {
      return res.status(403).json({
        message: "You can only view your assigned subjects.",
      });
    }


    return res.status(200).json({
      subject,
    });


  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });

  }
};

// Update Subject

export const updateSubject = async (req: Request, res: Response) => {
  try {

    const id = String(req.params.id);


    const {
      name,
      grade,
      description,
    } = req.body;


    const subject = await prisma.subject.findUnique({
      where: {
        id,
      },
    });


    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }


    const updatedSubject = await prisma.subject.update({

      where: {
        id,
      },


      data: {
        name,
        ...(grade !== undefined ? { grade } : {}),
        description,
      },

    });


    return res.status(200).json({
      message: "Subject updated successfully",
      subject: updatedSubject,
    });


  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });

  }
};

// Delete Subject

export const deleteSubject = async (req: Request, res: Response) => {
  try {

    const id = String(req.params.id);


    const subject = await prisma.subject.findUnique({
      where: {
        id,
      },
    });


    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }


    await prisma.subject.delete({
      where: {
        id,
      },
    });


    return res.status(200).json({
      message: "Subject deleted successfully",
    });


  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });

  }
};
