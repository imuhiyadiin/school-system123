-- Store the passing threshold selected for every exam.
ALTER TABLE "Exam"
ADD COLUMN "minMarks" INTEGER NOT NULL DEFAULT 33;

-- Preserve the former 33% passing rule for exams that already exist.
UPDATE "Exam"
SET "minMarks" = CEIL("total" * 0.33)::INTEGER;
