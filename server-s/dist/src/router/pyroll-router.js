"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pyroll_controller_1 = require("../controller/pyroll-controller");
const router = (0, express_1.Router)();
// Create Payroll
router.post("/", pyroll_controller_1.createPayroll);
// Get All Payrolls
router.get("/", pyroll_controller_1.getPayrolls);
// Get Monthly Payroll Reports
router.get("/reports", pyroll_controller_1.getPayrollReports);
// Get Single Payroll
router.get("/:id", pyroll_controller_1.getPayroll);
// Update Payroll
router.put("/:id", pyroll_controller_1.updatePayroll);
// Delete Payroll
router.delete("/:id", pyroll_controller_1.deletePayroll);
exports.default = router;
