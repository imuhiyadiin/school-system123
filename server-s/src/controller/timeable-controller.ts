import prisma from "../lip/prisma";
import { Request, Response } from "express";

export const createTimetable = async (req: Request, res: Response) => {
  try {
    const timetable = await prisma.timetable.create({
      data: req.body,
    });

    res.status(201).json(timetable);
  } catch (error) {
    res.status(500).json({ message: "Failed to create timetable" });
  }
};


export const getTimetables = async (req: Request, res: Response) => {
  try {
    const timetables = await prisma.timetable.findMany();

    res.status(200).json(timetables);
  } catch (error) {
    res.status(500).json({ message: "Failed to get timetables" });
  }
};


export const getTimetable = async (req: Request, res: Response) => {
  try {
    const timetable = await prisma.timetable.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({ message: "Failed to get timetable" });
  }
};


export const updateTimetable = async (req: Request, res: Response) => {
  try {
    const timetable = await prisma.timetable.update({
      where: {
        id: String(req.params.id),
      },
      data: req.body,
    });

    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({ message: "Failed to update timetable" });
  }
};


export const deleteTimetable = async (req: Request, res: Response) => {
  try {
    await prisma.timetable.delete({
      where: {
        id: String(req.params.id),
      },
    });

    res.status(200).json({
      message: "Timetable deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete timetable" });
  }
};


