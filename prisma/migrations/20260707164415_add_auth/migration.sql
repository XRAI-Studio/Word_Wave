-- CreateTable
CREATE TABLE "Session" (
    "token" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "displayName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hearts" INTEGER NOT NULL DEFAULT 5,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TEXT,
    "heartsUpdatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gems" INTEGER NOT NULL DEFAULT 0,
    "streakFreezes" INTEGER NOT NULL DEFAULT 0,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "perfectLessons" INTEGER NOT NULL DEFAULT 0,
    "reviewsCompleted" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("gems", "hearts", "heartsUpdatedAt", "id", "lastActiveDate", "lessonsCompleted", "perfectLessons", "reviewsCompleted", "streakCount", "streakFreezes", "xp") SELECT "gems", "hearts", "heartsUpdatedAt", "id", "lastActiveDate", "lessonsCompleted", "perfectLessons", "reviewsCompleted", "streakCount", "streakFreezes", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
