/* Local Postgres for development and e2e (`npm run db:dev`): a real Postgres 17 (the
 * production major version) from the `embedded-postgres` package, data in `.pgdata/`
 * (git-ignored), on port 54329. It stays up until Ctrl+C.
 *
 * Put the printed URL in `.env` as DATABASE_URL, then `npx prisma migrate deploy` and
 * `npm run db:seed` once. `prisma dev` was tried first; its PGlite engine dropped
 * connections under concurrent transactions, which the e2e exercises on purpose.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const PORT = 54329;
const dir = path.join(__dirname, "..", ".pgdata");

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: dir,
    port: PORT,
    user: "postgres",
    password: "postgres",
    persistent: true,
    // Windows would otherwise initialise the cluster in its ANSI code page (WIN1252),
    // which cannot store the course emblems; production is UTF-8.
    initdbFlags: ["--encoding=UTF8", "--no-locale"],
  });
  const fresh = !existsSync(dir);
  if (fresh) await pg.initialise();
  await pg.start();
  if (fresh) await pg.createDatabase("wordwave");
  console.log(`Local Postgres 17 is up.\nDATABASE_URL="postgres://postgres:postgres@localhost:${PORT}/wordwave"`);
  const stop = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
