import { Router } from "express";
import { changeRole, deleteUser, getDashboard, getUsers } from "../controller/dashboud-controller";
import { requireAdmin, requireDashboardAccess, verifyToken } from "../middelwere/auth";
const router = Router();
router.get("/", verifyToken, requireDashboardAccess, getDashboard); router.get("/users", verifyToken, requireAdmin, getUsers); router.patch("/users/:id/role", verifyToken, requireAdmin, changeRole); router.delete("/users/:id", verifyToken, requireAdmin, deleteUser);
export default router;
