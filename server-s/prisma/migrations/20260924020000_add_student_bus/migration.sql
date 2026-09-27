ALTER TABLE "Student" ADD COLUMN "busId" TEXT;

ALTER TABLE "Student"
  ADD CONSTRAINT "Student_busId_fkey"
  FOREIGN KEY ("busId") REFERENCES "Bus"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Student_busId_idx" ON "Student"("busId");

