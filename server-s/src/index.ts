 
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./router/user-router";
import studentRouter from "./router/student-router";
import teacherRouter from "./router/teacher-router";
import resultRouter from "./router/result-router";
import attendanceRouter from "./router/attendece-router";
import cashierRouter from "./router/casheir-router";
import classroomRouter from "./router/ckassroom-router";
import dashboardRouter from "./router/dashboud-router";
import issueRouter from "./router/essue-router";
import examRouter from "./router/exam-router";
import subjectRouter from "./router/subject-router";
import timetableRouter from "./router/timetable-router";
import settingsRouter from "./router/settings-router";
import feeRouter from "./router/fee-router";
import payrollRouter from "./router/pyroll-router";
import employeeRouter from "./router/employe-route";
import busRouter from "./router/bus-router";
import { requireApiPermission, verifyToken } from "./middelwere/auth";

const app = express();

dotenv.config();
 
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ["http://localhost:3000", "https://cleint.vercel.app"];
    callback(null, !origin || allowedOrigins.includes(origin));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
}));

app.use(express.json());
app.use("/api", (req, res, next) => {
  const publicPaths = ["/user/register", "/auth/register", "/user/login", "/auth/login", "/user/logout", "/auth/logout", "/user/student-login", "/auth/student-login", "/student/login", "/students/login", "/teacher/login"];
  const requestPath = req.originalUrl.replace(/^\/api/, "").split("?")[0];
  if (publicPaths.includes(req.path) || publicPaths.includes(requestPath)) return next();
  return verifyToken(req, res, () => requireApiPermission(req, res, next));
});
app.use("/api/user", userRouter);
app.use("/api/auth", userRouter);
app.use("/api/student", studentRouter);
app.use("/api/students", studentRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/result", resultRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/cashier", cashierRouter);
app.use("/api/classroom", classroomRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/issue", issueRouter);
app.use("/api/exam", examRouter);
app.use("/api/subject", subjectRouter);
app.use("/api/timetable", timetableRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/fees", feeRouter);
app.use("/api/payroll", payrollRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/bus", busRouter);
   
// app.get("/api", (req, res) => {
//   res.json("Hello server");
// });
 
app.get("/api", (_req, res) => {
  res.json({ message: "Server is running" });
});

export default app;

if (require.main === module) {
  const PORT = Number(process.env.PORT ?? 8000);
  app.listen(PORT, () => console.log(`server is running ${PORT}`));
}
