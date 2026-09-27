CREATE TABLE "TeacherAttendance" (
  "id" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PRESENT',
  "remark" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherAttendance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeacherAttendance_teacherId_date_key" ON "TeacherAttendance"("teacherId", "date");
CREATE INDEX "TeacherAttendance_date_idx" ON "TeacherAttendance"("date");
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
