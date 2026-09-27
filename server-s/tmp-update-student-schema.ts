import prisma from "./src/lip/prisma";

async function updateStudentSchema() {
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "Student" ALTER COLUMN "userId" DROP NOT NULL'
  );
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "parentPhone" TEXT'
  );
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "totalFee" DOUBLE PRECISION NOT NULL DEFAULT 0'
  );
  console.log("Student database schema updated.");
}

updateStudentSchema()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
