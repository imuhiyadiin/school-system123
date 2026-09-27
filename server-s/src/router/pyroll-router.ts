import { Router } from "express";

import {
  createPayroll,
  getPayrolls,
  getPayrollReports,
  getPayroll,
  updatePayroll,
  deletePayroll,
} from "../controller/pyroll-controller";

const router = Router();

// Create Payroll
router.post("/", createPayroll);

// Get All Payrolls
router.get("/", getPayrolls);

// Get Monthly Payroll Reports
router.get("/reports", getPayrollReports);

// Get Single Payroll
router.get("/:id", getPayroll);

// Update Payroll
router.put("/:id", updatePayroll);

// Delete Payroll
router.delete("/:id", deletePayroll);

export default router;
