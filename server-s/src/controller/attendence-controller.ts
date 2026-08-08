import prisma from "../lip/prisma";
import { Request, Response } from "express";

export const createAttendance = async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      date,
      status,
    } = req.body;


    if (!studentId || !date || status === undefined) {
      return res.status(400).json({
        message: "Fill required data",
      });
    }


    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        date: new Date(date),
        status,
      },
      include: {
        student: true,
      },
    });


    return res.status(201).json({
      message: "Attendance created successfully",
      attendance,
    });


  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const markAttendance = createAttendance;


export const getAttendance = async (req: Request, res: Response) => {
  try {

    if (!req.params.id) {
      const attendance = await prisma.attendance.findMany({ include: { student: true }, orderBy: { date: "desc" } });
      return res.status(200).json(attendance);
    }

    const id = String(req.params.id);


    const attendance = await prisma.attendance.findUnique({
      where:{
        id,
      },
      include:{
        student:true,
      },
    });


    if(!attendance){
      return res.status(404).json({
        message:"Attendance not found",
      });
    }


    return res.status(200).json({
      attendance,
    });


  } catch(error){

    console.log(error);

    return res.status(500).json({
      message:"Server error",
    });

  }
};

export const updateAttendance = async (req: Request, res: Response) => {
  try {

    const id = String(req.params.id);

    const {
      date,
      status,
    } = req.body;


    const attendance = await prisma.attendance.findUnique({
      where:{
        id,
      },
    });


    if(!attendance){
      return res.status(404).json({
        message:"Attendance not found",
      });
    }


    const updatedAttendance = await prisma.attendance.update({

      where:{
        id,
      },

      data:{
        date: date ? new Date(date) : undefined,
        status,
      },

      include:{
        student:true,
      },

    });


    return res.status(200).json({
      message:"Attendance updated successfully",
      attendance: updatedAttendance,
    });


  } catch(error){

    console.log(error);

    return res.status(500).json({
      message:"Server error",
    });

  }
};




export const deleteAttendance = async (req: Request, res: Response) => {
  try {

    const id = String(req.params.id);


    const attendance = await prisma.attendance.findUnique({
      where:{
        id,
      },
    });


    if(!attendance){
      return res.status(404).json({
        message:"Attendance not found",
      });
    }


    await prisma.attendance.delete({
      where:{
        id,
      },
    });


    return res.status(200).json({
      message:"Attendance deleted successfully",
    });


  } catch(error){

    console.log(error);

    return res.status(500).json({
      message:"Server error",
    });

  }
};


export const studentAttendance = async (req: Request, res: Response) => {
  try {
    const attendance = await prisma.attendance.findMany({
      where: {
        studentId: String(req.params.studentId),
      },
    });

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Failed to get student attendance" });
  }
};


