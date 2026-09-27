CREATE TABLE "Staff" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "position" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "basicSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "allowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Staff_employeeId_key" ON "Staff"("employeeId");
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");
