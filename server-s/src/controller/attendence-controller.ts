import prisma from "../lip/prisma";
import { Request, Response } from "express";

const dayRange = (value: string) => { const start = new Date(`${value.slice(0, 10)}T00:00:00.000Z`); const end = new Date(start); end.setUTCDate(end.getUTCDate() + 1); return { start, end }; };

export const getTeacherAttendance = async (req: Request, res: Response) => {
  try {
    const { start, end } = dayRange(String(req.query.date ?? new Date().toISOString().slice(0, 10)))
    const [teachers, attendance] = await Promise.all([
      prisma.teacher.findMany({ select: { id: true, fullName: true, phone: true }, orderBy: { fullName: "asc" } }),
      prisma.teacherAttendance.findMany({ where: { date: { gte: start, lt: end } } }),
    ])
    res.json({ teachers, attendance })
  } catch { res.status(500).json({ message: "Failed to load teacher attendance" }) }
}

export const saveTeacherAttendance = async (req: Request, res: Response) => {
  try {
    const { date, records } = req.body as { date?: string; records?: Array<{ teacherId: string; status: string; remark?: string }> }
    if (!date || !Array.isArray(records) || !records.length) return res.status(400).json({ message: "Date and teacher attendance records are required" })
    const valid = new Set(["PRESENT", "ABSENT", "ON_LEAVE"])
    if (records.some((record) => !record.teacherId || !valid.has(record.status))) return res.status(400).json({ message: "Invalid teacher attendance record" })
    const { start, end } = dayRange(date)
    await prisma.$transaction([prisma.teacherAttendance.deleteMany({ where: { date: { gte: start, lt: end } } }), prisma.teacherAttendance.createMany({ data: records.map((record) => ({ teacherId: record.teacherId, date: start, status: record.status, remark: record.remark || null })) })])
    res.json({ message: "Teacher attendance saved successfully" })
  } catch { res.status(500).json({ message: "Failed to save teacher attendance" }) }
}

export const createAttendance = async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      date,
      status,
      remark,
      classroomId,
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
        status: typeof status === "string" ? status : status ? "PRESENT" : "ABSENT",
        remark: remark || null,
        classroomId: classroomId || null,
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

export const getClassroomAttendance = async (req: Request, res: Response) => {
  try {
    const classroomId = String(req.params.classroomId)
    const { start, end } = dayRange(String(req.query.date ?? new Date().toISOString().slice(0, 10)))
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        teacher: { select: { fullName: true } },
        students: { include: { student: true } },
      },
    })
    if (!classroom) return res.status(404).json({ message: "Classroom not found" })

    const attendance = await prisma.attendance.findMany({
      where: {
        date: { gte: start, lt: end },
        OR: [
          { classroomId },
          {
            classroomId: null,
            studentId: { in: classroom.students.map(({ student }) => student.id) },
          },
        ],
      },
      orderBy: { date: "asc" },
    })
    res.json({ classroom, attendance })
  } catch {
    res.status(500).json({ message: "Failed to load classroom attendance" })
  }
}

export const saveClassroomAttendance = async (req: Request, res: Response) => {
  try { const { classroomId, date, records } = req.body as { classroomId?: string; date?: string; records?: Array<{ studentId: string; status: string; remark?: string }> }; if (!classroomId || !date || !Array.isArray(records) || !records.length) return res.status(400).json({ message: "Classroom, date and attendance records are required" }); const valid = new Set(["PRESENT", "ABSENT", "HALF_DAY"]); if (records.some((record) => !record.studentId || !valid.has(record.status))) return res.status(400).json({ message: "Invalid attendance record" }); const { start, end } = dayRange(date); await prisma.$transaction([prisma.attendance.deleteMany({ where: { classroomId, date: { gte: start, lt: end } } }), prisma.attendance.createMany({ data: records.map((record) => ({ studentId: record.studentId, classroomId, date: start, status: record.status, remark: record.remark || null })) })]); res.json({ message: "Attendance saved successfully" }); } catch { res.status(500).json({ message: "Failed to save attendance" }); }
};


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
        ...(status !== undefined ? { status: typeof status === "string" ? status : status ? "PRESENT" : "ABSENT" } : {}),
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


