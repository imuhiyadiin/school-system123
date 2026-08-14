ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "subjectId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Exam_subjectId_fkey') THEN
    ALTER TABLE "Exam"
      ADD CONSTRAINT "Exam_subjectId_fkey"
      FOREIGN KEY ("subjectId") REFERENCES "Subject"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "total" INTEGER NOT NULL DEFAULT 100;
