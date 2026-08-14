import { Request, Response } from "express";
import prisma from "../lip/prisma";

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

export const getSubjects = async (req: Request, res: Response) => {
  try {

    const subjects = await prisma.subject.findMany({
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

 export const getSubject = async (req: Request, res: Response) => {
  try {

    const id = String(req.params.id);


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
