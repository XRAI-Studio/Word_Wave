-- Add multi-course support (Spanish + Classical Latin).
--
-- Existing content is the single Spanish course. This migration is written by
-- hand (Prisma scaffold + explicit backfill) so it is NON-DESTRUCTIVE:
--   * Spanish content IDs (Word/Section/Unit/Lesson/Challenge) are preserved
--     unchanged, so existing LessonProgress / WordReview / meta.wordIds stay valid.
--   * All existing Word/Section rows are backfilled to the Spanish course ("es").
--   * All existing users are set to the Spanish course as their active course,
--     so no existing user is ever sent to the first-run picker.
--   * Section.level / Section.fillBlank are backfilled from the current global
--     order (10 sections per level: 1-10 = L1, 11-20 = L2, 21-30 = L3 fill-blank).

-- AlterTable: nullable active-course pointer (brand-new users only stay null).
ALTER TABLE "User" ADD COLUMN "activeCourseId" TEXT;

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "promptLanguageName" TEXT NOT NULL,
    "emblem" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "correctLabel" TEXT NOT NULL,
    "celebrateLabel" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true
);

-- Seed the Spanish course row up front so the FK backfills below are valid.
INSERT INTO "Course" ("id", "code", "name", "promptLanguageName", "emblem", "order", "correctLabel", "celebrateLabel", "isAvailable")
VALUES ('es', 'es', 'Spanish', 'Spanish', '🇪🇸', 1, '¡Correcto!', '¡Muy bien!', true);

-- Existing users default to Spanish; their progress is untouched.
UPDATE "User" SET "activeCourseId" = 'es' WHERE "activeCourseId" IS NULL;

-- RedefineTables: add courseId (+ level/fillBlank on Section) to the content
-- tables, backfilling every existing row to the Spanish course.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Section" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "fillBlank" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "Section_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Section" ("id", "courseId", "level", "fillBlank", "title", "description", "order")
SELECT
    "id",
    'es',
    CASE WHEN "order" <= 10 THEN 1 WHEN "order" <= 20 THEN 2 ELSE 3 END,
    CASE WHEN "order" > 20 THEN true ELSE false END,
    "title",
    "description",
    "order"
FROM "Section";
DROP TABLE "Section";
ALTER TABLE "new_Section" RENAME TO "Section";
CREATE TABLE "new_Word" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    CONSTRAINT "Word_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Word" ("id", "courseId", "term", "translation")
SELECT "id", 'es', "term", "translation" FROM "Word";
DROP TABLE "Word";
ALTER TABLE "new_Word" RENAME TO "Word";
CREATE UNIQUE INDEX "Word_courseId_term_key" ON "Word"("courseId", "term");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");
