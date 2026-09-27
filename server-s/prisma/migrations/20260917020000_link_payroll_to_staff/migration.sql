ALTER TABLE "Payroll" ALTER COLUMN "teacherId" DROP NOT NULL;
ALTER TABLE "Payroll" ADD COLUMN "staffId" TEXT;
CREATE UNIQUE INDEX "Payroll_staffId_month_year_key" ON "Payroll"("staffId", "month", "year");
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
