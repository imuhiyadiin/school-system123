import { Request, Response } from "express";
import prisma from "../lip/prisma";

// Create Exam

export const createExam = async (req: Request, res: Response) => {
  try {
    const {
      name,
      date,
      type,
    } = req.body;


    if (!name || !date || !type) {
      return res.status(400).json({
        message: "Fill required data",
      });
    }


    const exam = await prisma.exam.create({
      data: {
        name,
        date: new Date(date),
        type,
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
      include: {
        results: true,
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


    const updatedExam = await prisma.exam.update({

      where: {
        id,
      },

      data: {
        name,
        date: date ? new Date(date) : undefined,
        type,
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
