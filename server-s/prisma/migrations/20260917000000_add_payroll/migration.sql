CREATE TYPE "PayrollStatus" AS ENUM ('PENDING', 'PAID');

ALTER TABLE "Teacher"
  ADD COLUMN "basicSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "allowance" DOUBLE PRECISION NOT NULL DEFAULT 0;

CREATE TABLE "Payroll" (
  "id" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "month" INTEGER NOT NULL,
  "year" INTEGER NOT NULL,
  "basicSalary" DOUBLE PRECISION NOT NULL,
  "allowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "deduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "advance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "netSalary" DOUBLE PRECISION NOT NULL,
  "status" "PayrollStatus" NOT NULL DEFAULT 'PENDING',
  "paymentDate" TIMESTAMP(3),
  "paymentMethod" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Payroll_teacherId_month_year_key" ON "Payroll"("teacherId", "month", "year");
CREATE INDEX "Payroll_month_year_idx" ON "Payroll"("month", "year");
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
