import jwt from "jsonwebtoken";
import { UserData } from "../secure/generate-token";
import { NextFunction, Request, Response } from "express";
import prisma from "../lip/prisma";
const secret = process.env.SECRET_KEY


export interface AuthRequest  extends Request {
    user?:UserData
}

export const verifyToken = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try {
        // Bearer data
        const token = req.headers.authorization?.startsWith("Bearer") && req.headers.authorization.split(" ")[1]

        if(!token){
            return res.status(401).json({
                message:"unAuthorized!."
            })
        }
        const decoded:{email:string,id:string,role:string} | any = jwt.verify(token,secret!)
        if (decoded.role === "STUDENT") {
            const student = await prisma.student.findUnique({ where: { id: decoded.id }, select: { id: true } })
            if (!student) return res.status(401).json({ message: "invalid token" })
            req.user = { ...decoded, role: "STUDENT", permissions: [] }
        } else {
            const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { role: true, permissions: true } })
            if (!user) return res.status(401).json({ message: "invalid token" })
            req.user = { ...decoded, role: user.role, permissions: user.permissions }
        }
        next()

    } catch (error) {
        console.log(error)
        res.status(401).json({
            message:"invalid token"
        })
    }
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== "ADMIN") {
        return res.status(403).json({
            message: "Admin access is required",
        });
    }

    next();
}

export const requireApiPermission = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role === "ADMIN" || !req.user?.permissions?.length) return next()
    const path = req.path
    const permissions: Array<[string, string]> = [
        ["/students", "/dashboud/students"], ["/student", "/dashboud/students"],
        ["/teacher", "/dashboud/teachers"], ["/classroom", "/dashboud/classrooms"],
        ["/subject", "/dashboud/subjects"], ["/exam", "/dashboud/exams"],
        ["/result", "/dashboud/results"], ["/attendance", "/dashboud/attendance"],
        ["/timetable", "/dashboud/timetable"], ["/fees", "/dashboud/fees"],
        ["/bus", "/dashboud/buses"],
        ["/payroll", "/dashboud/payroll"],
        ["/staff", "/dashboud/staff"],
        ["/issue", "/dashboud/issues"], ["/user", "/dashboud/users"],
    ]
    const required = permissions.find(([prefix]) => path.startsWith(prefix))?.[1]
    if (!required || req.user.permissions.includes(required)) return next()
    return res.status(403).json({ message: "You are not authorized to access this page." })
}

export const requireDashboardAccess = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== "ADMIN" && req.user?.role !== "TEACHER") {
        return res.status(403).json({
            message: "You are not authorized to access this dashboard",
        });
    }

    next();
}

export const requireStudent = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== "STUDENT") return res.status(403).json({ message: "Student access is required" });
    next();
}

export const requireOwnStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const requestedId = String(req.params.studentId ?? req.params.id);
        const student = await prisma.student.findUnique({ where: { id: req.user?.id } });
        if (!student || requestedId !== student.id) {
            return res.status(403).json({ message: "You are not authorized to access this student record" });
        }
        next();
    } catch {
        res.status(500).json({ message: "Unable to verify student access" });
    }
}
