import prisma from "../lip/prisma";
import { Request, Response } from "express";
import type { AuthRequest } from "../middelwere/auth";

const teacherIdForRequest = async (req: AuthRequest) => {
  if (req.user?.role !== "TEACHER") return null;
  const teacher = await prisma.teacher.findUnique({
    where: { userId: req.user.id },
    select: { id: true },
  });
  return teacher?.id ?? "";
};

const resultInclude = {
  student: true,
  classroom: true,
  subject: true,
  exam: true,
};

const validateMarks = (marks: unknown, total: number) => {
  const value = typeof marks === "number" ? marks : Number(marks);

  if (!Number.isInteger(value) || value < 0 || value > total) {
    return `Marks must be a whole number between 0 and ${total}.`;
  }

  return null;
};

// Older records may contain duplicate entries. Keep the newest entry for each
// student, subject, exam type, and school year.
const uniqueResults = <T extends { studentId: string; subjectId: string; schoolYear: string | null; exam: { type: string; date: Date } }>(results: T[]) =>
  [...new Map(results.map((result) => [
    `${result.studentId}-${result.subjectId}-${result.exam.type}-${result.schoolYear ?? result.exam.date.getFullYear()}`,
    result,
  ])).values()];

export const createResult = async (req: AuthRequest, res: Response) => {
  try {
    const {
      studentId,
      classId,
      subjectId,
      examId,
      examType,
      examDate,
      schoolYear,
      marks,
    } = req.body;

    if (!studentId || !classId || marks === undefined || (!examId && (!examType || !examDate))) {
      return res.status(400).json({
        message: "Fill required data",
      });
    }

    const teacherId = await teacherIdForRequest(req);
    if (teacherId === "") {
      return res.status(403).json({ message: "Teacher account was not found." });
    }
    if (teacherId && !examId) {
      return res.status(400).json({ message: "Choose an existing exam to enter marks." });
    }

    let resultExamId = examId;
    if (!resultExamId) {
      const date = new Date(examDate);
      const existingExam = await prisma.exam.findFirst({
        where: { type: examType, date },
      });
      const exam = existingExam ?? await prisma.exam.create({
        data: { name: `${examType} Exam`, type: examType, date },
      });
      resultExamId = exam.id;
    }

    const classroom = await prisma.classroom.findUnique({
      where: { id: classId },
      select: { grade: true },
    });
    const selectedExam = await prisma.exam.findUnique({
      where: { id: resultExamId },
      select: { subjectId: true, type: true, total: true },
    });
    if (!selectedExam) {
      return res.status(400).json({ message: "Selected exam was not found." });
    }
    if (subjectId && selectedExam.subjectId && subjectId !== selectedExam.subjectId) {
      return res.status(400).json({ message: "The subject does not match the selected exam." });
    }

    if (teacherId) {
      if (!selectedExam.subjectId || !classroom) {
        return res.status(403).json({ message: "Choose a valid class and your assigned subject exam." });
      }
      const [assignment, studentInClass] = await Promise.all([
        prisma.teacherSubject.findUnique({
          where: {
            teacherId_subjectId: {
              teacherId,
              subjectId: selectedExam.subjectId,
            },
          },
          select: { teacherId: true },
        }),
        prisma.classroomStudent.findUnique({
          where: {
            classroomId_studentId: { classroomId: classId, studentId },
          },
          select: { studentId: true },
        }),
      ]);
      if (!assignment) {
        return res.status(403).json({ message: "You can only enter marks for your assigned subjects." });
      }
      if (!studentInClass) {
        return res.status(400).json({ message: "The selected student is not in this classroom." });
      }
    }
    const marksError = validateMarks(marks, selectedExam.total);
    if (marksError) {
      return res.status(400).json({ message: marksError });
    }
    let defaultSubject = subjectId || selectedExam?.subjectId ? null : await prisma.subject.findFirst({
      where: classroom ? { grade: classroom.grade } : undefined,
      orderBy: { name: "asc" },
    });

    if (!subjectId && !selectedExam?.subjectId && !defaultSubject) {
      defaultSubject = await prisma.subject.findFirst({
        orderBy: { name: "asc" },
      });
    }

    if (!subjectId && !selectedExam?.subjectId && !defaultSubject) {
      defaultSubject = await prisma.subject.create({
        data: {
          name: "General Subject",
          grade: classroom?.grade ?? 1,
          description: "Automatically created for result entry",
        },
      });
    }

    const resolvedSubjectId = subjectId ?? selectedExam?.subjectId ?? defaultSubject!.id;
    const duplicateResult = await prisma.result.findFirst({
      where: {
        studentId,
        subjectId: resolvedSubjectId,
        exam: { is: { type: selectedExam.type } },
      },
    });

    if (duplicateResult) {
      return res.status(409).json({
        message: "This student already has a result for this subject and exam type.",
      });
    }

    const result = await prisma.result.create({
      data: {
        studentId,
        classId,
        subjectId: resolvedSubjectId,
        examId: resultExamId,
        schoolYear,
        marks: Number(marks),
      },
      include: resultInclude,
    });

    return res.status(201).json({
      message: "Result created successfully",
      result,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getResults = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = await teacherIdForRequest(req);
    if (teacherId === "") {
      return res.status(403).json({ message: "Teacher account was not found." });
    }
    const results = await prisma.result.findMany({
      where: teacherId
        ? { subject: { teachers: { some: { teacherId } } } }
        : undefined,
      orderBy: { id: "desc" },
      include: resultInclude,
    });

    return res.status(200).json({
      results: uniqueResults(results),
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getResult = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = await teacherIdForRequest(req);
    if (teacherId === "") {
      return res.status(403).json({ message: "Teacher account was not found." });
    }
    const id = String(req.params.id);
    const result = await prisma.result.findUnique({
      where: { id },
      include: resultInclude,
    });

    if (!result) {
      return res.status(404).json({
        message: "Result not found",
      });
    }

    if (
      teacherId &&
      !(await prisma.teacherSubject.findUnique({
        where: {
          teacherId_subjectId: { teacherId, subjectId: result.subjectId },
        },
        select: { teacherId: true },
      }))
    ) {
      return res.status(403).json({
        message: "You can only view results for your assigned subjects.",
      });
    }

    return res.status(200).json({ result });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateResult = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      studentId,
      classId,
      subjectId,
      examId,
      schoolYear,
      marks,
    } = req.body;

    const existingResult = await prisma.result.findUnique({
      where: { id },
      include: { exam: { select: { total: true } } },
    });

    if (!existingResult) {
      return res.status(404).json({
        message: "Result not found",
      });
    }

    if (marks !== undefined || examId !== undefined) {
      const exam = examId === undefined
        ? existingResult.exam
        : await prisma.exam.findUnique({ where: { id: examId }, select: { total: true } });

      if (!exam) {
        return res.status(400).json({ message: "Selected exam was not found." });
      }

      const marksError = validateMarks(marks ?? existingResult.marks, exam.total);
      if (marksError) {
        return res.status(400).json({ message: marksError });
      }
    }

    const result = await prisma.result.update({
      where: { id },
      data: {
        ...(studentId !== undefined ? { studentId } : {}),
        ...(classId !== undefined ? { classId } : {}),
        ...(subjectId !== undefined ? { subjectId } : {}),
        ...(examId !== undefined ? { examId } : {}),
        ...(schoolYear !== undefined ? { schoolYear } : {}),
        ...(marks !== undefined ? { marks: Number(marks) } : {}),
      },
      include: resultInclude,
    });

    return res.status(200).json({
      message: "Result updated successfully",
      result,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteResult = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const result = await prisma.result.findUnique({
      where: { id },
    });

    if (!result) {
      return res.status(404).json({
        message: "Result not found",
      });
    }

    await prisma.result.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Result deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const studentResults = async (req: Request, res: Response) => {
  try {
    const results = await prisma.result.findMany({
      where: {
        studentId: String(req.params.studentId),
      },
      orderBy: { id: "desc" },
      include: resultInclude,
    });

    return res.status(200).json(uniqueResults(results));
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to get student results",
    });
  }
};

export const classResults = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = await teacherIdForRequest(req);
    if (teacherId === "") {
      return res.status(403).json({ message: "Teacher account was not found." });
    }
    const results = await prisma.result.findMany({
      where: {
        classId: String(req.params.classId),
        ...(teacherId
          ? { subject: { teachers: { some: { teacherId } } } }
          : {}),
      },
      orderBy: { id: "desc" },
      include: resultInclude,
    });

    return res.status(200).json(results);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to get class results",
    });
  }
};
