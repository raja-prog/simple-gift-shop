# Backup & migration bundle

Everything needed to move this app off Vercel + Prisma Postgres to any other host.

## What's in here
- `db-backup.json` — full database export (all tables: categories, products, product images).
- `vercel-env.txt` — the environment variables that were set on Vercel (production/preview/development).

## What is NOT here (already safe elsewhere)
- **Application code** — it's in GitHub: `raja-prog/simple-gift-shop` (branch `main`). Clone that anywhere.
- **Database schema** — defined in `prisma/schema.prisma` and `prisma/migrations/` (in the repo).

## Re-export the database anytime
```bash
DATABASE_URL="<current-db-url>" node scripts/export-db.js
```

## Restore to a NEW Postgres database (any provider)
1. Point `DATABASE_URL` at the new empty Postgres (Neon, Supabase, Railway, Render, etc.).
2. Create the schema:
   ```bash
   DATABASE_URL="<new-db-url>" npx prisma migrate deploy
   ```
3. Load the data:
   ```bash
   DATABASE_URL="<new-db-url>" node scripts/restore-db.js
   ```

## Deploy the app on a cheaper/free host
The app is a standard Next.js app. Options that have free tiers:
- **Netlify** — connect the GitHub repo, set the env vars from `vercel-env.txt`.
- **Cloudflare Pages** — connect repo, add env vars.
- **Railway / Render** — can host both the app and the Postgres DB together.

On any host: set the same env vars (`DATABASE_URL`, `NEXT_PUBLIC_STORE_NAME`,
`NEXT_PUBLIC_WHATSAPP_NUMBER`), run `prisma migrate deploy` at build, then start Next.js.

## Security
`db-backup.json` and `vercel-env.txt` contain secrets/customer data. They are git-ignored.
Keep them private and rotate the database credentials after migrating.
