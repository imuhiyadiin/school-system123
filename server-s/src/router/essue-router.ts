import { Router } from "express";
import { createIssue, deleteIssue, getIssue, getIssues, resolveIssue, updateIssue } from "../controller/essue-controlles";
import { verifyToken } from "../middelwere/auth";
const router = Router();
router.post("/", createIssue); router.get("/", verifyToken, getIssues); router.get("/:id", getIssue); router.patch("/:id", updateIssue); router.patch("/:id/resolve", resolveIssue); router.delete("/:id", deleteIssue);
export default router;
