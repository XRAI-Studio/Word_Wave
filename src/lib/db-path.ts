import os from "node:os";
import path from "node:path";

/**
 * Resolve the SQLite file location from DATABASE_PATH.
 *
 * A leading `~` is expanded here because the value usually arrives from a
 * hosting panel's environment-variable field, which is a plain string rather
 * than a shell. Without this, `path.resolve("~/wordwave-data/wordwave.db")`
 * yields a literal `~` directory inside the deploy folder — the app appears to
 * work, then loses its database on the next redeploy.
 */
export function resolveDbPath(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  if (trimmed === "~") return os.homedir();
  if (trimmed.startsWith("~/") || trimmed.startsWith("~\\")) {
    return path.resolve(os.homedir(), trimmed.slice(2));
  }
  return path.resolve(trimmed);
}
