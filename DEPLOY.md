# Deploying WordWave to Hostinger (Business plan)

The Business plan runs Node.js web apps (up to 5 per account) with GitHub
auto-deploy, hPanel environment variables, SSH access, and free SSL — all of
which this app uses. These steps assume the repo
`XRAI-Studio/Word_Wave` and a domain managed in hPanel.

## 1. Create the Node.js app

1. hPanel → **Websites** → your domain → **Node.js** (Web Apps).
2. Choose **Deploy from GitHub** and connect `XRAI-Studio/Word_Wave`,
   branch `master`, with automatic deploys on push.
3. Framework: Hostinger should auto-detect **Next.js** (build `next build`,
   start `next start`). Set the **Node version to 24**.

## 2. Environment variables (hPanel → the app → Environment variables)

| Name | Value | Notes |
| --- | --- | --- |
| `NODE_ENV` | `production` | enables secure cookies |
| `DATABASE_PATH` | `/home/<hosting-user>/wordwave-data/wordwave.db` | **must be outside the deploy directory** so the database survives redeploys. A leading `~` is expanded, so `~/wordwave-data/wordwave.db` works too |
| `APP_URL` | `https://yourdomain.com` | used for Google OAuth redirects |
| `GOOGLE_CLIENT_ID` | from Google Cloud Console | optional — omit to hide the Google button |
| `GOOGLE_CLIENT_SECRET` | from Google Cloud Console | optional |

> **Set `DATABASE_PATH` before the first deploy, not after.** The build script
> runs `prisma migrate deploy && prisma db seed`, so migrations happen at build
> time. With the variable unset the build silently falls back to `prisma/dev.db`
> *inside* the deploy directory: the app still starts, but its database is
> replaced on every redeploy.


## 3. First-time database setup (SSH)

SSH is included in the Business plan (hPanel → Advanced → SSH Access).

```bash
mkdir -p ~/wordwave-data
cd ~/domains/yourdomain.com/nodejs   # the deployed app directory
DATABASE_PATH=~/wordwave-data/wordwave.db npm run db:deploy   # apply migrations
DATABASE_PATH=~/wordwave-data/wordwave.db npm run db:seed     # load the course
```

Re-run `db:deploy` after any deploy that includes a new migration; `db:seed`
is safe to re-run (it rebuilds course content and preserves user progress).

## 4. Google sign-in (optional)

1. [Google Cloud Console](https://console.cloud.google.com/) → create a
   project → **APIs & Services → Credentials → Create OAuth client ID**
   (type: Web application).
2. Authorized redirect URI: `https://yourdomain.com/api/auth/google/callback`.
3. Put the client ID/secret in the env vars above and restart the app.
4. Without these vars the login page simply hides the Google button —
   email/password still works.

## 5. Phone install (Android)

Once live over HTTPS, open the site in Chrome on the phone → menu → **Add to
Home screen**. The PWA manifest makes it launch fullscreen like an app. Log in
with the same account anywhere — progress lives in the server database, so
phone and PC always see the latest state.

## Troubleshooting / fallback: MySQL

If the `better-sqlite3` native module fails to build on Hostinger's deploy
runner, or the SQLite file gives trouble, switch to the MySQL database
included in the plan:

1. hPanel → Databases → create a MySQL database + user.
2. In `prisma/schema.prisma` change the datasource `provider` to `"mysql"`,
   replace the better-sqlite3 adapter in `src/lib/db.ts`, `prisma/seed.ts`,
   and `prisma.config.ts` with the Prisma MySQL driver adapter, and set
   `DATABASE_URL=mysql://user:pass@localhost:3306/dbname`.
3. Delete `prisma/migrations` and run `npx prisma migrate dev --name init`
   locally against a MySQL instance to regenerate migrations, then
   `npm run db:deploy && npm run db:seed` on the server.

Everything else (auth, rewards, course content) is database-agnostic through
Prisma.

## 6. Publish it to the MacScott showcase

The repo carries a `macscott.json` and is public, so once the app is live it
only needs a URL and the catalog topic:

1. Add `"liveUrl": "https://yourdomain.com"` to `macscott.json` on `master`.
   Leave `"embeddable": false` as it is -- WordWave signs users in, and browsers
   partition cookies for a cross-site iframe, so a login inside the showcase's
   embedded frame would produce a broken session. The orb launches it in a new
   tab instead.
2. Add the catalog topic: `gh api -X PUT repos/XRAI-Studio/Word_Wave/topics -f names[]=macscott-app`
3. Refresh the catalog immediately instead of waiting for the hourly cycle:
   `curl -X POST https://scott.macscott.net/api/revalidate -H "Authorization: Bearer $REVALIDATE_SECRET"`

`owner` is `both`, so the orb appears on Scott's and Alexander's sites.

## 7. Automatic database backups

The database holds real accounts and progress, and it is a single file. Back it
up on a schedule.

```bash
# hPanel -> Advanced -> Cron Jobs. Daily at 03:15.
cd ~/domains/yourdomain.com/nodejs && DATABASE_PATH=/home/<hosting-user>/wordwave-data/wordwave.db node scripts/backup-db.mjs
```

**Set `DATABASE_PATH` inline in the cron line as shown.** Cron does not inherit
the environment variables you set in hPanel for the web app. The script refuses
to run without it rather than guessing, precisely so a misconfigured job fails
loudly instead of quietly backing up an empty database for months.

Each run writes `wordwave-<timestamp>.db` to `~/wordwave-backups`, then verifies
the copy: it reopens it, runs `PRAGMA integrity_check`, and counts users and
challenges. A copy that cannot be opened is reported as a failure, so a green
run means a restorable file, not merely a file. Copies are made with SQLite's
online backup API, which is consistent even if someone is mid-lesson -- unlike
`cp`, which can capture a torn database.

Override `BACKUP_DIR` to write elsewhere, and `KEEP` to change how many are kept
(default 14; the oldest are pruned).

Check it after the first firing:

```bash
ls -lh ~/wordwave-backups
```

### Restoring

```bash
# 1. Stop the app in hPanel first, so nothing is mid-write.
cp ~/wordwave-data/wordwave.db ~/wordwave-data/wordwave.db.before-restore
cp ~/wordwave-backups/wordwave-<timestamp>.db ~/wordwave-data/wordwave.db
# 2. Start the app again.
```

Keep the `.before-restore` copy until you have confirmed the restore is good.
Progress made between the backup and the restore is lost -- that gap is the
backup interval, which is why daily is the minimum sensible schedule.
