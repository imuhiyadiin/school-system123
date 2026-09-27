ALTER TABLE "Attendance"
  ALTER COLUMN "status" TYPE TEXT USING CASE WHEN "status" THEN 'PRESENT' ELSE 'ABSENT' END,
  ALTER COLUMN "status" SET DEFAULT 'PRESENT';

ALTER TABLE "Attendance" ADD COLUMN IF NOT EXISTS "remark" TEXT;
ALTER TABLE "Attendance" ADD COLUMN IF NOT EXISTS "classroomId" TEXT;

DO $$l
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Attendance_classroomId_fkey') THEN
    ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_classroomId_fkey"
      FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
