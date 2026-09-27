ALTER TABLE "Staff" ADD COLUMN "gender" TEXT;
ALTER TABLE "Staff" ADD COLUMN "dob" TIMESTAMP(3);
ALTER TABLE "Staff" ADD COLUMN "address" TEXT;

CREATE TABLE "SalaryHistory" (
  "id" TEXT NOT NULL,
  "staffId" TEXT NOT NULL,
  "basicSalary" DOUBLE PRECISION NOT NULL,
  "allowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "previousSalary" DOUBLE PRECISION,
  "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SalaryHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SalaryHistory_staffId_effectiveDate_idx" ON "SalaryHistory"("staffId", "effectiveDate");
ALTER TABLE "SalaryHistory" ADD CONSTRAINT "SalaryHistory_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
