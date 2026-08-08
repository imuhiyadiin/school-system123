import prisma from "../lip/prisma";
import { Request, Response } from "express";

const resultInclude = {
  student: true,
  classroom: true,
  subject: true,
  exam: true,
};

export const createResult = async (req: Request, res: Response) => {
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
    let defaultSubject = subjectId ? null : await prisma.subject.findFirst({
      where: classroom ? { grade: classroom.grade } : undefined,
      orderBy: { name: "asc" },
    });

    if (!subjectId && !defaultSubject) {
      defaultSubject = await prisma.subject.findFirst({
        orderBy: { name: "asc" },
      });
    }

    if (!subjectId && !defaultSubject) {
      defaultSubject = await prisma.subject.create({
        data: {
          name: "General Subject",
          grade: classroom?.grade ?? 1,
          description: "Automatically created for result entry",
        },
      });
    }

    const result = await prisma.result.create({
      data: {
        studentId,
        classId,
        subjectId: subjectId ?? defaultSubject!.id,
        examId: resultExamId,
        schoolYear,
        marks,
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

export const getResults = async (_req: Request, res: Response) => {
  try {
    const results = await prisma.result.findMany({
      include: resultInclude,
    });

    return res.status(200).json({
      results,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getResult = async (req: Request, res: Response) => {
  try {
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
    });

    if (!existingResult) {
      return res.status(404).json({
        message: "Result not found",
      });
    }

    const result = await prisma.result.update({
      where: { id },
      data: {
        ...(studentId !== undefined ? { studentId } : {}),
        ...(classId !== undefined ? { classId } : {}),
        ...(subjectId !== undefined ? { subjectId } : {}),
        ...(examId !== undefined ? { examId } : {}),
        ...(schoolYear !== undefined ? { schoolYear } : {}),
        ...(marks !== undefined ? { marks } : {}),
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
      include: resultInclude,
    });

    return res.status(200).json(results);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to get student results",
    });
  }
};

export const classResults = async (req: Request, res: Response) => {
  try {
    const results = await prisma.result.findMany({
      where: {
        classId: String(req.params.classId),
      },
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
