#!/usr/bin/env node
/**
 * Point-in-time backup of the WordWave SQLite database.
 *
 * Deliberately plain .mjs, not .ts: this runs from cron, whose PATH is barer
 * than the shell's, and requiring a TypeScript runner here would reintroduce
 * the "spawn tsx ENOENT" failure the seed step already hit. Plain `node` and
 * better-sqlite3 (already installed for the Prisma adapter) is all it needs.
 *
 * Usage:
 *   DATABASE_PATH=/home/<user>/wordwave-data/wordwave.db node scripts/backup-db.mjs
 *   node scripts/backup-db.mjs /path/to/wordwave.db
 *
 * Optional: BACKUP_DIR (default <db dir>/../wordwave-backups), KEEP (default 14).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";

function expand(value) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed === "~") return os.homedir();
  if (trimmed.startsWith("~/") || trimmed.startsWith("~\\")) {
    return path.resolve(os.homedir(), trimmed.slice(2));
  }
  return path.resolve(trimmed);
}

function fail(message) {
  console.error(`backup-db: ${message}`);
  process.exit(1);
}

// No fallback to prisma/dev.db on purpose. Cron does not inherit the app's
// environment, and a backup script that silently copies an empty throwaway
// database is worse than one that refuses to run -- you only find out on the
// day you need to restore.
const source = expand(process.argv[2] ?? process.env.DATABASE_PATH);
if (!source) {
  fail("set DATABASE_PATH (or pass the database path as an argument). Refusing to guess.");
}
if (!fs.existsSync(source)) {
  fail(`no database at ${source}`);
}

const backupDir = expand(process.env.BACKUP_DIR) ?? path.join(path.dirname(source), "..", "wordwave-backups");
const keep = Number.parseInt(process.env.KEEP ?? "14", 10);
if (!Number.isInteger(keep) || keep < 1) fail(`KEEP must be a positive integer, got ${process.env.KEEP}`);

fs.mkdirSync(backupDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const target = path.join(backupDir, `wordwave-${stamp}.db`);

const db = new Database(source, { readonly: true });
try {
  // Online backup: consistent even while the app is mid-write, unlike cp.
  await db.backup(target);
} finally {
  db.close();
}

// A copied file is not yet a backup. Prove it opens and holds real rows.
const check = new Database(target, { readonly: true });
try {
  const integrity = check.pragma("integrity_check", { simple: true });
  if (integrity !== "ok") fail(`integrity check failed on ${target}: ${integrity}`);
  const { users } = check.prepare("SELECT count(*) AS users FROM User").get();
  const { challenges } = check.prepare("SELECT count(*) AS challenges FROM Challenge").get();
  const size = (fs.statSync(target).size / 1024 / 1024).toFixed(1);
  console.log(`backup-db: ${target} (${size} MB, ${users} users, ${challenges} challenges, integrity ok)`);
} finally {
  check.close();
}

// Retention: newest `keep`, oldest pruned. Names sort chronologically.
const existing = fs
  .readdirSync(backupDir)
  .filter((name) => /^wordwave-.*\.db$/.test(name))
  .sort();
for (const name of existing.slice(0, Math.max(0, existing.length - keep))) {
  fs.unlinkSync(path.join(backupDir, name));
  console.log(`backup-db: pruned ${name}`);
}
