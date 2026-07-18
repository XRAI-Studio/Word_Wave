# Deploying WordWave to Hostinger (Business plan)

The Business plan runs Node.js web apps (up to 5 per account) with GitHub
auto-deploy, hPanel environment variables, SSH access, and free SSL — all of
which this app uses. These steps assume the repo
`alexandermacscott-del/lingoduo` and a domain managed in hPanel.

## 1. Create the Node.js app

1. hPanel → **Websites** → your domain → **Node.js** (Web Apps).
2. Choose **Deploy from GitHub** and connect `alexandermacscott-del/lingoduo`,
   branch `master`, with automatic deploys on push.
3. Framework: Hostinger should auto-detect **Next.js** (build `next build`,
   start `next start`). Set the **Node version to 24**.

## 2. Environment variables (hPanel → the app → Environment variables)

| Name | Value | Notes |
| --- | --- | --- |
| `NODE_ENV` | `production` | enables secure cookies |
| `DATABASE_PATH` | `/home/<hosting-user>/lingoduo-data/lingoduo.db` | **must be outside the deploy directory** so the database survives redeploys |
| `APP_URL` | `https://yourdomain.com` | used for Google OAuth redirects |
| `GOOGLE_CLIENT_ID` | from Google Cloud Console | optional — omit to hide the Google button |
| `GOOGLE_CLIENT_SECRET` | from Google Cloud Console | optional |

## 3. First-time database setup (SSH)

SSH is included in the Business plan (hPanel → Advanced → SSH Access).

```bash
mkdir -p ~/lingoduo-data
cd ~/domains/yourdomain.com/nodejs   # the deployed app directory
DATABASE_PATH=~/lingoduo-data/lingoduo.db npm run db:deploy   # apply migrations
DATABASE_PATH=~/lingoduo-data/lingoduo.db npm run db:seed     # load the course
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
