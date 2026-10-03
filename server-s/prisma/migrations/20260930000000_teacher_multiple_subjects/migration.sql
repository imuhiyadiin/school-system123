CREATE TABLE "TeacherSubject" (
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    CONSTRAINT "TeacherSubject_pkey" PRIMARY KEY ("teacherId", "subjectId")
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'Teacher' AND column_name = 'subjectId'
    ) THEN
        EXECUTE 'INSERT INTO "TeacherSubject" ("teacherId", "subjectId")
                 SELECT "id", "subjectId" FROM "Teacher" WHERE "subjectId" IS NOT NULL
                 ON CONFLICT DO NOTHING';
    END IF;
END $$;

ALTER TABLE "TeacherSubject"
    ADD CONSTRAINT "TeacherSubject_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TeacherSubject"
    ADD CONSTRAINT "TeacherSubject_subjectId_fkey"
    FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "TeacherSubject_subjectId_idx" ON "TeacherSubject"("subjectId");

ALTER TABLE "Teacher" DROP COLUMN IF EXISTS "subjectId";
