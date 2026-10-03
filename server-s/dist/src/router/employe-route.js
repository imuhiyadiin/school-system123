"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employe_controller_1 = require("../controller/employe-controller");
const router = (0, express_1.Router)();
// Create Employee
router.post("/", employe_controller_1.createEmployee);
// Get All Employees
router.get("/", employe_controller_1.getEmployees);
// Get Single Employee
router.get("/:id", employe_controller_1.getEmployee);
// Get Employee Salary History
router.get("/:id/salary-history", employe_controller_1.getEmployeeSalaryHistory);
// Update Employee
router.put("/:id", employe_controller_1.updateEmployee);
// Delete Employee
router.delete("/:id", employe_controller_1.deleteEmployee);
exports.default = router;
