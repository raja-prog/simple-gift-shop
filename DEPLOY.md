# Deployment Guide (Vercel)

This project is a Next.js (App Router) application with Prisma + PostgreSQL and Tailwind CSS.
Below are concise steps to deploy on Vercel.

---
## 1. Prerequisites
- Vercel account
- A production PostgreSQL database (e.g. Vercel Postgres, Neon, Supabase, Railway, PlanetScale Postgres beta)
- Node 18+ runtime (Vercel automatically provides)

---
## 2. Environment Variables
Set these in your Vercel Project Settings (Environment Variables) for Production (and Preview if needed):

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | Connection string for Postgres (include `?pgbouncer=true&connect_timeout=15` if using pooled services) |
| NEXT_PUBLIC_STORE_NAME | Yes | Public store name for NavBar and metadata |
| NEXT_PUBLIC_WHATSAPP_NUMBER | Optional | International-format number without plus (e.g. 919600717850) |
| NEXT_PUBLIC_ADMIN_PASSWORD | Optional | Simple password gate for admin page (if used) |
| NEXT_PUBLIC_IMAGE_HOSTS | Optional | Comma-separated extra hostnames allowed for remote images |

Ensure `DATABASE_URL` matches your provider format. Example (Neon):
```
postgresql://user:password@ep-xxxxx-pooler.neon.tech/dbname?sslmode=require
```

---
## 3. Setup Database Schema
On your local machine (or via Vercel CLI) run:
```
# Apply migrations
npx prisma migrate deploy
# (Optional) Seed initial data
npx prisma db seed
```
If you prefer to run this in the Vercel cloud after first deploy:
```
vercel exec npx prisma migrate deploy
vercel exec npx prisma db seed
```
(You need Vercel CLI installed locally: `npm i -g vercel`.)

---
## 4. Connect Repository
1. Push your code to GitHub/GitLab/Bitbucket (if not already).
2. In Vercel dashboard: "Add New..." → "Project" → Import the repo.
3. Vercel auto-detects Next.js; no custom build command required.

Default build command: `next build`.
Output directory: `.next`.

---
## 5. Prisma Considerations
- Prisma Client is generated during the build (`postinstall` implicitly runs `prisma generate`). If you encounter errors, add an explicit script:
```
"scripts": {
  "postinstall": "prisma generate",
  ...
}
```
- For serverless / edge performance, avoid long-lived Prisma Client instances outside of recommended pattern. The included `lib/prisma.ts` typically should handle a singleton during development. Ensure it uses the suggested global caching pattern (adjust if needed).
- If using Vercel Postgres or Neon, connection pooling is recommended. Append `?pgbouncer=true` (Neon) or use Vercel's pooled connection string.

---
## 6. Image Domains
`next.config.ts` already allows Unsplash, placehold.co, and flixcart hosts. Add others via `NEXT_PUBLIC_IMAGE_HOSTS` variable or extend `remotePatterns` if necessary.

---
## 7. WhatsApp & Sharing
- `NEXT_PUBLIC_WHATSAPP_NUMBER` must be digits only, international format without `+`.
- Web Share API works only on supported mobile browsers; no extra Vercel configuration needed.

---
## 8. Observability & Logs
After deployment, view logs under "Functions" or "Logs" in Vercel. For database issues, confirm `DATABASE_URL` and migrations applied.

---
## 9. Common Issues
| Symptom | Fix |
|---------|-----|
| Prisma "ENOENT: schema.prisma not found" | Ensure `prisma/` folder is in repo and not ignored. |
| Timeouts on queries | Use pooled connection string; ensure not deploying Prisma to Edge runtime unless supported. |
| Images fail to load | Add domain to `remotePatterns` or pass through `NEXT_PUBLIC_IMAGE_HOSTS`. |
| WhatsApp link invalid | Confirm number formatting; remove plus sign, keep digits only. |
| Seed not applied | Run `prisma db seed` manually using `vercel exec`. |

---
## 10. Manual Deploy (Vercel CLI)
```
vercel login
vercel link   # If not linked
vercel env pull .env.local  # Optional to sync existing env
vercel        # Deploy preview
vercel --prod # Deploy production
```
Set env vars before `vercel --prod` or use dashboard.

---
## 11. Post-Deploy Checklist
- Visit site root and admin page to confirm dynamic data loads.
- Ensure product images render without 404.
- Test WhatsApp button creates proper link.
- (Optional) Run `vercel exec npx prisma studio` is NOT supported; use local Prisma Studio pointed to cloud DB.

---
## 12. Rollbacks
Vercel keeps previous deployments. Use dashboard to roll back if a migration created issues. You may need to revert DB manually (or restore from provider backup) if schema incompatibilities arise.

---
## 13. Scaling Notes
- For large traffic, prefer a pooled Postgres provider and monitor connection counts.
- Consider adding caching (Next.js Route Handlers with `revalidate`) once data stabilizes.
- Introduce indexing in Prisma schema for frequent query fields (e.g., add index on `Product.categoryId`).

---
## 14. Security Tips
- Keep `NEXT_PUBLIC_ADMIN_PASSWORD` non-public by moving admin auth to a server-side check or proper auth solution if you grow beyond prototype.
- Restrict database user privileges to least required (no superuser).

---
### Minimal .env.local Example (for local dev)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/giftshop?schema=public
NEXT_PUBLIC_STORE_NAME=My Gift Shop
NEXT_PUBLIC_WHATSAPP_NUMBER=919791661595
NEXT_PUBLIC_ADMIN_PASSWORD=changeme
NEXT_PUBLIC_IMAGE_HOSTS=example.com,cdn.example.org
```

Deploy confidently! Update this file if deployment strategy changes.
