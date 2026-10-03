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

const validMarks = (total: unknown, minMarks: unknown) => {
  const parsedTotal = Number(total);
  const parsedMinimum = Number(minMarks);
  return (
    Number.isInteger(parsedTotal) &&
    parsedTotal > 0 &&
    Number.isInteger(parsedMinimum) &&
    parsedMinimum >= 0 &&
    parsedMinimum <= parsedTotal
  );
};

// Create Exam

export const createExam = async (req: Request, res: Response) => {
  try {
    const {
      name,
      date,
      type,
      subjectId,
      subjectIds,
      total,
      minMarks,
    } = req.body;

    const selectedSubjectIds: string[] = Array.isArray(subjectIds)
      ? [...new Set(subjectIds.map(String))]
      : subjectId
        ? [String(subjectId)]
        : [];
    const examDate = new Date(date);

    if (
      !name ||
      !date ||
      Number.isNaN(examDate.getTime()) ||
      !type ||
      selectedSubjectIds.length === 0 ||
      !validMarks(total, minMarks)
    ) {
      return res.status(400).json({
        message: "Complete the exam details, choose at least one subject, and enter valid marks.",
      });
    }

    const availableSubjects = await prisma.subject.findMany({
      where: { id: { in: selectedSubjectIds } },
      select: { id: true },
    });
    if (availableSubjects.length !== selectedSubjectIds.length) {
      return res.status(400).json({ message: "One or more selected subjects were not found." });
    }

    const exams = await prisma.$transaction(
      selectedSubjectIds.map((selectedSubjectId) =>
        prisma.exam.create({
          data: {
            name,
            date: examDate,
            type,
            subjectId: selectedSubjectId,
            total: Number(total),
            minMarks: Number(minMarks),
          },
        })
      )
    );

    return res.status(201).json({
      message: `${exams.length} exam${exams.length === 1 ? "" : "s"} created successfully.`,
      count: exams.length,
      exams,
    });


  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });

  }
};
// Get All Exams

export const getExams = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = await teacherIdForRequest(req);
    if (teacherId === "") {
      return res.status(403).json({ message: "Teacher account was not found." });
    }

    const exams = await prisma.exam.findMany({
      where: teacherId
        ? { subject: { is: { teachers: { some: { teacherId } } } } }
        : undefined,
      orderBy: { id: "desc" },
      include: {
        results: true,
        subject: true,
      },
    });


    return res.status(200).json({
      exams,
    });


  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });

  }
};
// Get Single Exam

export const getExam = async (req: AuthRequest, res: Response) => {
  try {

    const id = String(req.params.id);
    const teacherId = await teacherIdForRequest(req);
    if (teacherId === "") {
      return res.status(403).json({ message: "Teacher account was not found." });
    }


    const exam = await prisma.exam.findUnique({
      where: {
        id,
      },

      include: {
        subject: true,
        results: {
          include: {
            student: true,
            subject: true,
          },
        },
      },
    });


    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    if (teacherId) {
      if (!exam.subjectId) {
        return res.status(403).json({
          message: "You can only view exams for your assigned subjects.",
        });
      }
      const assignedSubject = await prisma.teacherSubject.findUnique({
        where: {
          teacherId_subjectId: {
            teacherId,
            subjectId: exam.subjectId,
          },
        },
        select: { teacherId: true },
      });
      if (!assignedSubject) {
        return res.status(403).json({
          message: "You can only view exams for your assigned subjects.",
        });
      }
    }


    return res.status(200).json({
      exam,
    });


  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });

  }
};

// Update Exam

export const updateExam = async (req: Request, res: Response) => {
  try {

    const id = String(req.params.id);


    const {
      name,
      date,
      type,
      subjectId,
      total,
      minMarks,
    } = req.body;


    const exam = await prisma.exam.findUnique({
      where: {
        id,
      },
    });


    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    const nextTotal = total === undefined ? exam.total : total;
    const nextMinMarks = minMarks === undefined ? exam.minMarks : minMarks;
    if (!validMarks(nextTotal, nextMinMarks)) {
      return res.status(400).json({
        message: "Minimum pass marks must be between 0 and total marks.",
      });
    }


    const updatedExam = await prisma.exam.update({

      where: {
        id,
      },

      data: {
        name,
        date: date ? new Date(date) : undefined,
        type,
        ...(subjectId !== undefined ? { subjectId } : {}),
        ...(total !== undefined ? { total: Number(total) } : {}),
        ...(minMarks !== undefined ? { minMarks: Number(minMarks) } : {}),
      },

    });


    return res.status(200).json({
      message: "Exam updated successfully",
      exam: updatedExam,
    });


  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });

  }
};
// Delete Exam

export const deleteExam = async (req: Request, res: Response) => {
  try {

    const id = String(req.params.id);


    const exam = await prisma.exam.findUnique({
      where: {
        id,
      },
    });


    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }


    await prisma.exam.delete({
      where: {
        id,
      },
    });


    return res.status(200).json({
      message: "Exam deleted successfully",
    });


  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });

  }
};
