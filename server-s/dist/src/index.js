"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const user_router_1 = __importDefault(require("./router/user-router"));
const student_router_1 = __importDefault(require("./router/student-router"));
const teacher_router_1 = __importDefault(require("./router/teacher-router"));
const result_router_1 = __importDefault(require("./router/result-router"));
const attendece_router_1 = __importDefault(require("./router/attendece-router"));
const casheir_router_1 = __importDefault(require("./router/casheir-router"));
const ckassroom_router_1 = __importDefault(require("./router/ckassroom-router"));
const dashboud_router_1 = __importDefault(require("./router/dashboud-router"));
const essue_router_1 = __importDefault(require("./router/essue-router"));
const exam_router_1 = __importDefault(require("./router/exam-router"));
const subject_router_1 = __importDefault(require("./router/subject-router"));
const timetable_router_1 = __importDefault(require("./router/timetable-router"));
const settings_router_1 = __importDefault(require("./router/settings-router"));
const fee_router_1 = __importDefault(require("./router/fee-router"));
const pyroll_router_1 = __importDefault(require("./router/pyroll-router"));
const employe_route_1 = __importDefault(require("./router/employe-route"));
const bus_router_1 = __importDefault(require("./router/bus-router"));
const auth_1 = require("./middelwere/auth");
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = ["http://localhost:3000", "https://cleint.vercel.app"];
        callback(null, !origin || allowedOrigins.includes(origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
}));
app.use(express_1.default.json());
// Vercel catch-all functions can pass the path with or without the /api prefix.
// Normalize both forms before Express route matching.
app.use((req, _res, next) => {
    if (req.path === "/api" || req.path.startsWith("/api/"))
        return next();
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
    next();
});
app.use("/api", (req, res, next) => {
    const publicPaths = ["/user/register", "/auth/register", "/user/login", "/auth/login", "/user/logout", "/auth/logout", "/user/student-login", "/auth/student-login", "/student/login", "/students/login", "/teacher/login"];
    const requestPath = req.originalUrl.replace(/^\/api/, "").split("?")[0];
    if (publicPaths.includes(req.path) || publicPaths.includes(requestPath))
        return next();
    return (0, auth_1.verifyToken)(req, res, () => (0, auth_1.requireApiPermission)(req, res, next));
});
app.use("/api/user", user_router_1.default);
app.use("/api/auth", user_router_1.default);
app.use("/api/student", student_router_1.default);
app.use("/api/students", student_router_1.default);
app.use("/api/teacher", teacher_router_1.default);
app.use("/api/result", result_router_1.default);
app.use("/api/attendance", attendece_router_1.default);
app.use("/api/cashier", casheir_router_1.default);
app.use("/api/classroom", ckassroom_router_1.default);
app.use("/api/dashboard", dashboud_router_1.default);
app.use("/api/issue", essue_router_1.default);
app.use("/api/exam", exam_router_1.default);
app.use("/api/subject", subject_router_1.default);
app.use("/api/timetable", timetable_router_1.default);
app.use("/api/settings", settings_router_1.default);
app.use("/api/fees", fee_router_1.default);
app.use("/api/payroll", pyroll_router_1.default);
app.use("/api/employee", employe_route_1.default);
app.use("/api/bus", bus_router_1.default);
// app.get("/api", (req, res) => {
//   res.json("Hello server");
// });
app.get("/api", (_req, res) => {
    res.json({ message: "Server is running" });
});
exports.default = app;
if (require.main === module) {
    const PORT = Number((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 8000);
    app.listen(PORT, () => console.log(`server is running ${PORT}`));
}
