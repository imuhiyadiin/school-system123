import prisma from "../lip/prisma";
import { Request, Response } from "express";

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const [users, students, teachers, classrooms, subjects, exams, results, attendance, issues, timetable, recentResults, recentAttendance, recentIssues] = await Promise.all([
      prisma.user.count(),
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.classroom.count(),
      prisma.subject.count(),
      prisma.exam.count(),
      prisma.result.count(),
      prisma.attendance.count(),
      prisma.issue.count(),
      prisma.timetable.count(),
      prisma.result.findMany({ orderBy: { id: "desc" }, take: 5 }),
      prisma.attendance.findMany({ orderBy: { date: "desc" }, take: 5 }),
      prisma.issue.findMany({ orderBy: { id: "desc" }, take: 5 }),
    ]);

    res.status(200).json({
      users,
      students,
      teachers,
      classrooms,
      subjects,
      exams,
      results,
      attendance,
      issues,
      timetable,
      recentResults,
      recentAttendance,
      recentIssues,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get dashboard data" });
  }
};


export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to get users" });
  }
};


export const changeRole = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: {
        id: String(req.params.id),
      },
      data: {
        role: req.body.role,
      },
    });

    res.status(200).json({
      message: "User role changed successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to change user role" });
  }
};


export const deleteUser = async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({
      where: {
        id: String(req.params.id),
      },
    });

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};


