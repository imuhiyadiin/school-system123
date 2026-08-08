-- AlterTable
ALTER TABLE "Issue" ADD COLUMN "classId" TEXT;

-- Backfill existing issues from each student's classroom membership.
UPDATE "Issue" AS issue
SET "classId" = classroom_student."classroomId"
FROM "ClassroomStudent" AS classroom_student
WHERE classroom_student."studentId" = issue."studentId"
  AND issue."classId" IS NULL;

-- AddForeignKey
ALTER TABLE "Issue"
ADD CONSTRAINT "Issue_classId_fkey"
FOREIGN KEY ("classId")
REFERENCES "Classroom"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
