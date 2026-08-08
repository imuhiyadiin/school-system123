import { Router } from "express";
import { allUsers, chanegRole, deleteUser, logout, registerUser, studentLogin, updateUser, userLogin, whoami } from "../controller/user-controller";
import { verifyToken } from "../middelwere/auth";

const router = Router();
router.post("/register", registerUser);
router.post("/login", userLogin);
router.post("/logout", logout);
router.post("/student-login", studentLogin);
router.get("/whoami", verifyToken, whoami);
router.get("/", verifyToken, allUsers);
router.patch("/role/change", verifyToken, chanegRole);
router.patch("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);
export default router;
