import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  getEmployee,
  getEmployeeSalaryHistory,
  updateEmployee,
  deleteEmployee,
} from "../controller/employe-controller";

const router = Router();

// Create Employee
router.post("/", createEmployee);

// Get All Employees
router.get("/", getEmployees);

// Get Single Employee
router.get("/:id", getEmployee);

// Get Employee Salary History
router.get("/:id/salary-history", getEmployeeSalaryHistory);

// Update Employee
router.put("/:id", updateEmployee);

// Delete Employee
router.delete("/:id", deleteEmployee);

export default router;
