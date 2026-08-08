-- AlterTable
ALTER TABLE "Result" ADD COLUMN "classId" TEXT;

-- Backfill existing results from each student's classroom membership.
UPDATE "Result" AS result
SET "classId" = classroom_student."classroomId"
FROM "ClassroomStudent" AS classroom_student
WHERE classroom_student."studentId" = result."studentId"
  AND result."classId" IS NULL;

-- AddForeignKey
ALTER TABLE "Result"
ADD CONSTRAINT "Result_classId_fkey"
FOREIGN KEY ("classId")
REFERENCES "Classroom"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
