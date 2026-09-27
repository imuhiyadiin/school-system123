import { Request, Response } from "express";
import prisma from "../lip/prisma";

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
      total,
      minMarks,
    } = req.body;


    if (!name || !date || !type || !subjectId || !validMarks(total, minMarks)) {
      return res.status(400).json({
        message: "Enter valid total marks and minimum pass marks.",
      });
    }


    const exam = await prisma.exam.create({
      data: {
        name,
        date: new Date(date),
        type,
        subjectId,
        total: Number(total),
        minMarks: Number(minMarks),
      },
    });


    return res.status(201).json({
      message: "Exam created successfully",
      exam,
    });


  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });

  }
};
// Get All Exams

export const getExams = async (req: Request, res: Response) => {
  try {

    const exams = await prisma.exam.findMany({
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

export const getExam = async (req: Request, res: Response) => {
  try {

    const id = String(req.params.id);


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
